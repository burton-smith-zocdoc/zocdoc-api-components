import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-option-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'option-group',
      create: () => {
        const element = document.createElement('zd-option-group');
        element.setAttribute('label', 'Medical');
        return element;
      },
      update: (element, i) => element.setAttribute('label', `Medical ${i}`),
    });
  });
});
