import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-avatar performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('avatar', 'zd-avatar');
  });
});
