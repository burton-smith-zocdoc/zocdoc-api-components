import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-radio performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'radio',
      create: () => {
        const element = document.createElement('zd-radio');
        element.setAttribute('label', 'New patient');
        element.setAttribute('value', 'new');
        return element;
      },
      update: (element) => element.toggleAttribute('checked'),
    });
  });
});
