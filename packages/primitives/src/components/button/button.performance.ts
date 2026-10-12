import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-button performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'button',
      create: () => {
        const element = document.createElement('zd-button');
        element.textContent = 'Continue';
        return element;
      },
      update: (element, i) => element.toggleAttribute('loading', i % 2 === 0),
    });
  });
});
