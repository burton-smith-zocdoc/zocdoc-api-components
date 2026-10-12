import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-radio-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'radio-group',
        create: () => {
          const element = document.createElement('zd-radio-group');
          element.setAttribute('label', 'Visit type');
          element.innerHTML = repeat(
            5,
            (n) => `<zd-radio value="option-${n}" label="Option ${n}"></zd-radio>`
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
