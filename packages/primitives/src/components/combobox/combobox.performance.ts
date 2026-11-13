import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-combobox performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'combobox',
        create: () => {
          const element = document.createElement('zd-combobox');
          element.setAttribute('label', 'Specialty');
          element.innerHTML = repeat(
            20,
            (n) => `<zd-option value="sp_${n}">Specialty ${n}</zd-option>`
          );
          return element;
        },
        update: (element, i) => element.setAttribute('placeholder', `Search ${i}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
