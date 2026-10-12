import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

describe('zd-availability-window performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'availability-window',
        create: () => {
          const element = document.createElement('zd-availability-window');
          element.setAttribute('start-date', '2026-08-05');
          element.setAttribute('end-date', '2026-08-11');
          return element;
        },
        update: (element, i) => element.toggleAttribute('can-go-earlier', i % 2 === 0),
      },
      OPTIONS
    );
  });
});
