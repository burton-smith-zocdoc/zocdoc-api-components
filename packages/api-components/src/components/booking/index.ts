import { project } from '@zocdoc/api-primitive-components';
import { ZdBooking } from './booking.js';

project.scope.registerComponent(ZdBooking);

export { ZdBooking };
export type { BookingStep } from './booking.js';
export type {
  BookingCompleteDetail,
  BookingErrorDetail,
  ZdBookingEventMap,
} from './booking.js';
