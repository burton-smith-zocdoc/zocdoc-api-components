import { afterEach, describe, expect, it } from 'vitest';
import {
  configureZocdoc,
  getZocdocConfig,
  resetZocdocConfig,
  whenZocdocConfigured,
} from '../configure.js';

const CONFIG = { baseUrl: 'https://example.test', getToken: 'tok' };

afterEach(() => {
  resetZocdocConfig();
});

describe('getZocdocConfig', () => {
  it('throws with the call to make when nothing has been configured', () => {
    expect(() => getZocdocConfig()).toThrow(/configureZocdoc/);
  });
});

describe('whenZocdocConfigured', () => {
  it('resolves immediately once configured', async () => {
    configureZocdoc(CONFIG);

    await expect(whenZocdocConfigured()).resolves.toBeUndefined();
  });

  /**
   * The ordering the helper exists for: a component upgraded from static markup asks before the
   * host script has run. `settled` proves it is still waiting rather than having resolved on a
   * missing configuration, which would defeat the point.
   */
  it('waits for a later configureZocdoc', async () => {
    let settled = false;
    const waited = (async () => {
      await whenZocdocConfigured();
      settled = true;
    })();

    await Promise.resolve();
    expect(settled).toBe(false);

    configureZocdoc(CONFIG);
    await waited;

    expect(settled).toBe(true);
  });

  it('resolves every waiter, so two components can each wait', async () => {
    const both = Promise.all([whenZocdocConfigured(), whenZocdocConfigured()]);

    configureZocdoc(CONFIG);

    await expect(both).resolves.toHaveLength(2);
  });
});
