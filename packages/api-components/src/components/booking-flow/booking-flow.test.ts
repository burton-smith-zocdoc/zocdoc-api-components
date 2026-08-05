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
import { expectNoViolations } from '../../test/a11y.js';
import { mount, settled } from '../../test/mount.js';
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

function shadow(element: Flow): ShadowRoot {
  const root = element.shadowRoot;
  if (!root) throw new Error('zd-booking-flow rendered no shadow root');
  return root;
}

function child(element: Flow, part: string): HTMLElement {
  const found = shadow(element).querySelector<HTMLElement>(`[part="${part}"]`);
  if (!found) throw new Error(`no [part="${part}"] in the current step`);
  return found;
}

/** Drives the flow to the patient step the way the children do, by event. */
async function toPatientStep(element: Flow): Promise<void> {
  element.providers = [PROVIDER];
  await settled(element);

  child(element, 'results').dispatchEvent(
    new CustomEvent('provider-select', { detail: { provider: PROVIDER } })
  );
  await settled(element);

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

describe('zd-booking-flow', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'createAppointment').mockResolvedValue(bookingResponse('confirmed'));
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getVisitReasons').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountFlow(attributes = ''): Promise<Flow> {
    return mount<Flow>(
      `<zd-booking-flow zip-code="${SCENARIOS.zipWithResults}" ${attributes}></zd-booking-flow>`
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
