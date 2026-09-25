import { project } from '@zocdoc/api-primitive-components';
import { ZdAvailabilityWindow } from './availability-window.js';

project.scope.registerComponent(ZdAvailabilityWindow);

export { ZdAvailabilityWindow, type WindowShiftDetail, type ZdAvailabilityWindowEventMap } from './availability-window.js';
