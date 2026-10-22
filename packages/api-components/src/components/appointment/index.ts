import { project } from '@zocdoc/api-primitive-components';
import { ZdAppointment } from './appointment.js';

project.scope.registerComponent(ZdAppointment);

export { ZdAppointment };
export type {
  AppointmentCancelDetail,
  AppointmentCancelRequestDetail,
  AppointmentErrorDetail,
  AppointmentRescheduleDetail,
  AppointmentRescheduleRequestDetail,
  ZdAppointmentEventMap,
} from './appointment.js';
