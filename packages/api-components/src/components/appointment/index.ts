import { project } from '@zocdoc/api-primitive-components';
import { ZdAppointment } from './appointment.js';

project.scope.registerComponent(ZdAppointment);

export { ZdAppointment };
export type {
  AppointmentCancelDetail,
  AppointmentErrorDetail,
  AppointmentRescheduleDetail,
  ZdAppointmentEventMap,
} from './appointment.js';
