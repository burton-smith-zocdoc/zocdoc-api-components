import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

describe('zd-text-area performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'text-area',
      create: () => {
        const element = document.createElement('zd-text-area');
        element.setAttribute('label', 'Notes for the office');
        return element;
      },
      update: (element, i) => ((element as HTMLElement & { value: string }).value = `Note ${i}`),
    });
  });
});
