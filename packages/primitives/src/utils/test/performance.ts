/**
 * Report-only component benchmarks (TEST-004), ported from charm-ux/core's
 * component-performance harness.
 *
 * Times three scenarios with `performance.now()` — mount, rerender, and bulk mount of N
 * instances — prints median / p95 / min / max, and records the same numbers to
 * `performance-results/<package>.json` for diffing two local runs. Nothing here asserts on a
 * number: timings on a shared laptop are too noisy for a budget to mean anything.
 *
 * Differences from charm: bulk counts run one after another (charm interleaves them under
 * `Promise.all`, skewing every sample), and a `ready` hook lets async components be timed to
 * their success render rather than their first Lit update.
 */
import type { ReactiveElement } from 'lit';
import { commands } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    /** Registered by `vitest.performance.config.ts`; absent from every other project. */
    recordPerformance: (pkg: string, name: string, report: PerformanceReport) => Promise<void>;
  }
}

export interface TimingSummary {
  count: number;
  min: number;
  median: number;
  p95: number;
  max: number;
}

/** Keyed `mount`, `rerender`, then `bulk/<n>` in ascending order. */
export type PerformanceReport = Record<string, TimingSummary>;

export interface PerformanceCase<T extends HTMLElement = HTMLElement> {
  /** The results key — the component's directory name, e.g. `menu`. */
  name: string;
  /** A fresh, unconnected element with whatever children or data it needs. */
  create: () => T;
  /** One realistic input change. Async components must pick one that does not refetch. */
  update: (element: T, iteration: number) => void;
  /** Resolves once the element shows what a user would call "rendered". Default: `updateComplete`. */
  ready?: (element: T) => Promise<void>;
}

export interface PerformanceOptions {
  iterations?: number;
  warmups?: number;
  bulkCounts?: readonly number[];
  /** Results file to merge into (`performance-results/<record>.json`), or `false` to skip. */
  record?: string | false;
}

/** The smaller run charm uses for components that mount a tree of children. */
export const COMPOSED_OPTIONS: PerformanceOptions = {
  iterations: 10,
  warmups: 2,
  bulkCounts: [10, 50],
};

/** How many rounds of "await every update, then a frame" teardown waits before moving on. */
const SETTLE_FRAMES = 5;

type Updatable = HTMLElement & { updateComplete?: Promise<unknown> };

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function updated(element: HTMLElement): Promise<void> {
  await (element as Updatable).updateComplete;
}

/**
 * Polls for a rendered part in the element's shadow root — the signal async components use
 * for "success", since a part only the success template renders cannot be mistaken for the
 * loading render. Rejects after `timeout` so a broken mock fails loudly instead of hanging.
 */
export function untilPart(part: string, timeout = 5_000): (element: HTMLElement) => Promise<void> {
  return async (element) => {
    const deadline = performance.now() + timeout;
    while (!element.shadowRoot?.querySelector(`[part~="${part}"]`)) {
      if (performance.now() > deadline) {
        throw new Error(`${element.localName} never rendered [part~="${part}"]`);
      }
      await updated(element);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    await updated(element);
  };
}

function summarize(samples: number[]): TimingSummary {
  const sorted = [...samples].sort((a, b) => a - b);
  const at = (p: number) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)]!;
  return {
    count: samples.length,
    min: sorted[0]!,
    median: at(0.5),
    p95: at(0.95),
    max: sorted[sorted.length - 1]!,
  };
}

function descendants(root: HTMLElement): HTMLElement[] {
  const found = [root];
  const visit = (parent: ParentNode) => {
    for (const element of parent.querySelectorAll<HTMLElement>('*')) {
      found.push(element);
      if (element.shadowRoot) visit(element.shadowRoot);
    }
  };
  visit(root);
  return found;
}

/**
 * Lets children and their own updates finish before the next sample, so one sample's trailing
 * work is never billed to the next. Bounded: a component that re-requests updates forever (an
 * animation, a resize loop) still lets the run move on.
 */
async function settleAndRemove(host: HTMLElement): Promise<void> {
  for (let frame = 0; frame < SETTLE_FRAMES; frame++) {
    await Promise.all(descendants(host).map(updated));
    await nextFrame();
  }
  host.remove();
}

