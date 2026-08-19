import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import * as referenceData from '../../client/reference-data.js';
import { ZocdocError } from '../../client/errors.js';
import { BOOKINGS, SCENARIOS } from '../../client/mock/fixtures.js';
import type {
  AppointmentResponseData,
  AppointmentStatus,
  Patient,
  ProviderLocation,
} from '../../client/types.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { dayFromToday } from '../../utils/test/dates.js';
import { mount, part, queryPart, settled, shadow } from '../../utils/test/mount.js';
import './index.js';

/**
 * Every client module the five children touch is mocked, not just the one this component
 * calls (TEST-002). A coordinator mounts its children for real, so an unmocked reference-data
 * or availability request would leave the tests depending on the network.
 */
vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });
vi.mock('../../client/provider-locations.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

type Flow = HTMLElement & {
  providers: ProviderLocation[];
  providerLocationId?: string;
  startTime?: string;
  visitReasonId?: string;
  patientType: 'new' | 'existing';
  step: string;
  back(): void;
};

/** From the documented testing-data guide, so no field looks like a real patient (PHI-002). */
const TEST_PATIENT: Patient = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '2125550001',
  email_address: 'test.patient@example.test',
  patient_address: {
    address1: '1 Test Street',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: SCENARIOS.zipWithResults,
  },
};

const START_TIME = '2026-08-05T09:00:00-04:00';

const PROVIDER: ProviderLocation = {
  provider_location_id: SCENARIOS.providerLocationConfirmed,
  provider: {
    provider_id: 'pr_confirmed',
    full_name: 'Dr. Ada Testerson',
    default_visit_reason_id: 'vr_default',
  },
  location: {
    address1: '1 Sandbox Plaza',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: SCENARIOS.zipWithResults,
  },
};

/** The confirmed sentinel's own response, so the mock and the real sandbox agree. */
function bookingResponse(status: AppointmentStatus): AppointmentResponseData {
  return {
    appointment_id: BOOKINGS[SCENARIOS.providerLocationConfirmed]!.appointmentId,
    appointment_status: status,
    is_provider_resource: true,
    confirmation_type: 'auto',
    visit_type: 'in_person',
  };
}

/** The component the flow renders for the current step — there is only ever one. */
function child(element: Flow, name: string): HTMLElement {
  return part(element, name);
}

/** The dialog `modal` mode renders, which is present whether or not it is open. */
function dialog(element: Flow): HTMLElement & { open: boolean } {
  return part<HTMLElement & { open: boolean }>(element, 'dialog');
}

/** Drives the flow to the time step the way the results list does, by event. */
async function toTimeStep(element: Flow): Promise<void> {
  element.providers = [PROVIDER];
  await settled(element);

  child(element, 'results').dispatchEvent(
    new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
  );
  await settled(element);
}

/** Drives the flow to the patient step the way the children do, by event. */
async function toPatientStep(element: Flow): Promise<void> {
  await toTimeStep(element);

  child(element, 'picker').dispatchEvent(
    new CustomEvent('slot-select', {
      detail: { startTime: START_TIME, providerLocationId: PROVIDER.provider_location_id },
    })
  );
  await settled(element);
}

function submitPatient(element: Flow): void {
  child(element, 'patient-form').dispatchEvent(
    new CustomEvent('patient-submit', { detail: { patient: TEST_PATIENT } })
  );
}

