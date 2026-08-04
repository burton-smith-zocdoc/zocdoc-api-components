import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppointment } from '../appointments.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import type { Patient } from '../types.js';

/**
 * Not a person. Every value is either the spec's own placeholder or transparently fake,
 * as PHI-002 and TEST-003 require.
 *
 * The phone number is the spec's documented example. `5551234567` — the obvious choice —
 * is actually invalid: the API forbids 0 or 1 as the first or fourth digit, and its
 * fourth digit is a 1.
 */
const TEST_PATIENT: Patient = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '9999999999',
  email_address: 'test@example.test',
  patient_address: { address1: '1 Test St', city: 'Brooklyn', state: 'NY', zip_code: '11201' },
};

const INPUT = {
  providerLocationId: 'pr_a|lo_a',
  visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
  startTime: '2026-08-05T14:00:00-04:00',
  patientType: 'new',
  patient: TEST_PATIENT,
} as const;

/**
 * The spec wraps the appointment in `data` (`AppointmentResponse` is `BaseResult` plus
 * `data`), so the mock does too — a flat `{ appointment_id }` would let a regression that
 * forgets to unwrap pass here and fail against the real API.
 */
function appointmentBody(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    request_id: 'req_test',
    data: {
      appointment_id: 'ap_1',
      appointment_status: 'confirmed',
      is_provider_resource: false,
      confirmation_type: 'auto',
      visit_type: 'in_person',
      ...overrides,
    },
  });
}

function mockPost(body: string, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () => new Response(body, { status, headers: { 'content-type': 'application/json' } })
    )
  );
}

function sentBody(): { appointment_type: string; data: Record<string, unknown> } {
  return JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body));
}

describe('createAppointment', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    mockPost(appointmentBody());
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('POSTs the documented envelope', async () => {
    const result = await createAppointment(INPUT);

    const [url, init] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect(String(url)).toBe('https://example.test/v1/appointments');
    expect(init?.method).toBe('POST');

    const body = sentBody();
    expect(body.appointment_type).toBe('providers');
    expect(body.data.provider_location_id).toBe('pr_a|lo_a');
    expect(body.data.start_time).toBe('2026-08-05T14:00:00-04:00');
    expect(body.data.patient_type).toBe('new');
    expect(result.appointment_id).toBe('ap_1');
  });

  it('sends a JSON content type', async () => {
    await createAppointment(INPUT);

    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('returns the status, not just the id', async () => {
    // A resolved promise is not a booking: the practice may not have accepted it yet, so
    // a caller that ignored the status would show "confirmed" for a pending request.
    mockPost(
      appointmentBody({ appointment_status: 'pending_booking', confirmation_type: 'manual' })
    );

    const result = await createAppointment(INPUT);

    expect(result.appointment_status).toBe('pending_booking');
    expect(result.confirmation_type).toBe('manual');
  });

  it('surfaces booking_failed, which arrives on a 200', async () => {
    mockPost(appointmentBody({ appointment_status: 'booking_failed' }));

    const result = await createAppointment(INPUT);

    expect(result.appointment_status).toBe('booking_failed');
  });

  it('omits notes when not supplied', async () => {
    await createAppointment(INPUT);

    // Absent, not null: `"notes": null` reads as "explicitly cleared" to the API.
    expect('notes' in sentBody().data).toBe(false);
  });

  it('sends notes when supplied', async () => {
    await createAppointment({ ...INPUT, notes: 'Test note.' });

    expect(sentBody().data.notes).toBe('Test note.');
  });

  it('rejects notes longer than 100 characters before sending', async () => {
    await expect(createAppointment({ ...INPUT, notes: 'x'.repeat(101) })).rejects.toThrow(
      /100 characters/
    );
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('accepts notes of exactly 100 characters', async () => {
    // The limit is inclusive; an off-by-one here would reject a valid note.
    await createAppointment({ ...INPUT, notes: 'x'.repeat(100) });

    expect(vi.mocked(fetch)).toHaveBeenCalled();
  });

  it('does not put the note text in the rejection message', async () => {
    // PHI-001: the note is patient-authored, so the error names the limit and nothing else.
    const secret = 'y'.repeat(101);

    await expect(createAppointment({ ...INPUT, notes: secret })).rejects.toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('y') })
    );
  });

  it('propagates a server error', async () => {
    mockPost(JSON.stringify({ request_id: 'req_test', error_type: 'api_error', errors: [] }), 500);

    await expect(createAppointment(INPUT)).rejects.toBeTruthy();
  });
});
