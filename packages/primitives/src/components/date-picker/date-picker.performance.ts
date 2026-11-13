import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

describe('zd-date-picker performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'date-picker',
        create: () => {
          const element = document.createElement('zd-date-picker');
          element.setAttribute('label', 'Appointment date');
          element.setAttribute('value', '2026-03-10');
          return element;
        },
        update: (element, i) => {
          (element as HTMLElement & { value: string }).value =
            `2026-03-${String((i % 18) + 11).padStart(2, '0')}`;
        },
      },
      COMPOSED_OPTIONS
    );
  });
});
