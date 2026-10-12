import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

const repeat = (count: number, item: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-breadcrumb performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'breadcrumb',
        create: () => {
          const element = document.createElement('zd-breadcrumb');
          element.innerHTML =
            repeat(
              4,
              (n) => `<zd-breadcrumb-item href="/level-${n}">Level ${n}</zd-breadcrumb-item>`
            ) + '<zd-breadcrumb-item current>Current</zd-breadcrumb-item>';
          return element;
        },
        update: (element, i) => element.setAttribute('label', `Breadcrumb ${i}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
