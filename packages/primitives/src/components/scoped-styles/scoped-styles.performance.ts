import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-scoped-styles performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('scoped-styles', 'zd-scoped-styles');
  });
});
