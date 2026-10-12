import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-input performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'input',
      create: () => {
        const element = document.createElement('zd-input');
        element.setAttribute('label', 'ZIP code');
        return element;
      },
      update: (element, i) =>
        ((element as HTMLElement & { value: string }).value = String(10000 + i)),
    });
  });
});
