import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-overflow performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('overflow', 'zd-overflow');
  });
});
