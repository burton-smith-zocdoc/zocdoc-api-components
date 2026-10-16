/**
 * Diagnostic mount profiler, run with `pnpm test:profile` (`PERF_PROFILE=1`). Unlike the TEST-004
 * harness, each sample:
 *
 * - waits for *full* readiness — every descendant settled plus a component-specific check (menu
 *   items initialised, select options rendered) — not just the host's first update;
 * - ends with a forced layout, so the style and layout work a browser would otherwise defer to
 *   the next frame lands inside the sample;
 * - diffs Chrome's main-thread counters (CDP `Performance.getMetrics`) across the sample, which
 *   splits the wall time into style recalc, layout, and script.
 *
 * Report-only, like everything else here: it prints a table and asserts nothing about timings.
 */
import { commands } from 'vitest/browser';
import type { MainThreadMetrics } from './cdp.ts';

declare module 'vitest/browser' {
  interface BrowserCommands {
    mainThreadMetrics: () => Promise<MainThreadMetrics>;
  }
}

export interface ProfileCase {
  /** Row label, e.g. `zd menu` or `zd menu (no transition)`. */
  label: string;
  /** Mounts `count` instances into `host`; returns a disposer. */
  mount: (host: HTMLElement, count: number) => () => void;
  /** Resolves once every instance in `host` is fully ready. */
  ready: (host: HTMLElement) => Promise<void>;
}

export interface ProfileRow {
  label: string;
  count: number;
  samples: number;
  /** Medians, in ms. */
  wall: number;
  style: number;
  layout: number;
  script: number;
  /** Medians of how many style recalcs and layouts each sample triggered. */
  styleRecalcs: number;
  layouts: number;
}

const median = (values: number[]) => {
  // oxlint-disable-next-line no-array-sort -- sorts a copy
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)]!;
};

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

type Updatable = HTMLElement & { updateComplete?: Promise<unknown>; isUpdatePending?: boolean };

function descendants(root: ParentNode): Updatable[] {
  const found: Updatable[] = [];
  for (const element of root.querySelectorAll<Updatable>('*')) {
    found.push(element);
    if (element.shadowRoot) found.push(...descendants(element.shadowRoot));
  }
  return found;
}

/**
 * Settles every Lit element under `root`, shadow roots included, until none has an update
 * pending — slotchange handlers schedule follow-up updates after the first render. Microtasks
 * only, never a timer or frame, so nothing but the components' own work is timed.
 */
export async function settleDescendants(root: ParentNode, maxRounds = 20): Promise<void> {
  for (let round = 0; round < maxRounds; round++) {
    // oxlint-disable-next-line no-await-in-loop -- each round depends on the last
    await Promise.all(descendants(root).map((element) => element.updateComplete));
    // oxlint-disable-next-line no-await-in-loop -- let slotchange and observer microtasks run
    await Promise.resolve();
    if (!descendants(root).some((element) => element.isUpdatePending)) return;
  }
  throw new Error('descendants never settled');
}

/** Yields one task — `toggle` events and floating-ui's first position land in later tasks. */
const nextTask = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.addEventListener('message', () => resolve(), { once: true });
    channel.port1.start();
    channel.port2.postMessage(null);
  });

/**
 * Polls a condition: microtask rounds first, then task yields; rejects rather than hang on a
 * broken fixture. Waiting across tasks adds idle time to the wall clock but not to the CDP
 * durations, which count only work the main thread did.
 */
export async function until(check: () => boolean, what: string): Promise<void> {
  for (let round = 0; round < 50; round++) {
    if (check()) return;
    // oxlint-disable-next-line no-await-in-loop -- polling
    await Promise.resolve();
  }
  for (let round = 0; round < 200; round++) {
    if (check()) return;
    // oxlint-disable-next-line no-await-in-loop -- polling
    await nextTask();
  }
  throw new Error(`never became ready: ${what}`);
}

type Sample = Pick<ProfileRow, 'wall' | 'style' | 'layout' | 'script' | 'styleRecalcs' | 'layouts'>;

async function sampleOnce(profile: ProfileCase, count: number): Promise<Sample> {
  const host = document.createElement('div');
  document.body.append(host);
  // Flush anything pending from the previous sample so it is not billed to this one.
  host.getBoundingClientRect();
  const before = await commands.mainThreadMetrics();
  const start = performance.now();
  const dispose = profile.mount(host, count);
  await profile.ready(host);
  host.getBoundingClientRect();
  const wall = performance.now() - start;
  const after = await commands.mainThreadMetrics();
  for (let frame = 0; frame < 3; frame++) {
    // oxlint-disable-next-line no-await-in-loop -- settle before teardown
    await nextFrame();
  }
  dispose();
  host.remove();
  return {
    wall,
    style: (after.RecalcStyleDuration - before.RecalcStyleDuration) * 1000,
    layout: (after.LayoutDuration - before.LayoutDuration) * 1000,
    script: (after.ScriptDuration - before.ScriptDuration) * 1000,
    styleRecalcs: after.RecalcStyleCount - before.RecalcStyleCount,
    layouts: after.LayoutCount - before.LayoutCount,
  };
}

export async function profileMounts(
  cases: ProfileCase[],
  { counts = [1, 50], iterations = 15, warmups = 3 } = {}
): Promise<ProfileRow[]> {
  if (!globalThis.crossOriginIsolated) throw new Error('page is not cross-origin isolated');
  const rows: ProfileRow[] = [];
  for (const count of counts) {
    for (const profile of cases) {
      for (let i = 0; i < warmups; i++) {
        // oxlint-disable-next-line no-await-in-loop -- samples never overlap
        await sampleOnce(profile, count);
      }
      const samples: Sample[] = [];
      for (let i = 0; i < iterations; i++) {
        // oxlint-disable-next-line no-await-in-loop -- samples never overlap
        samples.push(await sampleOnce(profile, count));
      }
      const pick = (key: keyof Sample) => median(samples.map((s) => s[key]));
      rows.push({
        label: profile.label,
        count,
        samples: iterations,
        wall: pick('wall'),
        style: pick('style'),
        layout: pick('layout'),
        script: pick('script'),
        styleRecalcs: pick('styleRecalcs'),
        layouts: pick('layouts'),
      });
    }
  }
  // oxlint-disable-next-line no-console -- the table is the output
  console.warn(profileTable(rows));
  return rows;
}

export function profileTable(rows: ProfileRow[]): string {
  const header = `${'Case'.padEnd(34)} |   N |   Wall ms |  Style ms | Layout ms | Script ms | Recalcs | Layouts`;
  const lines = rows.map((r) =>
    [
      r.label.padEnd(34),
      String(r.count).padStart(3),
      r.wall.toFixed(2).padStart(9),
      r.style.toFixed(2).padStart(9),
      r.layout.toFixed(2).padStart(9),
      r.script.toFixed(2).padStart(9),
      String(r.styleRecalcs).padStart(7),
      String(r.layouts).padStart(7),
    ].join(' | ')
  );
  return `\n[mount-profile]\n\n${header}\n${'-'.repeat(header.length)}\n${lines.join('\n')}\n`;
}
