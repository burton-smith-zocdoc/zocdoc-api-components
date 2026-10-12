import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-select performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'select',
        create: () => {
          const element = document.createElement('zd-select');
          element.setAttribute('label', 'Specialty');
          element.innerHTML = repeat(20, (n) => `<option value="sp_${n}">Specialty ${n}</option>`);
          return element;
        },
        update: (element, i) =>
          ((element as HTMLElement & { value: string }).value = `sp_${(i % 20) + 1}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
