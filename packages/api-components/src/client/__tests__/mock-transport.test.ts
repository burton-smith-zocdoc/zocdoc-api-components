/**
 * These tests drive the mock through the real endpoint wrappers rather than asserting on
 * its raw responses. That is the point of them: the mock's value is that the client layer
 * cannot tell it apart from the API, so a test that bypassed `searchProviderLocations`
 * would let the envelope drift out of shape without failing.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  rescheduleAppointment,
} from '../appointments.js';
import { getAvailability } from '../availability.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { ZocdocError, ZocdocNotFoundError } from '../errors.js';
import {
  APPOINTMENTS,
  BOOKINGS,
  PROVIDER_LOCATIONS,
  SCENARIOS,
  SPECIALTIES,
} from '../mock/fixtures.js';
import { createMockTransport } from '../mock/transport.js';
import { getProviderLocation, searchProviderLocations } from '../provider-locations.js';
import type { Patient } from '../types.js';

const START_DATE = '2026-08-10';

/**
 * `GET /v1/provider_locations` takes a ZIP *and* one of `specialty_id` or `visit_reason_id`, so
 * every search below carries the specialty the fixture locations are tagged with. Searching on
 * the ZIP alone is a documented 400, which the mock now enforces.
 */
const SEARCH_SPECIALTY_ID = SPECIALTIES[0]!.id;

/**
 * A second specialty only some of the fixture locations carry, which is what gives the specialty
 * filter something to actually drop.
 */
const DENTAL_SPECIALTY_ID = SPECIALTIES.find(
  (specialty) => specialty.care_category === 'dental'
)!.id;

/** Not a person — see the note in `appointments.test.ts`. */
const TEST_PATIENT: Patient = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '9999999999',
  email_address: 'test@example.test',
  patient_address: { address1: '1 Test St', city: 'Brooklyn', state: 'NY', zip_code: '11201' },
};

function booking(providerLocationId: string, insurance?: Patient['insurance']) {
  return {
    providerLocationId,
    visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
    startTime: `${START_DATE}T09:00:00-04:00`,
    patientType: 'new' as const,
    patient: insurance ? { ...TEST_PATIENT, insurance } : TEST_PATIENT,
  };
}

