import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CANCELLABLE_STATUSES,
  RESCHEDULABLE_STATUSES,
  cancelAppointment,
  getAppointment,
  rescheduleAppointment,
} from '../appointments.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { ZocdocError, ZocdocNotFoundError } from '../errors.js';

/** The sandbox's confirmed appointment (TEST-003). */
const ID = 'd2ee5bd8-643a-42c8-8c5a-be450e903430';

function respond(body: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status,
          headers: { 'content-type': 'application/json' },
        })
    )
  );
}

function sent(): { url: string; method: string; body: unknown } {
  const [url, init] = vi.mocked(fetch).mock.calls[0] ?? [];
  return {
    url: String(url),
    method: init?.method ?? 'GET',
    body: init?.body === undefined ? undefined : JSON.parse(String(init.body)),
  };
}

const DETAILS = {
  appointment_id: ID,
  appointment_status: 'confirmed',
  is_provider_resource: false,
  confirmation_type: 'auto',
  start_time: '2026-08-05T09:00:00-04:00',
  provider_location_id: 'pr_confirmed|lo_confirmed',
  visit_reason_id: 'pc_TlZW-r06U0W3pCsIGtSI5B',
  patient_type: 'new',
  notes: null,
};

beforeEach(() => {
  configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
});

afterEach(() => {
  resetZocdocConfig();
  vi.unstubAllGlobals();
});

describe('getAppointment', () => {
  it('GETs the appointment by id and unwraps data', async () => {
    respond({ request_id: 'req_test', data: DETAILS });

    const appointment = await getAppointment(ID);

    expect(sent()).toMatchObject({
      url: `https://example.test/v1/appointments/${ID}`,
      method: 'GET',
    });
    expect(appointment).toEqual(DETAILS);
  });

  it('encodes the id into the path', async () => {
    respond({ request_id: 'req_test', data: DETAILS });

    await getAppointment('a/b');

    expect(sent().url).toBe('https://example.test/v1/appointments/a%2Fb');
  });

  it('refuses a blank id without a request', async () => {
    respond({});

    await expect(getAppointment('   ')).rejects.toThrow('appointmentId is required.');
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('throws ZocdocNotFoundError on 404', async () => {
    respond({ request_id: 'req_test', error_type: 'invalid_request', errors: [] }, 404);

    await expect(getAppointment(ID)).rejects.toBeInstanceOf(ZocdocNotFoundError);
  });
});

describe('cancelAppointment', () => {
  beforeEach(() => {
    respond({
      request_id: 'req_test',
      data: { appointment_id: ID, appointment_status: 'cancelled' },
    });
  });

  it('POSTs only the id when no reason is given', async () => {
    const result = await cancelAppointment({ appointmentId: ID });

    expect(sent()).toEqual({
      url: 'https://example.test/v1/appointments/cancel',
      method: 'POST',
      body: { appointment_id: ID },
    });
    expect(result).toEqual({ appointment_id: ID, appointment_status: 'cancelled' });
  });

  it('sends the reason type', async () => {
    await cancelAppointment({ appointmentId: ID, reasonType: 'patient_no_longer_available' });

    expect(sent().body).toEqual({
      appointment_id: ID,
      cancellation_reason_type: 'patient_no_longer_available',
    });
  });

  it('sends free text with an other_* reason type', async () => {
    await cancelAppointment({
      appointmentId: ID,
      reasonType: 'other_patient_reason',
      reason: 'Test reason',
    });

    expect(sent().body).toEqual({
      appointment_id: ID,
      cancellation_reason_type: 'other_patient_reason',
      cancellation_reason: 'Test reason',
    });
  });

  it('refuses free text without an other_* reason type, without quoting it', async () => {
    const attempt = cancelAppointment({
      appointmentId: ID,
      reasonType: 'patient_no_longer_available',
      reason: 'Test reason',
    });

    await expect(attempt).rejects.toThrow(/other_patient_reason/);
    await expect(attempt).rejects.not.toThrow(/Test reason/);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('surfaces a 409 as a ZocdocError with that status', async () => {
    respond({ request_id: 'req_test', error_type: 'invalid_request', errors: [] }, 409);

    const error = await cancelAppointment({ appointmentId: ID }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ZocdocError);
    expect((error as ZocdocError).status).toBe(409);
  });
});

describe('rescheduleAppointment', () => {
  it('POSTs the id and the start time verbatim', async () => {
    respond({
      request_id: 'req_test',
      data: {
        appointment_id: ID,
        appointment_status: 'rescheduled',
        is_provider_resource: false,
        confirmation_type: 'auto',
        visit_type: 'in_person',
      },
    });

    const result = await rescheduleAppointment({
      appointmentId: ID,
      startTime: '2026-08-06T14:00:00-04:00',
    });

    expect(sent()).toEqual({
      url: 'https://example.test/v1/appointments/reschedule',
      method: 'POST',
      body: { appointment_id: ID, start_time: '2026-08-06T14:00:00-04:00' },
    });
    expect(result.appointment_status).toBe('rescheduled');
  });

  it('refuses a blank start time without a request', async () => {
    respond({});

    await expect(rescheduleAppointment({ appointmentId: ID, startTime: '' })).rejects.toThrow(
      'startTime is required.'
    );
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});

describe('eligible statuses', () => {
  it('match the spec for cancel', () => {
    expect(new Set(CANCELLABLE_STATUSES)).toEqual(
      new Set([
        'booking_failed',
        'confirmed',
        'pending_booking',
        'pending_reschedule',
        'reschedule_failed',
        'rescheduled',
      ])
    );
  });

  it('match the spec for reschedule', () => {
    expect(new Set(RESCHEDULABLE_STATUSES)).toEqual(
      new Set(['confirmed', 'pending_booking', 'pending_reschedule', 'rescheduled'])
    );
  });
});
