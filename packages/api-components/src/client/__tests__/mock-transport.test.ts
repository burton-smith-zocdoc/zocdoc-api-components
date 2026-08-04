/**
 * These tests drive the mock through the real endpoint wrappers rather than asserting on
 * its raw responses. That is the point of them: the mock's value is that the client layer
 * cannot tell it apart from the API, so a test that bypassed `searchProviderLocations`
 * would let the envelope drift out of shape without failing.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAppointment } from '../appointments.js';
import { getAvailability } from '../availability.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { BOOKINGS, SCENARIOS } from '../mock/fixtures.js';
import { createMockTransport } from '../mock/transport.js';
import { searchProviderLocations } from '../provider-locations.js';
import type { Patient } from '../types.js';

const START_DATE = '2026-08-10';

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
    it('returns results for the documented populated zip code', async () => {
      const result = await searchProviderLocations({ zipCode: SCENARIOS.zipWithResults });

      expect(result.providerLocations.length).toBeGreaterThan(0);
      expect(result.totalCount).toBe(result.providerLocations.length);
    });

    it('returns empty rather than throwing for the documented empty zip code', async () => {
      // COMP-001 treats empty as its own state, so this must not surface as an error.
      const result = await searchProviderLocations({ zipCode: SCENARIOS.zipEmpty });

      expect(result.providerLocations).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('throws for the documented error zip code', async () => {
      await expect(searchProviderLocations({ zipCode: SCENARIOS.zipError })).rejects.toBeTruthy();
    });

    it('throws for the documented missing insurance plan', async () => {
      await expect(
        searchProviderLocations({
          zipCode: SCENARIOS.zipWithResults,
          insurancePlanId: SCENARIOS.insurancePlanMissing,
        })
      ).rejects.toBeTruthy();
    });

    it('filters to virtual providers on visit_type', async () => {
      const result = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
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
        specialtyId: 'sp_154',
      });

      expect(result.providerLocations).toEqual([]);
    });

    it('pages, reporting the unpaged total alongside the page', async () => {
      const first = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
        pageSize: 1,
      });
      const second = await searchProviderLocations({
        zipCode: SCENARIOS.zipWithResults,
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
      const result = await searchProviderLocations({ zipCode: SCENARIOS.zipWithResults });

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

    it('returns slots on the requested date for a normal provider location', async () => {
      const result = await getAvailability({
        providerLocationIds: [PL_ID],
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.provider_location_id).toBe(PL_ID);
      expect(result[0]?.timeslots?.length).toBeGreaterThan(0);
      for (const slot of result[0]?.timeslots ?? []) {
        expect(slot.start_time.startsWith(START_DATE)).toBe(true);
      }
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
