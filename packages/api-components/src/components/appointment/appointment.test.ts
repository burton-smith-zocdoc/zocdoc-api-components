import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import { ZocdocError, ZocdocNotFoundError } from '../../client/errors.js';
import { buildTimeslots, PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import * as providerLocations from '../../client/provider-locations.js';
import type {
  AppointmentDetails,
  AppointmentResponseData,
  ProviderLocation,
} from '../../client/types.js';
import { dayFromToday } from '../../utils/test/dates.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, queryPart, settled, shadow } from '../../utils/test/mount.js';
import './index.js';

/** `{ spy: true }` so `vi.spyOn` can redefine the exports in browser mode (TEST-002). */
vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });
vi.mock('../../client/provider-locations.js', { spy: true });

const ID = SCENARIOS.appointmentConfirmed;
/** 9 AM at a practice on `-04:00`. The runner is UTC, so the offset is what's under test. */
const START_TIME = '2026-08-05T09:00:00-04:00';
/** Tomorrow, so the picker's window (which starts today) includes it. */
const NEW_DAY = dayFromToday(1);
const NEW_TIME = `${NEW_DAY}T14:00:00-04:00`;
/** A provider name from the fixture directory, not a patient's (PHI-002). */
const PROVIDER = 'Dr. Avery Sandoval, MD';
/** The fixture provider under the appointment's own location id, as the mock answers it. */
const LOCATION: ProviderLocation = {
  ...PROVIDER_LOCATIONS[0]!,
  provider_location_id: SCENARIOS.providerLocationConfirmed,
  provider: { ...PROVIDER_LOCATIONS[0]!.provider, provider_photo_url: '//images.test/photo.jpg' },
};

type Manage = HTMLElement & {
  appointmentId?: string;
  cancel(reasonType?: string): Promise<void>;
  reschedule(startTime: string): Promise<void>;
};

type Picker = HTMLElement & {
  providerLocationId?: string;
  visitReasonId?: string;
  patientType: string;
  hidePatientType: boolean;
};

function details(overrides: Partial<AppointmentDetails> = {}): AppointmentDetails {
  return {
    appointment_id: ID,
    appointment_status: 'confirmed',
    is_provider_resource: false,
    confirmation_type: 'auto',
    visit_type: 'in_person',
    start_time: START_TIME,
    provider_location_id: SCENARIOS.providerLocationConfirmed,
    visit_reason_id: 'pc_TlZW-r06U0W3pCsIGtSI5B',
    patient_type: 'new',
    ...overrides,
  };
}

