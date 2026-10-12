import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-button-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'button-group',
        create: () => {
          const element = document.createElement('zd-button-group');
          element.setAttribute('label', 'Actions');
          element.innerHTML = repeat(5, (n) => `<zd-button>Action ${n}</zd-button>`);
          return element;
        },
        update: (element) => element.toggleAttribute('vertical'),
      },
      COMPOSED_OPTIONS
    );
  });
});
