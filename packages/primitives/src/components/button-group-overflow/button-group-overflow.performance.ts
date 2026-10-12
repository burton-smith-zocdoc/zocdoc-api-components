import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-button-group-overflow performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('button-group-overflow', 'zd-button-group-overflow');
  });
});
