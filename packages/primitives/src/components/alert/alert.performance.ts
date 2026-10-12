import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-alert performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'alert',
      create: () => {
        const element = document.createElement('zd-alert');
        element.setAttribute('heading', 'Heads up');
        element.setAttribute('open', '');
        element.textContent = 'Your appointment details changed.';
        return element;
      },
      update: (element, i) => element.setAttribute('variant', i % 2 ? 'info' : 'warning'),
    });
  });
});
