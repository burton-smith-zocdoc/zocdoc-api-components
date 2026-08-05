import { project } from '@powered-by-zocdoc/primitives';
import { ZdBookingFlow } from './booking-flow.js';

project.scope.registerComponent(ZdBookingFlow);

export { ZdBookingFlow };
export type { BookingStep } from './booking-flow.js';
