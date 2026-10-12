import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-badge performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('badge', 'zd-badge');
  });
});
