import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-checkbox-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'checkbox-group',
        create: () => {
          const element = document.createElement('zd-checkbox-group');
          element.setAttribute('label', 'Preferred times');
          element.innerHTML = repeat(
            5,
            (n) => `<zd-checkbox value="option-${n}" label="Option ${n}"></zd-checkbox>`
          );
          return element;
        },
        update: (element, i) =>
          ((element as HTMLElement & { value: string }).value = `option-${(i % 5) + 1}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
