import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-menu-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'menu-group',
        create: () => {
          const element = document.createElement('zd-menu-group');
          element.setAttribute('heading', 'Actions');
          element.innerHTML = repeat(5, (n) => `<zd-menu-item>Action ${n}</zd-menu-item>`);
          return element;
        },
        update: (element, i) => element.setAttribute('heading', `Group ${i}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
