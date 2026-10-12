import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-breadcrumb-item performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('breadcrumb-item', 'zd-breadcrumb-item');
  });
});
