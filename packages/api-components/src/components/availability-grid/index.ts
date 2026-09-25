import { project } from '@zocdoc/api-primitive-components';
import { ZdAvailabilityGrid } from './availability-grid.js';

project.scope.registerComponent(ZdAvailabilityGrid);

export { ZdAvailabilityGrid };
export type { DaySelectDetail, ZdAvailabilityGridEventMap } from './availability-grid.js';