function attachHost(): HTMLElement {
  const host = document.createElement('div');
  document.body.append(host);
  return host;
}

/** One sample at a time, on purpose: overlapping samples is the interference being avoided. */
async function sample(
  run: (iteration: number) => Promise<number>,
  iterations: number,
  warmups: number
): Promise<TimingSummary> {
  for (let i = 0; i < warmups; i++) await run(i);
  const samples: number[] = [];
  for (let i = 0; i < iterations; i++) samples.push(await run(i));
  return summarize(samples);
}

function ms(value: number): string {
  return `${value.toFixed(2)}ms`.padStart(10);
}

function table(name: string, report: PerformanceReport): string {
  const header = `${'Scenario'.padEnd(10)} | Samples |     Median |        P95 |        Min |        Max`;
  const rows = Object.entries(report).map(([scenario, s]) =>
    [
      scenario.padEnd(10),
      String(s.count).padStart(7),
      ms(s.median),
      ms(s.p95),
      ms(s.min),
      ms(s.max),
    ].join(' | ')
  );
  return `[component-performance] ${name}\n${header}\n${'-'.repeat(header.length)}\n${rows.join('\n')}`;
}

export async function benchmarkComponent<T extends HTMLElement>(
  component: PerformanceCase<T>,
  options: PerformanceOptions = {}
): Promise<PerformanceReport> {
  const iterations = options.iterations ?? 20;
  const warmups = options.warmups ?? 3;
  const bulkCounts = options.bulkCounts ?? [10, 50, 100];
  const record = options.record ?? 'primitives';
  const ready = component.ready ?? updated;
  if (record !== false && !globalThis.crossOriginIsolated) {
    // Without isolation Chrome clamps performance.now() to 0.1ms, coarser than most samples.
    throw new Error(
      `${component.name}: the page is not cross-origin isolated, so timings would be clamped to 0.1ms — run through vitest.performance.config.ts`
    );
  }

  const mount = async () => {
    const host = attachHost();
    const start = performance.now();
    const element = component.create();
    host.append(element);
    await ready(element);
    const duration = performance.now() - start;
    await settleAndRemove(host);
    return duration;
  };

  const rerender = async (iteration: number) => {
    const host = attachHost();
    const element = component.create();
    host.append(element);
    await ready(element);
    const start = performance.now();
    component.update(element, iteration);
    // A no-op update times an already-resolved `updateComplete`, so it would report 0ms.
    const scheduled = (element as Partial<ReactiveElement>).isUpdatePending !== false;
    await ready(element);
    const duration = performance.now() - start;
    await settleAndRemove(host);
    if (!scheduled) {
      throw new Error(
        `${component.name}: update() at iteration ${iteration} scheduled no render — change state away from what create() set`
      );
    }
    return duration;
  };

  const bulk = (count: number) => async () => {
    const host = attachHost();
    const fragment = document.createDocumentFragment();
    const start = performance.now();
    const elements: T[] = [];
    for (let i = 0; i < count; i++) elements.push(fragment.appendChild(component.create()));
    host.append(fragment);
    await Promise.all(elements.map((element) => ready(element)));
    const duration = performance.now() - start;
    await settleAndRemove(host);
    return duration;
  };

  const report: PerformanceReport = {
    mount: await sample(mount, iterations, warmups),
    rerender: await sample(rerender, iterations, warmups),
  };
  // Sequential on purpose: concurrent bulk runs share one document and skew each other.
  for (const count of bulkCounts) {
    report[`bulk/${count}`] = await sample(
      bulk(count),
      Math.max(5, Math.floor(iterations / 2)),
      warmups
    );
  }

  console.warn(table(component.name, report));
  if (record !== false) await commands.recordPerformance(record, component.name, report);
  return report;
}

/** For components with nothing meaningful to change: rerender is a bare `requestUpdate()`. */
export function benchmarkTag(
  name: string,
  tagName: string,
  options?: PerformanceOptions
): Promise<PerformanceReport> {
  return benchmarkComponent(
    {
      name,
      create: () => document.createElement(tagName),
      update: (element) => (element as HTMLElement & { requestUpdate(): void }).requestUpdate(),
    },
    options
  );
}
