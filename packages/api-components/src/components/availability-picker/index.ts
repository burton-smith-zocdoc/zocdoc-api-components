import { project } from '@powered-by-zocdoc/primitives';
import { ZdAvailabilityPicker } from './availability-picker.js';

project.scope.registerComponent(ZdAvailabilityPicker);

export { ZdAvailabilityPicker };
export type {
  PatientTypeChangeDetail,
  SlotSelectDetail,
  ZdAvailabilityPickerEventMap,
} from './availability-picker.js';
