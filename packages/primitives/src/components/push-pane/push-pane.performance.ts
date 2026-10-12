import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-push-pane performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('push-pane', 'zd-push-pane');
  });
});
