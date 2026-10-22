import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import { buildTimeslots, SCENARIOS } from '../../client/mock/fixtures.js';
import { jsonBlock } from '../../utils/test/hydration.js';
import type { ZdAvailabilityGrid } from './index.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

const PROVIDER_LOCATION_ID = SCENARIOS.providerLocationConfirmed;
const WEEK_A = [
  ...buildTimeslots('2026-08-05', ['09:00', '14:00', '15:30']),
  ...buildTimeslots('2026-08-06', ['09:00']),
];
const WEEK_B = [
  ...buildTimeslots('2026-08-07', ['10:00', '11:30']),
  ...buildTimeslots('2026-08-08', ['16:00']),
];

/** Supplied `timeslots` mean the grid fetches nothing, so no mock is needed. */
describe('zd-availability-grid performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdAvailabilityGrid>(
      {
        name: 'availability-grid',
        create: () => {
          const element = document.createElement('zd-availability-grid') as ZdAvailabilityGrid;
          element.setAttribute('provider-location-id', PROVIDER_LOCATION_ID);
          element.setAttribute('start-date', '2026-08-05');
          element.timeslots = WEEK_A;
          return element;
        },
        update: (element) => (element.timeslots = WEEK_B),
      },
      OPTIONS
    );
  });

  it('reports timings when hydrated from a JSON block', async () => {
    await benchmarkComponent<ZdAvailabilityGrid>(
      {
        name: 'availability-grid/hydrated',
        create: () => {
          const element = document.createElement('zd-availability-grid') as ZdAvailabilityGrid;
          element.setAttribute('provider-location-id', PROVIDER_LOCATION_ID);
          element.setAttribute('start-date', '2026-08-05');
          element.innerHTML = jsonBlock('timeslots', WEEK_A);
          return element;
        },
        update: (element) => (element.timeslots = WEEK_B),
      },
      OPTIONS
    );
  });
});
