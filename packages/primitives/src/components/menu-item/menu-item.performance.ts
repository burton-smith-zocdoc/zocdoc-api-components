import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-menu-item performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('menu-item', 'zd-menu-item');
  });
});