describe('createMockTransport', () => {
  beforeEach(() => {
    configureZocdoc({
      baseUrl: 'https://mock.test',
      getToken: 'tok',
      // Zero latency here; the default 300ms exists for demos, and paying it 12 times
      // would make this file the slowest in the suite for no added coverage.
      transport: createMockTransport({ latencyMs: 0, availabilityStartDate: START_DATE }),
    });
  });

  afterEach(() => {
    resetZocdocConfig();
  });

  describe('provider location search', () => {
    it('rebases root-relative fixture photos onto assetBaseUrl', async () => {
      configureZocdoc({
        baseUrl: 'https://mock.test',
        getToken: 'tok',
        transport: createMockTransport({ latencyMs: 0, assetBaseUrl: '/docs/' }),
      });

      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SEARCH_SPECIALTY_ID,
      });

      const photos = result.providerLocations.map((l) => l.provider.provider_photo_url);
      expect(photos).toContain('/docs/images/michael-scott.png');
      expect(photos.filter(Boolean).every((url) => url?.startsWith('/docs/images/'))).toBe(true);
    });

    it('returns results for the documented populated zip code', async () => {
      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SEARCH_SPECIALTY_ID,
      });

      expect(result.providerLocations.length).toBeGreaterThan(0);
      expect(result.totalCount).toBe(result.providerLocations.length);
    });

    it('rejects a search that carries neither a specialty nor a visit reason', async () => {
      // The mock used to answer this with results, which is how `zd-provider-search` shipped a
      // default state the real API rejects. Keep the mock as strict as the contract.
      await expect(
        searchProviderLocations({ zipCode: SCENARIOS.zipWithResults })
      ).rejects.toBeTruthy();
    });

    it('rejects a zip code that is not five digits', async () => {
      await expect(
        searchProviderLocations({ zipCode: '1120', specialtyId: SEARCH_SPECIALTY_ID })
      ).rejects.toBeTruthy();
    });

    it('searches on a visit reason without a specialty', async () => {
      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
      });

      expect(result.providerLocations.length).toBeGreaterThan(0);
    });

    it('returns empty rather than throwing for the documented empty zip code', async () => {
      // COMP-001 treats empty as its own state, so this must not surface as an error.
      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipEmpty,
        specialtyId: SEARCH_SPECIALTY_ID,
      });

      expect(result.providerLocations).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('throws for the documented error zip code', async () => {
      // The specialty is here so the rejection is the 500 and not the missing-filter 400.
      await expect(
        searchProviderLocations({ zipCode: SCENARIOS.zipError, specialtyId: SEARCH_SPECIALTY_ID })
      ).rejects.toBeTruthy();
    });

    it('throws for the documented missing insurance plan', async () => {
      await expect(
        searchProviderLocations({
          zipCode: SCENARIOS.zipWithResults,
          specialtyId: SEARCH_SPECIALTY_ID,
          insurancePlanId: SCENARIOS.insurancePlanMissing,
        })
      ).rejects.toBeTruthy();
    });

    it('filters to virtual providers on visit_type', async () => {
      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SEARCH_SPECIALTY_ID,
        visitType: 'video_visit',
      });

      expect(result.providerLocations.length).toBeGreaterThan(0);
      for (const location of result.providerLocations) {
        expect(location.provider_location_type).toBe('virtual_provider');
      }
    });

    it('drops locations that do not carry the requested specialty', async () => {
      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: DENTAL_SPECIALTY_ID,
      });

      // Both directions, because either alone passes for the wrong reason: an empty answer would
      // satisfy the loop, and an unfiltered one would satisfy the count.
      expect(result.providerLocations.length).toBeGreaterThan(0);
      expect(result.providerLocations.length).toBeLessThan(PROVIDER_LOCATIONS.length);
      for (const location of result.providerLocations) {
        expect(location.provider.specialty_ids).toContain(DENTAL_SPECIALTY_ID);
      }
    });

    it('pages, reporting the unpaged total alongside the page', async () => {
      const first = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SEARCH_SPECIALTY_ID,
        pageSize: 1,
      });
      const second = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SEARCH_SPECIALTY_ID,
        pageSize: 1,
        page: 1,
      });

      expect(first.providerLocations).toHaveLength(1);
      expect(second.providerLocations).toHaveLength(1);
      expect(first.totalCount).toBeGreaterThan(1);
      // A page that repeated itself would still satisfy the length assertions above.
      expect(second.providerLocations[0]?.provider_location_id).not.toBe(
        first.providerLocations[0]?.provider_location_id
      );
    });

    it('exposes a location whose booking requirements force extra form fields', async () => {
      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SEARCH_SPECIALTY_ID,
      });

      const required = result.providerLocations.find(
        (l) => l.provider_location_id === SCENARIOS.providerLocationInsuranceRequired
      );
      // Task 13's conditional fields key off these dotted paths, so the fixture has to
      // supply a location that actually has some.
      expect(required?.booking_requirements?.required_fields).toContain(
        'data.patient.insurance.insurance_plan_id'
      );
    });
  });

  describe('availability', () => {
    const PL_ID = 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';

    it('spreads slots across the default window for a normal provider location', async () => {
      const result = await getAvailability({
        providerLocationIds: [PL_ID],
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.provider_location_id).toBe(PL_ID);

      const days = [...new Set((result[0]?.timeslots ?? []).map((s) => s.start_time.slice(0, 10)))];

      // The real endpoint defaults to a week when the request names no window, and the
      // mock has to match: a picker asking for seven days and getting one back would look
      // like a component bug. The first day is the pinned one, and every day falls inside
      // the window — not every day *is* in it, because the generator leaves gaps for
      // closed days on purpose.
      expect(days[0]).toBe(START_DATE);
      expect(days.length).toBeGreaterThan(1);
      for (const day of days) {
        const offset =
          (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${START_DATE}T00:00:00Z`)) / 86_400_000;
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThan(7);
      }
    });

    it('honours an explicitly requested window', async () => {
      const result = await getAvailability({
        providerLocationIds: [PL_ID],
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
        startDate: START_DATE,
        endDate: START_DATE,
      });

      const days = [...new Set((result[0]?.timeslots ?? []).map((s) => s.start_time.slice(0, 10)))];

      expect(days).toEqual([START_DATE]);
    });

    it('generates distinct slot times', async () => {
      // Regression: an earlier generator floored half-hour offsets and emitted 09:00
      // twice, which a picker would render as two identical, indistinguishable buttons.
      const result = await getAvailability({
        providerLocationIds: [PL_ID],
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
      });

      const times = (result[0]?.timeslots ?? []).map((s) => s.start_time);
      expect(new Set(times).size).toBe(times.length);
    });

    it('returns the no-availability sentinel present but empty', async () => {
      // The endpoint answers about every requested location, so "no slots" is an entry
      // with an empty array — not a missing entry, which would read as "never asked".
      const result = await getAvailability({
        providerLocationIds: [SCENARIOS.providerLocationNoAvailability],
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.timeslots).toEqual([]);
    });

    it('answers about every requested location, in order', async () => {
      const ids = [PL_ID, SCENARIOS.providerLocationNoAvailability];

      const result = await getAvailability({
        providerLocationIds: ids,
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
      });

      expect(result.map((entry) => entry.provider_location_id)).toEqual(ids);
    });

    it('throws for the documented error provider location', async () => {
      await expect(
        getAvailability({
          providerLocationIds: [SCENARIOS.providerLocationError],
          visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
          patientType: 'new',
        })
      ).rejects.toBeTruthy();
    });
  });

  describe('provider location by id', () => {
    it('returns a fixture location by its id', async () => {
      const fixture = PROVIDER_LOCATIONS[0]!;

      const location = await getProviderLocation(fixture.provider_location_id);

      expect(location).toEqual(fixture);
    });

    it('rebases the photo onto assetBaseUrl, as search does', async () => {
      configureZocdoc({
        baseUrl: 'https://mock.test',
        getToken: 'tok',
        transport: createMockTransport({ latencyMs: 0, assetBaseUrl: '/docs/' }),
      });

      const location = await getProviderLocation(PROVIDER_LOCATIONS[0]!.provider_location_id);

      expect(location.provider.provider_photo_url).toBe('/docs/images/michael-scott.png');
    });

    it('answers every documented appointment location with a provider carrying that id', async () => {
      for (const { providerLocationId } of Object.values(APPOINTMENTS)) {
        const location = await getProviderLocation(providerLocationId);
        expect(location.provider_location_id).toBe(providerLocationId);
        expect(location.provider.last_name).toBeTruthy();
      }
    });

    it('returns 500 for the documented error location', async () => {
      await expect(getProviderLocation(SCENARIOS.providerLocationError)).rejects.toMatchObject({
        status: 500,
      });
    });

    it('returns 404 for an unknown id', async () => {
      await expect(getProviderLocation('pr_unknown|lo_unknown')).rejects.toBeInstanceOf(
        ZocdocNotFoundError
      );
    });

    it('leaves availability and deeper paths on their own routes', async () => {
      const transport = createMockTransport({ latencyMs: 0, availabilityStartDate: START_DATE });
      const id = encodeURIComponent(PROVIDER_LOCATIONS[0]!.provider_location_id);

      const availability = await getAvailability({
        providerLocationIds: [PROVIDER_LOCATIONS[0]!.provider_location_id],
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
      });
      const mappings = await transport(
        `https://mock.test/v1/provider_locations/${id}/insurance_mappings`,
        {}
      );

      expect(availability).toHaveLength(1);
      expect(mappings.status).toBe(501);
    });
  });

  describe('appointment management', () => {
    async function statusOf(error: Promise<unknown>): Promise<number | undefined> {
      const caught = await error.catch((e: unknown) => e);
      return caught instanceof ZocdocError ? caught.status : undefined;
    }

    it('looks up every documented appointment with its own location and visit reason', async () => {
      for (const [id, fixture] of Object.entries(APPOINTMENTS)) {
        const appointment = await getAppointment(id);

        expect(appointment).toMatchObject({
          appointment_id: id,
          appointment_status: fixture.status,
          provider_location_id: fixture.providerLocationId,
          visit_reason_id: fixture.visitReasonId,
          patient_type: fixture.patientType,
        });
        // Offset kept, as the API sends it.
        expect(appointment.start_time).toMatch(/T09:00:00-04:00$/);
        expect(appointment.location_phone_number).toMatch(/^\d{10}$/);
      }
    });

    it('returns 404 for the documented not-found id and for unknown ids', async () => {
      await expect(getAppointment(SCENARIOS.appointmentNotFound)).rejects.toBeInstanceOf(
        ZocdocNotFoundError
      );
      await expect(getAppointment('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
        ZocdocNotFoundError
      );
    });

    it('returns 500 for the documented error id on all three endpoints', async () => {
      const id = SCENARIOS.appointmentError;

      expect(await statusOf(getAppointment(id))).toBe(500);
      expect(await statusOf(cancelAppointment({ appointmentId: id }))).toBe(500);
      expect(
        await statusOf(
          rescheduleAppointment({ appointmentId: id, startTime: '2026-08-06T14:00:00-04:00' })
        )
      ).toBe(500);
    });

    it('cancels a confirmed appointment', async () => {
      const result = await cancelAppointment({
        appointmentId: SCENARIOS.appointmentConfirmed,
        reasonType: 'patient_no_longer_available',
      });

      expect(result).toEqual({
        appointment_id: SCENARIOS.appointmentConfirmed,
        appointment_status: 'cancelled',
      });
    });

    it('returns 409 for an appointment that is already cancelled or a no-show', async () => {
      expect(
        await statusOf(cancelAppointment({ appointmentId: SCENARIOS.appointmentCancelled }))
      ).toBe(409);
      expect(
        await statusOf(cancelAppointment({ appointmentId: SCENARIOS.appointmentNoShow }))
      ).toBe(409);
    });

    it('reschedules a confirmed appointment', async () => {
      const result = await rescheduleAppointment({
        appointmentId: SCENARIOS.appointmentConfirmed,
        startTime: '2026-08-06T14:00:00-04:00',
      });

      expect(result).toMatchObject({
        appointment_id: SCENARIOS.appointmentConfirmed,
        appointment_status: 'rescheduled',
      });
    });

    it('rejects rescheduling a status the spec does not allow', async () => {
      const startTime = '2026-08-06T14:00:00-04:00';

      expect(
        await statusOf(
          rescheduleAppointment({ appointmentId: SCENARIOS.appointmentBookingFailed, startTime })
        )
      ).toBe(400);
      expect(
        await statusOf(
          rescheduleAppointment({ appointmentId: SCENARIOS.appointmentCancelled, startTime })
        )
      ).toBe(400);
    });

    it('uses the same appointment ids as booking', () => {
      // A demo that books then manages must land on the same fixture.
      for (const { appointmentId, status } of Object.values(BOOKINGS)) {
        expect(APPOINTMENTS[appointmentId]?.status).toBe(status);
      }
    });
  });

  describe('booking', () => {
    it('returns the documented status and appointment id for every sentinel', async () => {
      // Table-driven over all eight, because a UI that renders only the happy path is the
      // most likely defect here and each status needs its own wording. Booked in parallel
      // since the mock keeps no state, so the order they resolve in cannot matter.
      const results = await Promise.all(
        Object.entries(BOOKINGS).map(async ([locationId, expected]) => ({
          expected,
          actual: await createAppointment(booking(locationId)),
        }))
      );

      for (const { expected, actual } of results) {
        expect(actual.appointment_status).toBe(expected.status);
        expect(actual.appointment_id).toBe(expected.appointmentId);
      }
    });

    it('confirms a location with no documented sentinel', async () => {
      const result = await createAppointment(
        booking('pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890')
      );

      expect(result.appointment_status).toBe('confirmed');
    });

    it('reports a video visit type for a virtual location', async () => {
      const result = await createAppointment(
        booking('pr_ghi123-jkl456_mnop7890|lo_ghi123-jkl456_mnop7890')
      );

      expect(result.visit_type).toBe('zocdoc_video_service');
    });

    /* Unformatted ten digits, the shape the response documents — not the location's own. */
    it('returns the practice phone, unformatted', async () => {
      const result = await createAppointment(
        booking('pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890')
      );

      expect(result.location_phone_number).toMatch(/^\d{10}$/);
      expect(result.location_phone_extension).toBeNull();
    });

    it('returns an https: waiting room for a video visit and null in person', async () => {
      const video = await createAppointment(
        booking('pr_ghi123-jkl456_mnop7890|lo_ghi123-jkl456_mnop7890')
      );
      const inPerson = await createAppointment(
        booking('pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890')
      );

      expect(new URL(video.waiting_room_path!).protocol).toBe('https:');
      expect(inPerson.waiting_room_path).toBeNull();
    });

    it('rejects a booking that omits the fields the location requires', async () => {
      await expect(
        createAppointment(booking(SCENARIOS.providerLocationInsuranceRequired))
      ).rejects.toBeTruthy();
    });

    it('accepts that same booking once the insurance fields are supplied', async () => {
      const result = await createAppointment(
        booking(SCENARIOS.providerLocationInsuranceRequired, {
          insurance_plan_id: 'ip_9111',
          insurance_member_id: 'TEST123456',
        })
      );

      expect(result.appointment_status).toBe('confirmed');
    });

    it('rejects self-pay where the provider does not accept it', async () => {
      await expect(
        createAppointment(
          booking(SCENARIOS.providerLocationSelfPayNotAccepted, {
            is_self_pay: true,
          })
        )
      ).rejects.toBeTruthy();
    });

    it('rejects an insurance plan at an in-network-only provider', async () => {
      await expect(
        createAppointment(
          booking(SCENARIOS.providerLocationInNetworkOnly, {
            insurance_plan_id: 'ip_9111',
          })
        )
      ).rejects.toBeTruthy();
    });

    it('throws for the documented error provider location', async () => {
      await expect(
        createAppointment(booking(SCENARIOS.providerLocationError))
      ).rejects.toBeTruthy();
    });

    it('echoes back notes without storing anything', async () => {
      const result = await createAppointment({
        ...booking(SCENARIOS.providerLocationConfirmed),
        notes: 'Test note.',
      });

      expect(result.notes).toBe('Test note.');
    });
  });

  it('fails loudly on an unrouted path instead of imitating a 404', async () => {
    // A silent 404 here would look like a real not-found and send a component into its
    // empty state, hiding the fact that the mock is simply missing a handler.
    const transport = createMockTransport({ latencyMs: 0 });

    const response = await transport('https://mock.test/v1/not_implemented', {});

    expect(response.status).toBe(501);
  });

  it('delays by the configured latency so a loading state is observable', async () => {
    const transport = createMockTransport({ latencyMs: 40 });

    const started = performance.now();
    await transport('https://mock.test/v1/specialties', {});

    // Asserting only that time passed, not how much: a tighter bound would flake on a
    // loaded CI box, and the behaviour under test is "does not resolve instantly".
    expect(performance.now() - started).toBeGreaterThanOrEqual(30);
  });
});
