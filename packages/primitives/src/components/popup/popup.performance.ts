import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-popup performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('popup', 'zd-popup');
  });
});
