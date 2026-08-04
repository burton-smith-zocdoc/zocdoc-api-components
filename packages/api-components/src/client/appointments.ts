import { request } from './http.js';
import type { AppointmentResponseData, Patient, PatientType, ZocdocResponse } from './types.js';

export interface CreateAppointmentInput {
  providerLocationId: string;
  visitReasonId: string;
  /**
   * Must match a `start_time` returned by `getAvailability` exactly, offset included.
   * The API rejects a time it did not offer, so this is passed through verbatim rather
   * than reformatted or normalised to UTC.
   */
  startTime: string;
  patientType: PatientType;
  /** Every field is PHI. It is serialised into the request body and nowhere else. */
  patient: Patient;
  /** Patient-authored free text, max 100 characters. Also PHI. */
  notes?: string;
}

const MAX_NOTES_LENGTH = 100;

/**
 * Books an appointment.
 *
 * Two things about the result are easy to get wrong. A 200 does **not** mean the
 * appointment is confirmed: `appointment_status` may be `pending_booking`, awaiting the
 * practice, or even `booking_failed`, which is a failure delivered on a success status.
 * Callers must branch on the status rather than treating a resolved promise as a booking.
 *
 * The plan for this task specified a bare `{ appointment_id }` response. The published
 * bundle (v1.177) wraps it: `AppointmentResponse` is `BaseResult` plus `data`, so the id
 * lives at `data.appointment_id`. This follows the spec and unwraps `data`, which also
 * hands back the status the caller needs.
 */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<AppointmentResponseData> {
  if (input.notes !== undefined && input.notes.length > MAX_NOTES_LENGTH) {
    // Rejected locally so an over-long note does not send a body full of PHI across the
    // wire just to be told 400. The message states the limit and quotes none of the text.
    throw new Error(`notes must be at most ${MAX_NOTES_LENGTH} characters.`);
  }

  const response = await request<ZocdocResponse<AppointmentResponseData>>('/v1/appointments', {
    method: 'POST',
    body: {
      // `providers` is the only documented value, so it is set here rather than exposed
      // as a parameter no caller could vary usefully.
      appointment_type: 'providers',
      data: {
        provider_location_id: input.providerLocationId,
        visit_reason_id: input.visitReasonId,
        start_time: input.startTime,
        patient_type: input.patientType,
        patient: input.patient,
        // Spread rather than `notes: input.notes` so an omitted note is absent from the
        // JSON entirely; `"notes": null` reads as "explicitly cleared" to the API.
        ...(input.notes === undefined ? {} : { notes: input.notes }),
      },
    },
  });

  return response.data;
}