describe('zd-booking', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'createAppointment').mockResolvedValue(bookingResponse('confirmed'));
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getVisitReasons').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountFlow(attributes = ''): Promise<Flow> {
    return mount<Flow>(
      `<zd-booking zip-code="${SCENARIOS.zipWithResults}" ${attributes}></zd-booking>`
    );
  }

  it('renders the search step first', async () => {
    const element = await mountFlow();

    expect(element.step).toBe('search');
    expect(shadow(element).querySelector('[part="search"]')).not.toBeNull();
    expect(shadow(element).querySelector('[part="picker"]')).toBeNull();
  });

  // The search component says this itself from its own empty state. Two components answering
  // the same question would announce it twice.
  it('does not render the results list until a search returns something', async () => {
    const element = await mountFlow();
    expect(shadow(element).querySelector('[part="results"]')).toBeNull();

    element.providers = [PROVIDER];
    await settled(element);

    expect(shadow(element).querySelector('[part="results"]')).not.toBeNull();
  });

  it('passes the selected provider down to the availability picker', async () => {
    const element = await mountFlow('visit-reason-id="vr_1"');
    element.providers = [PROVIDER];
    await settled(element);

    child(element, 'results').dispatchEvent(
      new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
    );
    await settled(element);

    const picker = child(element, 'picker') as HTMLElement & {
      providerLocationId?: string;
      visitReasonId?: string;
    };
    expect(element.step).toBe('time');
    expect(picker.providerLocationId).toBe(PROVIDER.provider_location_id);
    expect(picker.visitReasonId).toBe('vr_1');
  });

  /*
   * The picker renders the New/Existing control, but the same value has to go to
   * POST /v1/appointments — which this component sends. A patient who says they are returning and
   * is then booked as new is a wrong booking, so following the event is not cosmetic.
   */
  it('follows the picker’s patient type through to the booking', async () => {
    const element = await mountFlow('visit-reason-id="vr_1"');
    element.providers = [PROVIDER];
    await settled(element);

    child(element, 'results').dispatchEvent(
      new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
    );
    await settled(element);

    child(element, 'picker').dispatchEvent(
      new CustomEvent('patient-type-change', { detail: { patientType: 'existing' } })
    );
    await settled(element);

    expect(element.patientType).toBe('existing');

    child(element, 'picker').dispatchEvent(
      new CustomEvent('slot-select', {
        detail: { startTime: START_TIME, providerLocationId: PROVIDER.provider_location_id },
      })
    );
    await settled(element);
    submitPatient(element);

    await vi.waitFor(() => expect(appointments.createAppointment).toHaveBeenCalled());
    expect(vi.mocked(appointments.createAppointment).mock.calls.at(-1)![0].patientType).toBe(
      'existing'
    );
  });

  /*
   * The summary is the same block as the card in the results list (`renderProviderSummary`),
   * so what the patient is about to book is described the way they chose it — the address
   * included, since that is what they are travelling to.
   */
  it('restates the whole provider, not just their name, before booking', async () => {
    const element = await mountFlow('visit-reason-id="vr_1"');
    element.providers = [PROVIDER];
    await settled(element);

    child(element, 'results').dispatchEvent(
      new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
    );
    await settled(element);

    const summary = child(element, 'summary');
    const providerSummary = summary.querySelector('[part="provider-summary"]');
    const providerShadow = providerSummary?.shadowRoot;
    expect(providerShadow?.querySelector('[part="name"]')?.textContent).toContain(
      'Dr. Ada Testerson'
    );
    expect(providerShadow?.querySelector('[part="location"]')?.textContent).toContain(
      '1 Sandbox Plaza'
    );
    // The time step is where the time is being chosen; restating it above the control is noise.
    expect(summary.querySelector('[part="summary-time"]')).toBeNull();
  });

  it('adds the chosen time to the summary on the patient step', async () => {
    const element = await mountFlow('visit-reason-id="vr_1"');
    await toPatientStep(element);

    const summary = child(element, 'summary');
    const providerSummary = summary.querySelector('[part="provider-summary"]');
    expect(providerSummary?.shadowRoot?.querySelector('[part="name"]')).not.toBeNull();
    expect(summary.querySelector('[part="summary-time"]')?.textContent).toBeTruthy();
  });

  /**
   * "Any reason" leaves `visitReasonId` undefined, and the picker fetches nothing without one.
   * The provider's own default is what the API itself substitutes, so the flow uses it rather
   * than stranding the patient on an empty picker.
   */
  it('falls back to the provider default visit reason when none was chosen', async () => {
    const element = await mountFlow();
    element.providers = [PROVIDER];
    await settled(element);

    child(element, 'results').dispatchEvent(
      new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
    );
    await settled(element);

    const picker = child(element, 'picker') as HTMLElement & { visitReasonId?: string };
    expect(picker.visitReasonId).toBe('vr_default');
  });

  /**
   * The reason the results were produced for beats the provider's own default, which is a
   * different reason on any location whose default is not the specialty's. Asking for
   * availability under a reason the search did not use can offer slots it would not have
   * matched.
   */
  it('prefers the visit reason the search resolved over the provider default', async () => {
    const element = await mountFlow('specialty-id="sp_153"');

    child(element, 'search').dispatchEvent(
      new CustomEvent('provider-results', {
        detail: {
          providers: [PROVIDER],
          zipCode: SCENARIOS.zipWithResults,
          specialtyId: 'sp_153',
          visitReasonId: undefined,
          searchParameters: { specialty_id: 'sp_153', visit_reason_id: 'vr_resolved' },
        },
      })
    );
    await settled(element);

    child(element, 'results').dispatchEvent(
      new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
    );
    await settled(element);

    const picker = child(element, 'picker') as HTMLElement & { visitReasonId?: string };
    expect(picker.visitReasonId).toBe('vr_resolved');
  });

  /**
   * A host page that ran its own search hands the results in and names one of them, which is
   * what `providers` is public for — the demo's assistant panel is exactly this.
   *
   * The selection has to be resolved from `providers` rather than only from the results list's
   * event, or the flow reaches the time step knowing an id and nothing else: the summary loses
   * the provider it is supposed to restate, and a flow with no chosen visit reason has no
   * default to fall back to and so never fetches.
   */
  it('resolves a provider named from outside against the results handed in', async () => {
    const element = await mountFlow();
    element.providers = [PROVIDER];
    element.providerLocationId = PROVIDER.provider_location_id;
    await settled(element);

    expect(element.step).toBe('time');

    const providerSummary = child(element, 'summary').querySelector('[part="provider-summary"]');
    expect(providerSummary?.shadowRoot?.querySelector('[part="name"]')?.textContent).toContain(
      'Dr. Ada Testerson'
    );

    const picker = child(element, 'picker') as HTMLElement & { visitReasonId?: string };
    expect(picker.visitReasonId).toBe('vr_default');
  });

  /**
   * An id that matches nothing in `providers` — a deep link, or a page that named a provider it
   * never handed in — drops the provider block rather than leaving the last one under it. The
   * step still runs: the picker fetches from the id, and it is the restatement that goes, because
   * a summary naming a provider the flow is no longer booking is worse than no summary.
   */
  it('drops the restated provider when an id matches nothing handed in', async () => {
    const element = await mountFlow('visit-reason-id="vr_1"');
    await toTimeStep(element);

    element.providerLocationId = 'pr_absent|lo_absent';
    await settled(element);

    expect(element.step).toBe('time');
    expect(queryPart(element, 'provider-summary')).toBeNull();
    expect(queryPart(element, 'picker')).not.toBeNull();
  });

  /*
   * Paging is a circle through this component and nothing else: the list emits `page-change`,
   * the flow moves `page`, and the search refetches because its own `page` moved. Neither child
   * knows the other exists (COMP-002), which is what lets a host page swap either one out.
   */
  describe('paging', () => {
    /** The paging numbers only exist on the envelope, so only the search event carries them. */
    function searchReturned(element: Flow, page: number, totalCount = 25): void {
      child(element, 'search').dispatchEvent(
        new CustomEvent('provider-results', {
          detail: {
            providers: [PROVIDER],
            totalCount,
            page,
            pageSize: 10,
            zipCode: SCENARIOS.zipWithResults,
            specialtyId: 'sp_153',
          },
        })
      );
    }

    it('hands the results list the totals it needs to page', async () => {
      const element = await mountFlow('specialty-id="sp_153"');
      searchReturned(element, 0);
      await settled(element);

      const results = child(element, 'results') as HTMLElement & {
        totalCount?: number;
        page: number;
        pageSize: number;
      };
      expect(results.totalCount).toBe(25);
      expect(results.page).toBe(0);
      expect(results.pageSize).toBe(10);
    });

    it('passes a page the list asked for down to the search', async () => {
      const element = await mountFlow('specialty-id="sp_153"');
      searchReturned(element, 0);
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('page-change', { detail: { page: 1 } })
      );
      await settled(element);

      const search = child(element, 'search') as HTMLElement & { page: number };
      expect(search.page).toBe(1);
    });

    /*
     * The list keeps the page in hand rather than the page requested. Showing page two's number
     * over page one's providers would tell the patient the wrong thing about what they are
     * looking at, and the search's own loading state is what covers the gap.
     */
    it('keeps the criteria a page change did not touch', async () => {
      const element = await mountFlow('specialty-id="sp_153"');
      searchReturned(element, 0);
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('page-change', { detail: { page: 2 } })
      );
      searchReturned(element, 2);
      await settled(element);

      const search = child(element, 'search') as HTMLElement & {
        page: number;
        zipCode: string;
        specialtyId?: string;
      };
      expect(search.page).toBe(2);
      expect(search.zipCode).toBe(SCENARIOS.zipWithResults);
      expect(search.specialtyId).toBe('sp_153');
    });
  });

  describe('availability for the results list', () => {
    /** A second location, so a batch has more than one id to prove it batched. */
    const OTHER_PROVIDER: ProviderLocation = {
      provider_location_id: SCENARIOS.providerLocationNoAvailability,
      provider: { provider_id: 'pr_other', full_name: 'Dr. Bo Sampleton' },
    };

    /**
     * The visit reason is part of the detail because the search echoes back what it used, and the
     * handler takes the criteria from the event — an event that omits it is a search that ran
     * without one, which is the "Any reason" case rather than an incomplete fixture.
     *
     * A flag rather than an optional id, because passing `undefined` for a parameter with a
     * default gets the default — which is how this helper first reported the opposite of the truth.
     */
    function searchReturned(
      element: Flow,
      providers = [PROVIDER, OTHER_PROVIDER],
      withVisitReason = true
    ): void {
      child(element, 'search').dispatchEvent(
        new CustomEvent('provider-results', {
          detail: {
            providers,
            totalCount: 25,
            page: 0,
            pageSize: 10,
            visitReasonId: withVisitReason ? 'vr_1' : undefined,
          },
        })
      );
    }

    function resultsList(element: Flow): HTMLElement & {
      availability?: unknown[];
      availabilityStart?: string;
      availabilityDays: number;
    } {
      return child(element, 'results') as HTMLElement & {
        availability?: unknown[];
        availabilityStart?: string;
        availabilityDays: number;
      };
    }

    /*
     * The whole reason this lives in the coordinator: the endpoint takes an array, so a page of
     * providers is one request. Ten cards fetching for themselves would be ten.
     */
    it('asks for the whole page in one request', async () => {
      const getAvailability = vi.spyOn(availability, 'getAvailability');
      const element = await mountFlow('visit-reason-id="vr_1"');
      searchReturned(element);
      await settled(element);

      expect(getAvailability).toHaveBeenCalledTimes(1);
      expect(getAvailability.mock.calls[0]![0]).toMatchObject({
        providerLocationIds: [PROVIDER.provider_location_id, OTHER_PROVIDER.provider_location_id],
        visitReasonId: 'vr_1',
        startDate: dayFromToday(0),
        endDate: dayFromToday(13),
      });
    });

    /*
     * "Any reason" is a real choice in the search form and leaves no visit reason behind, but the
     * availability endpoint requires one. The list goes without counts rather than the flow
     * sending a request that would 400.
     */
    it('asks for nothing when no visit reason can be resolved', async () => {
      const getAvailability = vi.spyOn(availability, 'getAvailability');
      const element = await mountFlow('specialty-id="sp_153"');
      searchReturned(
        element,
        [{ provider_location_id: 'pr_x|lo_x', provider: { provider_id: 'pr_x' } }],
        false
      );
      await settled(element);

      expect(getAvailability).not.toHaveBeenCalled();
      expect(resultsList(element).availability).toBeUndefined();
    });

    it('hands the batch down to the list with the window it covers', async () => {
      vi.spyOn(availability, 'getAvailability').mockResolvedValue([
        { provider_location_id: PROVIDER.provider_location_id, timeslots: [] },
      ]);
      const element = await mountFlow('visit-reason-id="vr_1"');
      searchReturned(element);
      await settled(element);

      const results = resultsList(element);
      expect(results.availability).toHaveLength(1);
      expect(results.availabilityStart).toBe(dayFromToday(0));
      expect(results.availabilityDays).toBe(14);
    });

    /* The list moves its own dates; fetching the range it moved to is this component's half. */
    it('refetches the window the list moved to', async () => {
      const getAvailability = vi.spyOn(availability, 'getAvailability');
      const element = await mountFlow('visit-reason-id="vr_1"');
      searchReturned(element);
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('window-change', {
          detail: { startDate: dayFromToday(14), endDate: dayFromToday(27) },
        })
      );
      await settled(element);

      expect(getAvailability).toHaveBeenCalledTimes(2);
      expect(getAvailability.mock.calls[1]![0]).toMatchObject({
        startDate: dayFromToday(14),
        endDate: dayFromToday(27),
      });
    });

    /*
     * Silent by design. The counts are an enhancement over a list that already works, so the
     * grids go and nothing is said — and dropping the entries rather than keeping the stale set is
     * what stops the list showing one window's dates over another window's counts.
     */
    it('drops the grids and emits availability-error when the batch fails', async () => {
      vi.spyOn(availability, 'getAvailability').mockRejectedValue(
        new ZocdocError('Availability unavailable', 500)
      );
      const element = await mountFlow('visit-reason-id="vr_1"');
      const events: CustomEvent[] = [];
      element.addEventListener('availability-error', (event) => events.push(event as CustomEvent));

      searchReturned(element);
      await settled(element);
      await settled(element);

      expect(events).toHaveLength(1);
      expect(resultsList(element).availability).toBeUndefined();
      // The failure is not rendered anywhere, which is the part worth pinning: no message means
      // no risk of putting the API's own words in front of a patient (CLIENT-003).
      expect(shadow(element).textContent).not.toContain('unavailable');
    });

    /*
     * The window pager is a button a patient can press faster than the API answers, and responses
     * are not guaranteed to arrive in order. The first request here resolves last; if it were
     * allowed to land, the counts would be for a window nobody is looking at.
     */
    it('ignores a response that has been overtaken', async () => {
      const first: unknown[] = [
        { provider_location_id: PROVIDER.provider_location_id, timeslots: [] },
      ];
      const second: unknown[] = [];
      let releaseFirst: (() => void) | undefined;

      vi.spyOn(availability, 'getAvailability')
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              releaseFirst = () => resolve(first as never);
            })
        )
        .mockResolvedValueOnce(second as never);

      const element = await mountFlow('visit-reason-id="vr_1"');
      searchReturned(element);
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('window-change', {
          detail: { startDate: dayFromToday(14), endDate: dayFromToday(27) },
        })
      );
      await settled(element);

      releaseFirst?.();
      await settled(element);
      await settled(element);

      const results = resultsList(element);
      expect(results.availability).toBe(second);
      expect(results.availabilityStart).toBe(dayFromToday(14));
    });

    /*
     * Both halves of a day cell have to survive the step change. Landing on the right provider but
     * the wrong day is the failure this asserts against: the patient pressed a date, and a picker
     * that opens on the provider's first available one instead has quietly answered a different
     * question.
     */
    it('opens the picker on the day chosen on a card', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      searchReturned(element);
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('day-select', {
          detail: { day: dayFromToday(2), provider: OTHER_PROVIDER },
        })
      );
      await settled(element);

      expect(element.step).toBe('time');
      expect(element.providerLocationId).toBe(OTHER_PROVIDER.provider_location_id);
      expect((child(element, 'picker') as HTMLElement & { startDate?: string }).startDate).toBe(
        dayFromToday(2)
      );
    });

    /* Pressing the card rather than one of its cells asks for no particular day. */
    it('leaves the picker on its own first available day when the card itself is chosen', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      searchReturned(element);
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('provider-select', { detail: { provider: OTHER_PROVIDER } })
      );
      await settled(element);

      expect(
        (child(element, 'picker') as HTMLElement & { startDate?: string }).startDate
      ).toBeUndefined();
    });

    /*
     * And going back past the provider takes the day with it, so a second card pressed plainly does
     * not inherit the first card's cell.
     */
    it('drops the chosen day when going back past the provider', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      searchReturned(element);
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('day-select', {
          detail: { day: dayFromToday(2), provider: OTHER_PROVIDER },
        })
      );
      await settled(element);

      element.back();
      await settled(element);

      child(element, 'results').dispatchEvent(
        new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
      );
      await settled(element);

      expect(
        (child(element, 'picker') as HTMLElement & { startDate?: string }).startDate
      ).toBeUndefined();
    });
  });

  it('books the appointment and emits booking-complete', async () => {
    const element = await mountFlow('visit-reason-id="vr_1"');
    await toPatientStep(element);

    const events: CustomEvent[] = [];
    element.addEventListener('booking-complete', (event) => events.push(event as CustomEvent));

    submitPatient(element);
    await vi.waitFor(() => expect(events).toHaveLength(1));
    await settled(element);

    expect(appointments.createAppointment).toHaveBeenCalledTimes(1);
    expect(appointments.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        providerLocationId: PROVIDER.provider_location_id,
        visitReasonId: 'vr_1',
        startTime: START_TIME,
        patientType: 'new',
      })
    );
    expect(events[0]!.detail).toMatchObject({
      appointmentId: BOOKINGS[SCENARIOS.providerLocationConfirmed]!.appointmentId,
      status: 'confirmed',
    });
    expect(element.step).toBe('booked');
    expect(shadow(element).querySelector('[part="confirmation"]')).not.toBeNull();
  });

  it('emits booking-error and stays on the form when the POST fails', async () => {
    vi.mocked(appointments.createAppointment).mockRejectedValue(
      new ZocdocError('Zocdoc API request failed with 500.', 500)
    );

    const element = await mountFlow('visit-reason-id="vr_1"');
    await toPatientStep(element);

    const completed: CustomEvent[] = [];
    const errors: CustomEvent[] = [];
    element.addEventListener('booking-complete', (event) => completed.push(event as CustomEvent));
    element.addEventListener('booking-error', (event) => errors.push(event as CustomEvent));

    submitPatient(element);
    await vi.waitFor(() => expect(errors).toHaveLength(1));
    await settled(element);

    expect(completed).toHaveLength(0);
    expect(element.step).toBe('patient');
    expect(shadow(element).querySelector('[part="patient-form"]')).not.toBeNull();
    expect(child(element, 'error').textContent).toContain('Something went wrong');
  });

  /**
   * `booking_failed` arrives on a **200**. Treating a resolved promise as a booking would show
   * a confirmation number for an appointment that does not exist.
   */
  it('treats a non-booking status on a 200 as a failure', async () => {
    vi.mocked(appointments.createAppointment).mockResolvedValue(bookingResponse('booking_failed'));

    const element = await mountFlow('visit-reason-id="vr_1"');
    await toPatientStep(element);

    const completed: CustomEvent[] = [];
    const errors: CustomEvent[] = [];
    element.addEventListener('booking-complete', (event) => completed.push(event as CustomEvent));
    element.addEventListener('booking-error', (event) => errors.push(event as CustomEvent));

    submitPatient(element);
    await vi.waitFor(() => expect(errors).toHaveLength(1));
    await settled(element);

    expect(completed).toHaveLength(0);
    expect(element.step).toBe('patient');
    expect(errors[0]!.detail.status).toBe('booking_failed');
    expect(shadow(element).querySelector('[part="confirmation"]')).toBeNull();
  });

  /** `pending_booking` is a booking; the confirmation is what words it differently. */
  it('advances to the confirmation for a pending booking', async () => {
    vi.mocked(appointments.createAppointment).mockResolvedValue(bookingResponse('pending_booking'));

    const element = await mountFlow('visit-reason-id="vr_1"');
    await toPatientStep(element);

    const events: CustomEvent[] = [];
    element.addEventListener('booking-complete', (event) => events.push(event as CustomEvent));

    submitPatient(element);
    await vi.waitFor(() => expect(events).toHaveLength(1));
    await settled(element);

    expect(element.step).toBe('booked');
    expect(events[0]!.detail.status).toBe('pending_booking');
  });

  // A second POST books a second appointment, so the guard is the component's own, not the
  // form's — the form only disables its button.
  it('refuses to book twice at once', async () => {
    let resolveBooking!: (response: AppointmentResponseData) => void;
    vi.mocked(appointments.createAppointment).mockReturnValue(
      new Promise<AppointmentResponseData>((resolve) => {
        resolveBooking = resolve;
      })
    );

    const element = await mountFlow('visit-reason-id="vr_1"');
    await toPatientStep(element);

    submitPatient(element);
    await settled(element);
    submitPatient(element);
    await settled(element);

    expect(appointments.createAppointment).toHaveBeenCalledTimes(1);

    // The form is told to hold its button down for the same reason.
    expect(child(element, 'patient-form')).toHaveProperty('busy', true);

    resolveBooking(bookingResponse('confirmed'));
    await vi.waitFor(() => expect(element.step).toBe('booked'));
  });

  it('announces that the booking is in flight', async () => {
    let resolveBooking!: (response: AppointmentResponseData) => void;
    vi.mocked(appointments.createAppointment).mockReturnValue(
      new Promise<AppointmentResponseData>((resolve) => {
        resolveBooking = resolve;
      })
    );

    const element = await mountFlow('visit-reason-id="vr_1"');
    await toPatientStep(element);

    // The region is mounted before there is anything in it, which is what makes the change
    // land for a screen reader already observing it (A11Y-002).
    const status = child(element, 'status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent?.trim()).toBe('');

    submitPatient(element);
    await settled(element);

    expect(child(element, 'status').textContent).toContain('Booking your appointment');

    resolveBooking(bookingResponse('confirmed'));
    await vi.waitFor(() => expect(element.step).toBe('booked'));
  });

  describe('navigation', () => {
    it('moves focus to the new step, but not on first paint', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      expect(shadow(element).activeElement).toBeNull();

      element.providers = [PROVIDER];
      await settled(element);
      child(element, 'results').dispatchEvent(
        new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
      );
      await settled(element);

      expect(shadow(element).activeElement).toBe(child(element, 'step'));
    });

    it('goes back a step, discarding what that step decided', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      await toPatientStep(element);
      expect(element.step).toBe('patient');

      child(element, 'back').click();
      await settled(element);
      expect(element.step).toBe('time');
      expect(element.startTime).toBeUndefined();

      child(element, 'back').click();
      await settled(element);
      expect(element.step).toBe('search');
      expect(element.providerLocationId).toBeUndefined();
    });

    // Cancelling is a request this library does not make, so there is nothing to go back to.
    it('offers no way back from a booked appointment', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      await toPatientStep(element);

      submitPatient(element);
      await vi.waitFor(() => expect(element.step).toBe('booked'));

      expect(shadow(element).querySelector('[part="back"]')).toBeNull();
    });

    /**
     * The search component owns these three fields once a patient touches them and echoes
     * what it used, so the flow's own copies converge on the child's rather than being pushed
     * back down stale on the next render.
     */
    it('adopts the criteria the search reports back', async () => {
      const element = await mountFlow();

      child(element, 'search').dispatchEvent(
        new CustomEvent('provider-results', {
          detail: {
            providers: [PROVIDER],
            zipCode: SCENARIOS.zipEmpty,
            visitReasonId: 'vr_1',
            insurancePlanId: undefined,
          },
        })
      );
      await settled(element);

      expect(element).toHaveProperty('zipCode', SCENARIOS.zipEmpty);
      expect(element.visitReasonId).toBe('vr_1');
      expect(element.providers).toHaveLength(1);
    });
  });

  /**
   * The modal mode a host page opts into with `modal`, where the search stays on the page and
   * everything from the time step on happens in a dialog over it.
   */
  describe('modal', () => {
    it('leaves the dialog closed while the patient is still searching', async () => {
      const element = await mountFlow('modal');

      expect(element.step).toBe('search');
      expect(dialog(element).open).toBeFalsy();
      expect(queryPart(element, 'search')).not.toBeNull();
    });

    /*
     * The list is what the patient came from and what they return to, so it stays rendered
     * underneath rather than being swapped out for the dialog's content.
     */
    it('opens the dialog on the time step, over a list that is still there', async () => {
      const element = await mountFlow('modal visit-reason-id="vr_1"');
      await toTimeStep(element);

      expect(dialog(element).open).toBe(true);
      expect(queryPart(element, 'modal-step')).not.toBeNull();
      expect(queryPart(element, 'picker')).not.toBeNull();
      expect(queryPart(element, 'results')).not.toBeNull();
    });

    it('carries on to the patient step inside the dialog', async () => {
      const element = await mountFlow('modal visit-reason-id="vr_1"');
      await toPatientStep(element);

      expect(element.step).toBe('patient');
      expect(dialog(element).open).toBe(true);
      expect(queryPart(element, 'patient-form')).not.toBeNull();
    });

    /*
     * Dismissing is not the same as going back one step: the dialog was the whole booking, so
     * closing it drops the slot and the provider together and leaves the patient on the list.
     */
    it('returns to the search step when the dialog is dismissed', async () => {
      const element = await mountFlow('modal visit-reason-id="vr_1"');
      await toPatientStep(element);

      dialog(element).dispatchEvent(new CustomEvent('dialog-hide'));
      await settled(element);

      expect(element.step).toBe('search');
      expect(element.startTime).toBeUndefined();
      expect(element.providerLocationId).toBeUndefined();
      expect(dialog(element).open).toBeFalsy();
      expect(queryPart(element, 'results')).not.toBeNull();
    });

    /*
     * The dialog moves focus into itself as it opens, so the flow's own focus move would be
     * fighting it (A11Y-003). Between two steps of an already-open dialog there is nothing else
     * moving focus, so the flow still does it.
     */
    it('leaves the opening focus to the dialog and moves it between steps itself', async () => {
      const element = await mountFlow('modal visit-reason-id="vr_1"');
      await toTimeStep(element);

      expect(shadow(element).activeElement).not.toBe(queryPart(element, 'modal-step'));

      child(element, 'picker').dispatchEvent(
        new CustomEvent('slot-select', {
          detail: { startTime: START_TIME, providerLocationId: PROVIDER.provider_location_id },
        })
      );
      await settled(element);

      expect(shadow(element).activeElement).toBe(part(element, 'modal-step'));
    });

    it('still renders the flow inline when modal is not set', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      await toTimeStep(element);

      expect(queryPart(element, 'dialog')).toBeNull();
      expect(queryPart(element, 'picker')).not.toBeNull();
    });

    /*
     * The dialog scrolls, so the times do not have to hide behind a day that has to be pressed
     * first; the inline step has no such room and keeps the strip.
     */
    it('lists every day at once in the dialog, and one at a time inline', async () => {
      const inModal = await mountFlow('modal visit-reason-id="vr_1"');
      await toTimeStep(inModal);
      expect(child(inModal, 'picker')).toHaveProperty('layout', 'stacked');

      const inline = await mountFlow('visit-reason-id="vr_1"');
      await toTimeStep(inline);
      expect(child(inline, 'picker')).toHaveProperty('layout', 'strip');
    });

    /*
     * The dialog's own padding sits outside its scrollport, so without this the last row of times
     * ends exactly on the clip line. Measured on the step rather than read off the stylesheet,
     * because what matters is that the content has somewhere to land when scrolled to the end.
     */
    it('leaves room under the content the dialog scrolls', async () => {
      const element = await mountFlow('modal visit-reason-id="vr_1"');
      await toTimeStep(element);

      const step = part(element, 'modal-step');
      const last = step.lastElementChild!;

      expect(step.getBoundingClientRect().bottom).toBeGreaterThan(
        last.getBoundingClientRect().bottom
      );
    });
  });

  /** One check per step, because each is a different composition (A11Y-005). */
  describe('accessibility', () => {
    it('passes axe checks on the search step', async () => {
      const element = await mountFlow();
      element.providers = [PROVIDER];
      await settled(element);

      await expectNoViolations(element);
    });

    it('passes axe checks on the time step', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      element.providers = [PROVIDER];
      await settled(element);
      child(element, 'results').dispatchEvent(
        new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
      );
      await settled(element);

      await expectNoViolations(element);
    });

    it('passes axe checks on the patient step, including a failed booking', async () => {
      vi.mocked(appointments.createAppointment).mockRejectedValue(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      const element = await mountFlow('visit-reason-id="vr_1"');
      await toPatientStep(element);
      await expectNoViolations(element);

      submitPatient(element);
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="error"]')).not.toBeNull()
      );
      await settled(element);

      await expectNoViolations(element);
    });

    /* The dialog adds a heading, a close button and a focus trap the inline flow does not have. */
    it('passes axe checks with the time step in a modal', async () => {
      const element = await mountFlow('modal visit-reason-id="vr_1"');
      element.providers = [PROVIDER];
      await settled(element);
      child(element, 'results').dispatchEvent(
        new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
      );
      await settled(element);

      await expectNoViolations(element);
    });

    it('passes axe checks on the confirmation step', async () => {
      const element = await mountFlow('visit-reason-id="vr_1"');
      await toPatientStep(element);

      submitPatient(element);
      await vi.waitFor(() => expect(element.step).toBe('booked'));
      await settled(element);

      await expectNoViolations(element);
    });
  });
});
