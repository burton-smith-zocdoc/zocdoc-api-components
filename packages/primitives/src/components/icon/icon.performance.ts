import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';

/**
 * Decorative (no `label`): Charm's `syncIconNode` rewrites the label span's text outside Lit, so a
 * labelled icon throws on its next render.
 */
describe('zd-icon performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'icon',
      create: () => {
        const element = document.createElement('zd-icon');
        element.setAttribute('name', 'calendar');
        return element;
      },
      update: (element, i) => element.setAttribute('name', i % 2 ? 'calendar' : 'search'),
    });
  });
});
