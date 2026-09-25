import { project } from '@zocdoc/api-primitive-components';
import { ZdAvailabilityPicker } from './availability-picker.js';

project.scope.registerComponent(ZdAvailabilityPicker);

export { ZdAvailabilityPicker };
export type {
  PatientTypeChangeDetail,
  SlotSelectDetail,
  ZdAvailabilityPickerEventMap,
} from './availability-picker.js';
