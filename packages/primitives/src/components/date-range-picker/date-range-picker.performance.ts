import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

describe('zd-date-range-picker performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'date-range-picker',
        create: () => {
          const element = document.createElement('zd-date-range-picker');
          element.setAttribute('label', 'Availability window');
          element.setAttribute('value', '2026-03-10/2026-03-14');
          return element;
        },
        update: (element, i) => {
          (element as HTMLElement & { value: string }).value =
            `2026-03-${String((i % 10) + 11).padStart(2, '0')}/2026-03-28`;
        },
      },
      COMPOSED_OPTIONS
    );
  });
});
