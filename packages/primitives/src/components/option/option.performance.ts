import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-option performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'option',
      create: () => {
        const element = document.createElement('zd-option');
        element.setAttribute('value', 'dermatology');
        element.textContent = 'Dermatology';
        return element;
      },
      update: (element, i) => element.setAttribute('label', `Dermatology ${i}`),
    });
  });
});
