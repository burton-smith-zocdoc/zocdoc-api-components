import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-tab performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('tab', 'zd-tab');
  });
});
