import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-accordion-item performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('accordion-item', 'zd-accordion-item');
  });
});
