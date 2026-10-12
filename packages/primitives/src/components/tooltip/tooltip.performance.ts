import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-tooltip performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'tooltip',
      create: () => {
        const element = document.createElement('zd-tooltip');
        element.setAttribute('content', 'In-network for your plan');
        return element;
      },
      update: (element, i) => element.setAttribute('content', `Tooltip ${i}`),
    });
  });
});
