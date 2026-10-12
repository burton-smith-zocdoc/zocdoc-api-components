import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-switch performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'switch',
      create: () => {
        const element = document.createElement('zd-switch');
        element.textContent = 'Video visits only';
        return element;
      },
      update: (element, i) => element.toggleAttribute('checked', i % 2 === 0),
    });
  });
});
