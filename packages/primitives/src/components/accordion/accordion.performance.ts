import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-accordion performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'accordion',
        create: () => {
          const element = document.createElement('zd-accordion');
          element.innerHTML = repeat(
            5,
            (n) =>
              `<zd-accordion-item heading="Section ${n}"><p>Content ${n}</p></zd-accordion-item>`
          );
          return element;
        },
        update: (element) => element.toggleAttribute('open-single'),
      },
      COMPOSED_OPTIONS
    );
  });
});
