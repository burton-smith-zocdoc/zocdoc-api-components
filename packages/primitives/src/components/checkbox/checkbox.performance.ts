import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-checkbox performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'checkbox',
      create: () => {
        const element = document.createElement('zd-checkbox');
        element.textContent = 'Remember me';
        return element;
      },
      update: (element) => element.toggleAttribute('checked'),
    });
  });
});
