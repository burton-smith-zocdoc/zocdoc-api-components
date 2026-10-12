import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-menu performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'menu',
        create: () => {
          const element = document.createElement('zd-menu');
          element.innerHTML =
            '<button slot="trigger">Options</button>' +
            repeat(5, (n) => `<zd-menu-item>Action ${n}</zd-menu-item>`);
          return element;
        },
        update: (element, i) =>
          element.setAttribute('placement', i % 2 ? 'bottom-start' : 'bottom-end'),
      },
      COMPOSED_OPTIONS
    );
  });
});
