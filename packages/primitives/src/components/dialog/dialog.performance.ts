import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';

/**
 * Rerender changes `heading`, not `open`: opening calls `showModal()`, and fifty open modals in
 * one document is not a realistic bulk case.
 */
describe('zd-dialog performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'dialog',
        create: () => {
          const element = document.createElement('zd-dialog');
          element.innerHTML =
            '<span slot="heading">Cancel appointment</span>' +
            '<p>Are you sure you want to cancel?</p>' +
            '<zd-button slot="footer">Keep it</zd-button><zd-button slot="footer">Cancel it</zd-button>';
          return element;
        },
        update: (element, i) => element.setAttribute('heading', `Dialog ${i}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