function rescheduled(
  status: AppointmentResponseData['appointment_status']
): AppointmentResponseData {
  return {
    appointment_id: ID,
    appointment_status: status,
    is_provider_resource: false,
    confirmation_type: 'auto',
    visit_type: 'in_person',
  };
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function record(element: HTMLElement, name: string): CustomEvent[] {
  const seen: CustomEvent[] = [];
  element.addEventListener(name, (event) => seen.push(event as CustomEvent));
  return seen;
}

function text(element: HTMLElement, name: string): string {
  return part(element, name).textContent?.trim() ?? '';
}

async function mountLoaded(appointment = details()): Promise<Manage> {
  vi.spyOn(appointments, 'getAppointment').mockResolvedValue(appointment);
  const element = await mount<Manage>(
    `<zd-appointment appointment-id="${appointment.appointment_id}" provider-name="${PROVIDER}"></zd-appointment>`
  );
  await vi.waitFor(() => part(element, 'panel'));
  await settled(element);
  return element;
}

async function click(element: Manage, name: string): Promise<void> {
  part(element, name).click();
  await settled(element);
}

describe('zd-appointment', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'cancelAppointment').mockResolvedValue({
      appointment_id: ID,
      appointment_status: 'cancelled',
    });
    vi.spyOn(appointments, 'rescheduleAppointment').mockResolvedValue(rescheduled('rescheduled'));
    vi.spyOn(providerLocations, 'getProviderLocation').mockResolvedValue(LOCATION);
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([
      {
        provider_location_id: SCENARIOS.providerLocationConfirmed,
        first_availability: null,
        timeslots: buildTimeslots(NEW_DAY, ['14:00']),
      },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('lookup', () => {
    it('shows the status, provider, time and confirmation number', async () => {
      const element = await mountLoaded();

      expect(appointments.getAppointment).toHaveBeenCalledWith(ID);
      expect(text(element, 'appointment-status')).toBe('Confirmed');
      expect(text(element, 'provider')).toContain('Avery Sandoval, MD');
      expect(text(element, 'when')).toContain('9:00');
      expect(text(element, 'reference')).toBe(ID);
    });

    it('keeps the outcome notice region visible before any action', async () => {
      const element = await mountLoaded();

      expect(getComputedStyle(part(element, 'notice')).display).not.toBe('none');
    });

    it('stays idle without an id', async () => {
      const spy = vi.spyOn(appointments, 'getAppointment');
      const element = await mount<Manage>('<zd-appointment appointment-id="  "></zd-appointment>');

      expect(spy).not.toHaveBeenCalled();
      expect(queryPart(element, 'panel')).toBeNull();
      expect(queryPart(element, 'error')).toBeNull();
    });

    it('ignores a lookup that finishes after the id changed', async () => {
      const first = deferred<AppointmentDetails>();
      vi.spyOn(appointments, 'getAppointment')
        .mockReturnValueOnce(first.promise)
        .mockResolvedValueOnce(
          details({
            appointment_id: SCENARIOS.appointmentPending,
            appointment_status: 'pending_booking',
          })
        );
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}"></zd-appointment>`
      );

      element.appointmentId = SCENARIOS.appointmentPending;
      await vi.waitFor(() => part(element, 'panel'));
      first.resolve(details());
      await first.promise;
      await settled(element);

      expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending);
    });

    it('shows a not-found message and emits appointment-error on 404', async () => {
      const error = new ZocdocNotFoundError();
      vi.spyOn(appointments, 'getAppointment').mockRejectedValue(error);
      const element = document.createElement('div');
      const seen = record(element, 'appointment-error');
      element.innerHTML = `<zd-appointment appointment-id="${SCENARIOS.appointmentNotFound}"></zd-appointment>`;
      const manage = element.firstElementChild as Manage;
      document.body.append(element);

      await vi.waitFor(() => part(manage, 'error'));

      expect(text(manage, 'error')).toContain('could not find this appointment');
      expect(seen[0]?.detail).toEqual({ error, action: 'load' });
      element.remove();
    });
  });

  describe('provider', () => {
    it('looks up the provider by the appointment location and shows the summary', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));

      expect(providerLocations.getProviderLocation).toHaveBeenCalledWith(
        SCENARIOS.providerLocationConfirmed
      );
      expect(text(element, 'provider-name')).toBe('Avery Sandoval, MD');
      expect(part<HTMLImageElement>(element, 'provider-photo').src).toBe(
        'https://images.test/photo.jpg'
      );
      expect(queryPart(element, 'provider-insurance')).toBeNull();
    });

    it('hides the photo with hide-photo', async () => {
      vi.spyOn(appointments, 'getAppointment').mockResolvedValue(details());
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}" hide-photo></zd-appointment>`
      );
      await vi.waitFor(() => part(element, 'provider-summary'));

      expect(queryPart(element, 'provider-photo')).toBeNull();
    });

    it('shows provider-name while the provider lookup is pending', async () => {
      const pending = deferred<ProviderLocation>();
      vi.mocked(providerLocations.getProviderLocation).mockReturnValueOnce(pending.promise);
      const element = await mountLoaded();

      expect(text(element, 'provider')).toBe(PROVIDER);
      expect(queryPart(element, 'provider-summary')).toBeNull();

      pending.resolve(LOCATION);
      await vi.waitFor(() => part(element, 'provider-summary'));
    });

    it('a failed provider lookup is quiet and falls back to provider-name', async () => {
      vi.mocked(providerLocations.getProviderLocation).mockRejectedValue(new ZocdocNotFoundError());
      const host = document.createElement('div');
      const seen = record(host, 'appointment-error');
      vi.spyOn(appointments, 'getAppointment').mockResolvedValue(details());
      host.innerHTML = `<zd-appointment appointment-id="${ID}" provider-name="${PROVIDER}"></zd-appointment>`;
      document.body.append(host);
      const element = host.firstElementChild as Manage;
      await vi.waitFor(() => part(element, 'panel'));
      await settled(element);

      expect(text(element, 'provider')).toBe(PROVIDER);
      expect(queryPart(element, 'provider-summary')).toBeNull();
      expect(queryPart(element, 'error')).toBeNull();
      expect(queryPart(element, 'action-error')).toBeNull();
      expect(queryPart(element, 'actions')).not.toBeNull();
      expect(seen).toHaveLength(0);
      host.remove();
    });

    it('shows no provider row when the lookup fails and no provider-name is set', async () => {
      vi.mocked(providerLocations.getProviderLocation).mockRejectedValue(new Error('offline'));
      vi.spyOn(appointments, 'getAppointment').mockResolvedValue(details());
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}"></zd-appointment>`
      );
      await vi.waitFor(() => part(element, 'panel'));
      await settled(element);

      expect(queryPart(element, 'provider')).toBeNull();
      expect(text(element, 'appointment-status')).toBe('Confirmed');
    });

    it('ignores a provider lookup that finishes after the id changed', async () => {
      const stale = deferred<ProviderLocation>();
      const otherLocation = {
        ...LOCATION,
        provider_location_id: SCENARIOS.providerLocationPending,
      };
      vi.mocked(providerLocations.getProviderLocation)
        .mockReturnValueOnce(stale.promise)
        .mockReturnValueOnce(new Promise(() => {}));
      vi.spyOn(appointments, 'getAppointment')
        .mockResolvedValueOnce(details())
        .mockResolvedValueOnce(
          details({
            appointment_id: SCENARIOS.appointmentPending,
            provider_location_id: SCENARIOS.providerLocationPending,
          })
        );
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}"></zd-appointment>`
      );
      await vi.waitFor(() =>
        expect(providerLocations.getProviderLocation).toHaveBeenCalledTimes(1)
      );

      element.appointmentId = SCENARIOS.appointmentPending;
      await vi.waitFor(() => expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending));
      stale.resolve(otherLocation);
      await stale.promise;
      await settled(element);

      expect(queryPart(element, 'provider-summary')).toBeNull();
    });

    it('keeps the provider through a 409 refresh and a reschedule', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));
      vi.mocked(appointments.cancelAppointment).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 409.', 409)
      );
      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(details());

      await element.cancel();
      await settled(element);
      await element.reschedule(NEW_TIME);
      await settled(element);

      expect(providerLocations.getProviderLocation).toHaveBeenCalledTimes(1);
      expect(queryPart(element, 'provider-summary')).not.toBeNull();
    });

    it('drops the old provider as soon as a new id starts loading', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));
      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(
        details({ appointment_id: SCENARIOS.appointmentPending })
      );
      vi.mocked(providerLocations.getProviderLocation).mockReturnValueOnce(new Promise(() => {}));

      element.appointmentId = SCENARIOS.appointmentPending;
      await vi.waitFor(() => expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending));

      expect(queryPart(element, 'provider-summary')).toBeNull();
    });
  });

  describe('actions offered', () => {
    it.each([
      ['confirmed', true, true],
      ['pending_booking', true, true],
      ['pending_reschedule', true, true],
      ['rescheduled', true, true],
      ['reschedule_failed', false, true],
      ['booking_failed', false, false],
      ['cancelled', false, false],
      ['no_show', false, false],
    ] as const)('%s: change time %s, cancel %s', async (status, canMove, canCancel) => {
      const element = await mountLoaded(details({ appointment_status: status }));

      expect(queryPart(element, 'reschedule') !== null).toBe(canMove);
      expect(queryPart(element, 'cancel') !== null).toBe(canCancel);
    });

    it('does not offer a new time when the patient type is unknown', async () => {
      const element = await mountLoaded(details({ patient_type: undefined }));

      expect(queryPart(element, 'reschedule')).toBeNull();
      expect(queryPart(element, 'cancel')).not.toBeNull();
    });
  });

  describe('cancel', () => {
    it('asks first, moves focus, and sends the chosen reason', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-cancel');
      expect(shadow(element).activeElement).toBeNull();

      await click(element, 'cancel');
      expect(shadow(element).activeElement).toBe(part(element, 'panel'));
      expect(appointments.cancelAppointment).not.toHaveBeenCalled();

      const reason = part<HTMLElement & { value: string }>(element, 'reason');
      reason.value = 'patient_no_longer_available';
      reason.dispatchEvent(new Event('change'));
      part<HTMLFormElement>(element, 'cancel-form').requestSubmit();

      await vi.waitFor(() => expect(text(element, 'appointment-status')).toBe('Cancelled'));
      expect(appointments.cancelAppointment).toHaveBeenCalledWith({
        appointmentId: ID,
        reasonType: 'patient_no_longer_available',
      });
      expect(text(element, 'notice')).toBe('Your appointment is cancelled.');
      expect(queryPart(element, 'actions')).toBeNull();
      expect(seen[0]?.detail).toEqual({ appointmentId: ID, status: 'cancelled' });
    });

    it('returns to the details without a request when the patient keeps it', async () => {
      const element = await mountLoaded();

      await click(element, 'cancel');
      await click(element, 'keep');

      expect(queryPart(element, 'cancel-form')).toBeNull();
      expect(appointments.cancelAppointment).not.toHaveBeenCalled();
    });

    it('sends one cancel when called twice at once', async () => {
      const element = await mountLoaded();
      const pending = deferred<{ appointment_id: string; appointment_status: 'cancelled' }>();
      vi.mocked(appointments.cancelAppointment).mockReturnValueOnce(pending.promise);

      const first = element.cancel();
      const second = element.cancel();
      pending.resolve({ appointment_id: ID, appointment_status: 'cancelled' });
      await Promise.all([first, second]);

      expect(appointments.cancelAppointment).toHaveBeenCalledTimes(1);
    });

    it('on 409, says so and reloads the real status', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-error');
      vi.mocked(appointments.cancelAppointment).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 409.', 409)
      );
      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(
        details({ appointment_status: 'no_show' })
      );

      await element.cancel();
      await settled(element);

      expect(appointments.getAppointment).toHaveBeenCalledTimes(2);
      expect(text(element, 'appointment-status')).toBe('Missed');
      expect(text(element, 'action-error')).toContain('can no longer be cancelled');
      expect(queryPart(element, 'actions')).toBeNull();
      expect(seen[0]?.detail.action).toBe('cancel');
    });

    it('on 409 from the cancel form, keeps the panel mounted and focused', async () => {
      const element = await mountLoaded();
      await click(element, 'cancel');
      vi.mocked(appointments.cancelAppointment).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 409.', 409)
      );
      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(
        details({ appointment_status: 'no_show' })
      );
      let sawLoading = false;
      const observer = new MutationObserver(() => {
        if (queryPart(element, 'loading')) sawLoading = true;
      });
      observer.observe(shadow(element), { childList: true, subtree: true });

      part<HTMLFormElement>(element, 'cancel-form').requestSubmit();
      await vi.waitFor(() => expect(text(element, 'appointment-status')).toBe('Missed'));
      await settled(element);
      observer.disconnect();

      expect(sawLoading).toBe(false);
      expect(shadow(element).activeElement).toBe(part(element, 'panel'));
      expect(text(element, 'action-error')).toContain('can no longer be cancelled');
    });

    it('drops a late cancel failure after the id changed', async () => {
      const element = await mountLoaded();
      let fail!: (reason: unknown) => void;
      const pending = new Promise<never>((_, reject) => {
        fail = reject;
      });
      vi.mocked(appointments.cancelAppointment).mockReturnValueOnce(pending);
      const inFlight = element.cancel();

      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(
        details({
          appointment_id: SCENARIOS.appointmentPending,
          appointment_status: 'pending_booking',
        })
      );
      element.appointmentId = SCENARIOS.appointmentPending;
      await vi.waitFor(() => expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending));

      fail(new ZocdocError('Zocdoc API request failed with 500.', 500));
      await inFlight;
      await settled(element);

      expect(queryPart(element, 'action-error')).toBeNull();
      expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending);
    });

    it('shows generic copy, never the error message, on other failures', async () => {
      const element = await mountLoaded();
      await click(element, 'cancel');
      vi.mocked(appointments.cancelAppointment).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      await element.cancel();
      await settled(element);

      expect(text(element, 'action-error')).toBe('Something went wrong. Please try again.');
      expect(queryPart(element, 'cancel-form')).not.toBeNull();
    });

    it('treats a 200 that is not cancelled as a failure', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-error');
      vi.mocked(appointments.cancelAppointment).mockResolvedValueOnce({
        appointment_id: ID,
        appointment_status: 'confirmed',
      });

      await element.cancel();
      await settled(element);

      expect(text(element, 'appointment-status')).toBe('Confirmed');
      expect(queryPart(element, 'action-error')).not.toBeNull();
      expect(seen[0]?.detail).toMatchObject({ action: 'cancel', status: 'confirmed' });
    });
  });

  describe('reschedule', () => {
    it('locks the picker to the appointment and books the chosen time', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-reschedule');

      await click(element, 'reschedule');
      expect(shadow(element).activeElement).toBe(part(element, 'panel'));

      const picker = part<Picker>(element, 'picker');
      expect(picker.providerLocationId).toBe(SCENARIOS.providerLocationConfirmed);
      expect(picker.visitReasonId).toBe('pc_TlZW-r06U0W3pCsIGtSI5B');
      expect(picker.patientType).toBe('new');
      expect(picker.hidePatientType).toBe(true);
      expect(part(element, 'confirm-reschedule').hasAttribute('disabled')).toBe(true);

      picker.dispatchEvent(
        new CustomEvent('slot-select', {
          detail: { startTime: NEW_TIME, providerLocationId: SCENARIOS.providerLocationConfirmed },
        })
      );
      await settled(element);
      await click(element, 'confirm-reschedule');

      await vi.waitFor(() => expect(text(element, 'appointment-status')).toBe('Rescheduled'));
      expect(appointments.rescheduleAppointment).toHaveBeenCalledWith({
        appointmentId: ID,
        startTime: NEW_TIME,
      });
      expect(text(element, 'when')).toContain('2:00');
      expect(text(element, 'notice')).toBe('Your appointment has a new time.');
      expect(seen[0]?.detail).toEqual({
        appointmentId: ID,
        status: 'rescheduled',
        startTime: NEW_TIME,
      });
    });

    it('words a pending reschedule as waiting on the practice', async () => {
      const element = await mountLoaded();
      vi.mocked(appointments.rescheduleAppointment).mockResolvedValueOnce(
        rescheduled('pending_reschedule')
      );

      await element.reschedule(NEW_TIME);
      await settled(element);

      expect(text(element, 'notice')).toContain('still has to accept');
    });

    it('treats a 200 with reschedule_failed as a failure and keeps the old time', async () => {
      const element = await mountLoaded();
      await click(element, 'reschedule');
      const seen = record(element, 'appointment-error');
      vi.mocked(appointments.rescheduleAppointment).mockResolvedValueOnce(
        rescheduled('reschedule_failed')
      );

      await element.reschedule(NEW_TIME);
      await settled(element);

      expect(text(element, 'action-error')).toContain('could not be booked');
      expect(queryPart(element, 'picker')).not.toBeNull();
      expect(seen[0]?.detail).toMatchObject({ action: 'reschedule', status: 'reschedule_failed' });
    });
  });

  describe('accessibility', () => {
    it('has no violations in view, cancel and reschedule modes', async () => {
      const element = await mountLoaded();
      await expectNoViolations(element);

      await click(element, 'cancel');
      await expectNoViolations(element);

      await click(element, 'keep');
      await click(element, 'reschedule');
      await vi.waitFor(() => part(part(element, 'picker'), 'slot'));
      await expectNoViolations(element);
    });

    it('has no violations with the provider summary shown', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));

      await expectNoViolations(element);
    });

    it('has no violations in the error state', async () => {
      vi.spyOn(appointments, 'getAppointment').mockRejectedValue(new Error('offline'));
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}"></zd-appointment>`
      );
      await vi.waitFor(() => part(element, 'error'));

      await expectNoViolations(element);
    });
  });
});
