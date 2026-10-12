import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import type { ZdAvailabilityWindow } from './index.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

describe('zd-availability-window performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdAvailabilityWindow>(
      {
        name: 'availability-window',
        create: () => {
          const element = document.createElement('zd-availability-window') as ZdAvailabilityWindow;
          element.setAttribute('start-date', '2026-08-05');
          element.setAttribute('end-date', '2026-08-11');
          return element;
        },
        // `can-go-earlier` defaults to true, so the change is turning it off.
        update: (element) => (element.canGoEarlier = false),
      },
      OPTIONS
    );
  });
});
