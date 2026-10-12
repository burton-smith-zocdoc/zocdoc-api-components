import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-divider performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('divider', 'zd-divider');
  });
});
