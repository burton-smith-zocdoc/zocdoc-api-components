import { project } from '@powered-by-zocdoc/primitives';
import { ZdBooking } from './booking.js';

project.scope.registerComponent(ZdBooking);

export { ZdBooking };
export type { BookingStep } from './booking.js';
export type {
  BookingCompleteDetail,
  BookingErrorDetail,
  ZdBookingEventMap,
} from './booking.js';
