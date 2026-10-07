import { request } from './http.js';
import type {
  AppointmentBaseResponseData,
  AppointmentDetails,
  AppointmentResponseData,
  AppointmentStatus,
  CancellationReasonType,
  Patient,
  PatientType,
  ZocdocResponse,
} from './types.js';

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

/** The statuses `POST /v1/appointments/cancel` accepts. Anything else is a 409. */
export const CANCELLABLE_STATUSES: ReadonlySet<AppointmentStatus> = new Set<AppointmentStatus>([
  'pending_booking',
  'booking_failed',
  'confirmed',
  'pending_reschedule',
  'reschedule_failed',
  'rescheduled',
]);

/** The statuses `POST /v1/appointments/reschedule` accepts. */
export const RESCHEDULABLE_STATUSES: ReadonlySet<AppointmentStatus> = new Set<AppointmentStatus>([
  'pending_booking',
  'confirmed',
  'pending_reschedule',
  'rescheduled',
]);

/** The two reason types the API accepts free text with. */
const FREE_TEXT_REASONS: ReadonlySet<CancellationReasonType> = new Set<CancellationReasonType>([
  'other_patient_reason',
  'other_provider_reason',
]);

/**
 * Refused locally rather than sent: a blank id would turn `GET /v1/appointments/{id}` into
 * `GET /v1/appointments/`, which is a different endpoint with a different response.
 */
function required(value: string, name: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${name} is required.`);
  return trimmed;
}

/** Looks up one appointment, including the fields a reschedule needs. */
export async function getAppointment(appointmentId: string): Promise<AppointmentDetails> {
  const id = required(appointmentId, 'appointmentId');
  const response = await request<ZocdocResponse<AppointmentDetails>>(
    `/v1/appointments/${encodeURIComponent(id)}`
  );
  return response.data;
}

export interface CancelAppointmentInput {
  appointmentId: string;
  reasonType?: CancellationReasonType;
  /** Free text, only with `other_patient_reason` or `other_provider_reason`. Treated as PHI. */
  reason?: string;
}

/**
 * Cancels an appointment. A 409 means its status no longer allows it, usually because it
 * was already cancelled or marked a no-show. Don't retry automatically: the API doesn't
 * document the call as idempotent.
 */
export async function cancelAppointment(
  input: CancelAppointmentInput
): Promise<AppointmentBaseResponseData> {
  const id = required(input.appointmentId, 'appointmentId');

  if (
    input.reason !== undefined &&
    (input.reasonType === undefined || !FREE_TEXT_REASONS.has(input.reasonType))
  ) {
    // Names the rule, never the text, which can be PHI.
    throw new Error(
      'reason is only accepted with reasonType other_patient_reason or other_provider_reason.'
    );
  }

  const response = await request<ZocdocResponse<AppointmentBaseResponseData>>(
    '/v1/appointments/cancel',
    {
      method: 'POST',
      body: {
        appointment_id: id,
        ...(input.reasonType === undefined ? {} : { cancellation_reason_type: input.reasonType }),
        ...(input.reason === undefined ? {} : { cancellation_reason: input.reason }),
      },
    }
  );
  return response.data;
}

export interface RescheduleAppointmentInput {
  appointmentId: string;
  /**
   * A `start_time` from `getAvailability` for the appointment's own provider location,
   * visit reason and patient type, unchanged and offset included.
   */
  startTime: string;
}

/**
 * Moves an appointment to a new time at the same location, for the same visit reason and
 * patient type. Like booking, a resolved promise isn't proof: check `appointment_status`.
 */
export async function rescheduleAppointment(
  input: RescheduleAppointmentInput
): Promise<AppointmentResponseData> {
  const id = required(input.appointmentId, 'appointmentId');
  const startTime = required(input.startTime, 'startTime');

  const response = await request<ZocdocResponse<AppointmentResponseData>>(
    '/v1/appointments/reschedule',
    { method: 'POST', body: { appointment_id: id, start_time: startTime } }
  );
  return response.data;
}
