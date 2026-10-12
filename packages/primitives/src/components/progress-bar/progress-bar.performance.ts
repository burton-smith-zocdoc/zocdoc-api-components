import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-progress-bar performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'progress-bar',
      create: () => {
        const element = document.createElement('zd-progress-bar');
        element.setAttribute('label', 'Booking progress');
        element.setAttribute('value', '0');
        return element;
      },
      update: (element, i) => element.setAttribute('value', String(10 + ((i * 10) % 90))),
    });
  });
});
