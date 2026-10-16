import type { BrowserCommand } from 'vitest/node';

/**
 * Chrome's cumulative main-thread counters, read over CDP. A benchmark diffs two readings to
 * split a sample's wall time into style recalc, layout, and script — `performance.now()` alone
 * cannot say where the time went.
 */
export interface MainThreadMetrics {
  /** Seconds, as CDP reports them. */
  RecalcStyleDuration: number;
  LayoutDuration: number;
  ScriptDuration: number;
  TaskDuration: number;
  RecalcStyleCount: number;
  LayoutCount: number;
}

type CdpSession = { send: (method: string, params?: object) => Promise<any> };
const sessions = new WeakMap<object, Promise<CdpSession>>();

/** Playwright only: one CDP session per page, with the Performance domain enabled once. */
export const mainThreadMetrics: BrowserCommand<[]> = async (context) => {
  const page = (context as unknown as { page: { context(): any } }).page;
  let session = sessions.get(page);
  if (!session) {
    session = (async () => {
      const cdp: CdpSession = await page.context().newCDPSession(page);
      await cdp.send('Performance.enable', { timeDomain: 'threadTicks' });
      return cdp;
    })();
    sessions.set(page, session);
  }
  const { metrics } = (await (await session).send('Performance.getMetrics')) as {
    metrics: { name: string; value: number }[];
  };
  const byName = Object.fromEntries(metrics.map((m) => [m.name, m.value]));
  return {
    RecalcStyleDuration: byName.RecalcStyleDuration ?? 0,
    LayoutDuration: byName.LayoutDuration ?? 0,
    ScriptDuration: byName.ScriptDuration ?? 0,
    TaskDuration: byName.TaskDuration ?? 0,
    RecalcStyleCount: byName.RecalcStyleCount ?? 0,
    LayoutCount: byName.LayoutCount ?? 0,
  } satisfies MainThreadMetrics;
};
