import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

describe('zd-tabs performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'tabs',
        create: () => {
          const element = document.createElement('zd-tabs');
          element.innerHTML =
            '<zd-tab id="tab-one">One</zd-tab><zd-tab id="tab-two">Two</zd-tab>' +
            '<zd-tab-panel slot="tabpanel">Panel one</zd-tab-panel>' +
            '<zd-tab-panel slot="tabpanel">Panel two</zd-tab-panel>';
          return element;
        },
        update: (element, i) => element.setAttribute('active-id', i % 2 ? 'tab-one' : 'tab-two'),
      },
      COMPOSED_OPTIONS
    );
  });
});
