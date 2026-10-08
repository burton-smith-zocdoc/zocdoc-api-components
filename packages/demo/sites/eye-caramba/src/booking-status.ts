import type { AppointmentStatus } from '@zocdoc/api-components';

/**
 * The two statuses that mean a booking happened. `pending_booking` counts: the practice has yet
 * to accept, but the request is in and the patient has a number to quote.
 */
const BOOKED: ReadonlySet<AppointmentStatus> = new Set(['confirmed', 'pending_booking']);

/** `createAppointment` resolves on a 200 even when booking failed — branch on the status. */
export function isBooked(status: AppointmentStatus): boolean {
  return BOOKED.has(status);
}
