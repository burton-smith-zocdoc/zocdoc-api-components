import { project } from '@powered-by-zocdoc/primitives';
import { ZdAvailabilityGrid } from './availability-grid.js';

project.scope.registerComponent(ZdAvailabilityGrid);

export { ZdAvailabilityGrid };
export type { DaySelectDetail, ZdAvailabilityGridEventMap } from './availability-grid.js';
