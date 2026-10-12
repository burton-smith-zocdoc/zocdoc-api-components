import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-skeleton performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('skeleton', 'zd-skeleton');
  });
});
