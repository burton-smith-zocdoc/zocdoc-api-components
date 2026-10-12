# Component Performance Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every component in `packages/primitives` (36) and `packages/api-components` (13) gets a report-only `<name>.performance.ts` benchmark, run locally with `pnpm test:performance`.

**Architecture:** A separate `vitest.performance.config.ts` runs one Chromium browser project over `*.performance.ts` files only. A shared harness in `packages/primitives/src/utils/test/performance.ts` (ported from charm-ux/core) times mount, rerender and bulk mount, prints a table, and records results through a custom browser command into gitignored `performance-results/<package>.json`. Nothing fails on a number.

**Tech Stack:** Vitest 4.1 browser mode, `@vitest/browser-playwright` (installed Chrome), Lit 3 / Charm UX, TypeScript 5.9, oxlint.

**Spec:** `docs/superpowers/specs/2026-10-12-component-performance-tests-design.md`

## Global Constraints

- Report-only: no budgets, thresholds or baseline comparison; a benchmark fails only when a component throws or never becomes ready.
- Local only: not in CI, not collected by `pnpm test` / `test:components` / `test:client`.
- Chromium only, via `playwright({ launchOptions: { channel: 'chrome' } })`, headless, `fileParallelism: false`.
- Defaults: `iterations: 20`, `warmups: 3`, `bulkCounts: [10, 50, 100]`; bulk samples `max(5, floor(iterations / 2))`; composed primitives use `{ iterations: 10, warmups: 2, bulkCounts: [10, 50] }`.
- Bulk counts run sequentially, never under `Promise.all`.
- Benchmarks write literal `zd-*` tags (PBZD-003 governs templates, not tests).
- Primitive benchmarks import **no** component module (the setup file already registered every `zd-*` tag from the primitives build). API component benchmarks import `./index.js`.
- API benchmarks mock client-layer functions with `vi.mock(path, { spy: true })` + `vi.spyOn(...).mockResolvedValue(...)`, never `fetch` (TEST-002).
- Fixture data only from `client/mock/fixtures.ts` / documented scenarios (TEST-003, PHI-002). No new real-looking names, phones, or emails.
- Async components' rerender changes an input that does **not** refetch.
- `.performance.ts` files are excluded from both packages' `tsconfig.build.json` and from CEM generation; `performance-results/` is gitignored.
- No new npm dependencies.
- Commit messages end with:
  ```
  Generated with AI

  Co-Authored-By: Claude Code
  ```

## Review Focus

1. **`ready` resolving too early on async components** — a benchmark that awaits only `updateComplete` reports the loading render, not success. Each async `ready` must wait for a success-only part; Task 4 adds a sanity assertion that the part exists after `benchmarkComponent` returns.
2. **Results file corruption across files** — 36 primitive files merge into one JSON; a read-modify-write race or a missing file must not lose earlier entries. Files run sequentially (`fileParallelism: false`) and the command treats a missing/empty file as `{}`; Task 1 tests the command's merge directly.
3. **Leaked elements or mocks between benchmarks** — every sample must remove its host; `vi.restoreAllMocks()` after each API file. Task 2's harness test asserts `document.body` is empty after a run.
4. **Perf files leaking into normal runs or `dist`** — Task 1 verifies `vitest list` and a `build:types` grep.
5. **A component that never settles** (perpetual animation such as spinner/skeleton, popup positioning) hanging `settleTree` — settle is bounded to 5 frames and never awaits anything open-ended; Task 2's test covers an element whose `updateComplete` keeps re-triggering.

---

## File Structure

| File | Responsibility |
|---|---|
| `vitest.performance.config.ts` (create) | Perf-only Vitest config + `recordPerformance` browser command |
| `tools/performance/src/record.ts` (create) | Pure merge-to-JSON function used by the command (node-testable) |
| `tools/performance/src/record.test.ts` (create) | Node test for the merge (runs in existing `tools` project) |
| `packages/primitives/src/utils/test/performance.ts` (create) | Harness: `benchmarkComponent`, `benchmarkTag`, types, settle |
| `packages/primitives/src/__tests__/performance-harness.test.ts` (create) | Browser test of the harness itself (runs in the existing `components` project) |
| `packages/primitives/src/components/<name>/<name>.performance.ts` ×36 (create) | Primitive benchmarks |
| `packages/api-components/src/components/<name>/<name>.performance.ts` ×13 (create) | API component benchmarks |
| `package.json` (modify) | `test:performance` script |
| `packages/{primitives,api-components}/tsconfig.build.json` (modify) | exclude `**/*.performance.ts` |
| `cem-generator.config.base.mjs` (modify) | exclude `**/*.performance.ts` |
| `.gitignore` (modify) | `performance-results/` |
| `.oxlintrc.json` (modify) | vitest plugin + `no-console: off` for `**/*.performance.ts` |
| `.agents/rules/testing/TEST-004.md` (create), `.claude/rules/testing.md`, `AGENTS.md`, `.claude/skills/create-component/SKILL.md`, `.claude/skills/testing/SKILL.md` (modify) | Docs |

`tools/performance/src/` sits under the existing `tools` Vitest project glob (`tools/*/src/**/*.test.ts`) and the root `tsconfig.json` include (`tools/*/src/**/*.ts`), so it needs no config of its own beyond a `tsconfig.json` copied from `tools/cem-css-prefix/`.

---

### Task 1: Perf config, results recorder, isolation

**Files:**
- Create: `tools/performance/src/record.ts`
- Create: `tools/performance/src/record.test.ts`
- Create: `tools/performance/tsconfig.json` (copy of `tools/cem-css-prefix/tsconfig.json`)
- Create: `vitest.performance.config.ts`
- Modify: `package.json` (scripts)
- Modify: `packages/primitives/tsconfig.build.json`, `packages/api-components/tsconfig.build.json`
- Modify: `cem-generator.config.base.mjs:9`
- Modify: `.gitignore`
- Modify: `.oxlintrc.json`

**Interfaces:**
- Produces: `recordPerformance(file: string, name: string, report: PerformanceReport): Promise<void>` in node; browser command `commands.recordPerformance(pkg: string, name: string, report: Record<string, TimingSummary>)` typed via `declare module 'vitest/browser'` in the harness (Task 2).
- `PerformanceReport` (node side) = `Record<string, { count: number; min: number; median: number; p95: number; max: number }>`.

- [ ] **Step 1: Write the failing node test**

`tools/performance/src/record.test.ts`:

```ts
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { recordPerformance } from './record.js';

const SUMMARY = { count: 20, min: 1, median: 2, p95: 3, max: 4 };

describe('recordPerformance', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'perf-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('creates the file and its directory on first write', async () => {
    const file = join(dir, 'nested', 'primitives.json');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({ badge: { mount: SUMMARY } });
  });

  it('merges into existing entries rather than replacing them', async () => {
    const file = join(dir, 'primitives.json');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    await recordPerformance(file, 'button', { mount: SUMMARY });
    expect(Object.keys(JSON.parse(await readFile(file, 'utf8')))).toEqual(['badge', 'button']);
  });

  it('overwrites the entry for a component that runs again', async () => {
    const file = join(dir, 'primitives.json');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    await recordPerformance(file, 'badge', { rerender: SUMMARY });
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({ badge: { rerender: SUMMARY } });
  });

  it('treats an empty or unreadable file as no results', async () => {
    const file = join(dir, 'primitives.json');
    await writeFile(file, '');
    await recordPerformance(file, 'badge', { mount: SUMMARY });
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({ badge: { mount: SUMMARY } });
  });

  it('writes keys sorted so two runs diff cleanly', async () => {
    const file = join(dir, 'primitives.json');
    await recordPerformance(file, 'tabs', { mount: SUMMARY });
    await recordPerformance(file, 'alert', { mount: SUMMARY });
    expect(Object.keys(JSON.parse(await readFile(file, 'utf8')))).toEqual(['alert', 'tabs']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project tools tools/performance`
Expected: FAIL — `Cannot find module './record.js'` (or "Failed to load url").

- [ ] **Step 3: Implement the recorder**

`tools/performance/src/record.ts`:

```ts
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface TimingSummary {
  count: number;
  min: number;
  median: number;
  p95: number;
  max: number;
}

export type PerformanceReport = Record<string, TimingSummary>;

/**
 * Merges one component's report into a package's results file. Keys are sorted so two local
 * runs compare with a plain `diff`; a missing or empty file starts from nothing, because the
 * first benchmark of a fresh checkout has no file yet.
 */
export async function recordPerformance(
  file: string,
  name: string,
  report: PerformanceReport
): Promise<void> {
  let results: Record<string, PerformanceReport> = {};
  try {
    const existing = await readFile(file, 'utf8');
    if (existing.trim()) results = JSON.parse(existing) as Record<string, PerformanceReport>;
  } catch {
    // No file yet: first write.
  }

  results[name] = report;
  const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b)));

  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(sorted, null, 2)}\n`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run --project tools tools/performance`
Expected: PASS, 5 tests.

- [ ] **Step 5: Create the perf config**

`vitest.performance.config.ts`:

```ts
import { join } from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import type { BrowserCommand } from 'vitest/node';
import { defineConfig } from 'vitest/config';
import { recordPerformance, type PerformanceReport } from './tools/performance/src/record.ts';

/**
 * Report-only component benchmarks. Kept out of `vitest.config.ts` so `pnpm test` never
 * collects them: timings belong to a developer reading a table, not to a pass/fail run.
 *
 * Chromium only, one file at a time — a second browser or a parallel file adds noise to
 * every number without adding signal.
 */
const RESULTS_DIR = join(import.meta.dirname, 'performance-results');

/** Writes from the browser land in `performance-results/<package>.json`. */
const recordPerformanceCommand: BrowserCommand<[pkg: string, name: string, report: PerformanceReport]> = (
  _context,
  pkg,
  name,
  report
) => recordPerformance(join(RESULTS_DIR, `${pkg}.json`), name, report);

export default defineConfig({
  optimizeDeps: { include: ['culori', 'axe-core'] },
  test: {
    name: 'performance',
    include: ['packages/*/src/components/**/*.performance.ts'],
    setupFiles: ['./packages/api-components/src/utils/test/setup-browser.ts'],
    clearMocks: true,
    fileParallelism: false,
    testTimeout: 60_000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: { channel: 'chrome' } }),
      instances: [{ browser: 'chromium' }],
      commands: { recordPerformance: recordPerformanceCommand },
    },
  },
});
```

- [ ] **Step 6: Add the script, build/CEM excludes, gitignore, lint override**

`package.json` scripts — add after `test:components`:

```json
"test:performance": "pnpm run build:types && vitest run --config vitest.performance.config.ts",
```

`packages/primitives/tsconfig.build.json` — `exclude` becomes:

```json
"exclude": ["**/*.test.ts", "**/*.performance.ts", "**/*.stories.ts", "**/test/**", "**/mock/**"]
```

`packages/api-components/tsconfig.build.json` — `exclude` becomes:

```json
"exclude": ["**/*.test.ts", "**/*.performance.ts", "**/*.stories.ts", "**/test/**"],
```

`cem-generator.config.base.mjs:9`:

```js
export const EXCLUDE = ['**/*.stories.ts', '**/*.test.ts', '**/*.performance.ts', '**/*.styles.ts'];
```

`.gitignore` — append:

```
# Local, report-only benchmark output (pnpm test:performance)
performance-results/
```

`.oxlintrc.json` — in the first override, add perf files to `files` and the two harness entry points to `vitest/expect-expect`'s `assertFunctionNames` (a benchmark's only assertion is that it does not throw):

```json
"files": ["**/*.test.ts", "**/*.performance.ts", "**/__tests__/**", "**/test/**"],
```

```json
"assertFunctionNames": [
  "expect",
  "expectTypeOf",
  "assert",
  "assertType",
  "expectNoViolations",
  "benchmarkComponent",
  "benchmarkTag"
]
```

`tools/performance/tsconfig.json`:

```json
{
  // Same as tools/cem-css-prefix: imported directly by vitest.performance.config.ts, no build step.
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 7: Verify isolation**

Run: `pnpm vitest list --filesOnly | grep -c performance`
Expected: `0` (after Task 3 adds files, re-run — still `0`).

Run: `pnpm vitest list --config vitest.performance.config.ts --filesOnly`
Expected: exits 0 with no files listed yet (or "No test files found" — acceptable at this stage).

Run: `pnpm typecheck && pnpm lint`
Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add tools/performance vitest.performance.config.ts package.json \
  packages/primitives/tsconfig.build.json packages/api-components/tsconfig.build.json \
  cem-generator.config.base.mjs .gitignore .oxlintrc.json
git commit -m "$(cat <<'EOF'
test(perf): add the performance config and results recorder

Generated with AI

Co-Authored-By: Claude Code
EOF
)"
```

---

### Task 2: Benchmark harness

**Files:**
- Create: `packages/primitives/src/utils/test/performance.ts`
- Create: `packages/primitives/src/components/badge/badge.performance.ts` (first real consumer, proves the pipeline)
- Test: `packages/primitives/src/__tests__/performance-harness.test.ts` (runs in the existing `components` project)

**Interfaces:**
- Consumes: browser command `recordPerformance(pkg, name, report)` from Task 1.
- Produces (exact exports of `performance.ts`):
  ```ts
  export interface TimingSummary { count: number; min: number; median: number; p95: number; max: number }
  export type PerformanceReport = Record<string, TimingSummary>; // keys: 'mount' | 'rerender' | `bulk/${n}`
  export interface PerformanceCase<T extends HTMLElement = HTMLElement> {
    name: string;
    create: () => T;
    update: (element: T, iteration: number) => void;
    ready?: (element: T) => Promise<void>;
  }
  export interface PerformanceOptions { iterations?: number; warmups?: number; bulkCounts?: number[]; record?: string | false }
  export const COMPOSED_OPTIONS: PerformanceOptions; // { iterations: 10, warmups: 2, bulkCounts: [10, 50] }
  export function benchmarkComponent<T extends HTMLElement>(c: PerformanceCase<T>, options?: PerformanceOptions): Promise<PerformanceReport>;
  export function benchmarkTag(name: string, tagName: string, options?: PerformanceOptions): Promise<PerformanceReport>;
  export function untilPart(part: string): (element: HTMLElement) => Promise<void>;
  ```
  `record` is the results package name (`'primitives'` default, `'api-components'` for API files, `false` to skip writing — used by the harness test).

- [ ] **Step 1: Write the failing harness test**

`packages/primitives/src/__tests__/performance-harness.test.ts`:

```ts
import { LitElement, html } from 'lit';
import { describe, expect, it } from 'vitest';
import { benchmarkComponent, benchmarkTag, untilPart } from '../utils/test/performance.js';

/** Counts renders so the test can tell mount, rerender and bulk apart. */
class PerfProbe extends LitElement {
  static override properties = { label: {} };
  declare label: string;
  public renders = 0;

  protected override render() {
    this.renders++;
    return html`<span part="label">${this.label}</span>`;
  }
}
customElements.define('perf-probe', PerfProbe);

/** Re-requests an update from every `updated()` — a component that never "settles". */
class PerfRestless extends LitElement {
  protected override updated(): void {
    queueMicrotask(() => this.requestUpdate());
  }
}
customElements.define('perf-restless', PerfRestless);

/** Renders its part only after a macrotask, like a component waiting on a fetch. */
class PerfAsync extends LitElement {
  static override properties = { loaded: { state: true } };
  declare loaded: boolean;

  public override connectedCallback(): void {
    super.connectedCallback();
    setTimeout(() => (this.loaded = true), 0);
  }

  protected override render() {
    return this.loaded ? html`<p part="done">done</p>` : html`<p>loading</p>`;
  }
}
customElements.define('perf-async', PerfAsync);

const FAST = { iterations: 4, warmups: 1, bulkCounts: [3, 6], record: false } as const;

describe('benchmarkComponent', () => {
  it('reports every scenario with the configured sample counts', async () => {
    const report = await benchmarkComponent(
      {
        name: 'probe',
        create: () => document.createElement('perf-probe') as PerfProbe,
        update: (element, i) => ((element as PerfProbe).label = `v${i}`),
      },
      FAST
    );

    expect(Object.keys(report)).toEqual(['mount', 'rerender', 'bulk/3', 'bulk/6']);
    expect(report.mount.count).toBe(4);
    expect(report.rerender.count).toBe(4);
    // max(5, floor(4 / 2)) — bulk never drops below five samples.
    expect(report['bulk/3'].count).toBe(5);
    for (const summary of Object.values(report)) {
      expect(summary.min).toBeLessThanOrEqual(summary.median);
      expect(summary.median).toBeLessThanOrEqual(summary.p95);
      expect(summary.p95).toBeLessThanOrEqual(summary.max);
      expect(summary.min).toBeGreaterThanOrEqual(0);
    }
  });

  it('leaves nothing behind in the document', async () => {
    await benchmarkTag('probe', 'perf-probe', FAST);
    expect(document.body.querySelectorAll('perf-probe')).toHaveLength(0);
  });

  it('finishes for a component whose updates never stop', async () => {
    const report = await benchmarkTag('restless', 'perf-restless', FAST);
    expect(report.mount.count).toBe(4);
  });

  it('waits on ready rather than the first update', async () => {
    let readyCalls = 0;
    await benchmarkComponent(
      {
        name: 'async',
        create: () => document.createElement('perf-async'),
        update: (element) => (element as HTMLElement & { requestUpdate(): void }).requestUpdate(),
        ready: async (element) => {
          readyCalls++;
          await untilPart('done')(element);
        },
      },
      FAST
    );
    // mount + rerender (2 per sample: initial mount and after update) + bulk children.
    expect(readyCalls).toBeGreaterThan(0);
  });

  it('untilPart rejects instead of hanging when the part never renders', async () => {
    const element = document.createElement('perf-probe');
    document.body.append(element);
    await expect(untilPart('missing', 200)(element)).rejects.toThrow('perf-probe never rendered [part~="missing"]');
    element.remove();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --project components packages/primitives/src/__tests__/performance-harness.test.ts`
Expected: FAIL — cannot resolve `../utils/test/performance.js`.

- [ ] **Step 3: Implement the harness**

`packages/primitives/src/utils/test/performance.ts`:

```ts
/**
 * Report-only component benchmarks, ported from charm-ux/core's component-performance harness.
 *
 * Times three scenarios with `performance.now()` — mount, rerender, and bulk mount of N
 * instances — prints median / p95 / min / max, and records the same numbers to
 * `performance-results/<package>.json` for diffing two local runs. Nothing here asserts on a
 * number: timings on a shared laptop are too noisy for a budget to mean anything.
 *
 * Differences from charm: bulk counts run one after another (charm interleaves them under
 * `Promise.all`, skewing every sample); a `ready` hook lets async components be timed to
 * their success render rather than their first Lit update.
 */
import { commands } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
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
  bulkCounts?: number[];
  /** Results file to merge into (`performance-results/<record>.json`), or `false` to skip. */
  record?: string | false;
}

/** The smaller run charm uses for components that mount a tree of children. */
export const COMPOSED_OPTIONS: PerformanceOptions = { iterations: 10, warmups: 2, bulkCounts: [10, 50] };

/** How many rounds of "await every update, then a frame" a teardown waits before giving up. */
const SETTLE_FRAMES = 5;

type Updatable = HTMLElement & { updateComplete?: Promise<unknown> };

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function updated(element: HTMLElement): Promise<void> {
  await (element as Updatable).updateComplete;
}

/**
 * Polls for a rendered part in the element's shadow root — the signal async components use
 * for "success", since a part that only the success template renders cannot be mistaken
 * for the loading render. Rejects after `timeout` so a broken mock fails loudly.
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
  const percentile = (p: number) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)]!;
  return {
    count: samples.length,
    min: sorted[0]!,
    median: percentile(0.5),
    p95: percentile(0.95),
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
 * Lets children and their own updates finish before the next sample, so one sample's
 * trailing work is never billed to the next. Bounded: a component that re-requests updates
 * forever (an animation, a resize loop) still lets the run move on.
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

async function sample(run: (iteration: number) => Promise<number>, iterations: number, warmups: number) {
  for (let i = 0; i < warmups; i++) await run(i);
  const samples: number[] = [];
  for (let i = 0; i < iterations; i++) samples.push(await run(i));
  return summarize(samples);
}

function table(name: string, report: PerformanceReport): string {
  const header = `${'Scenario'.padEnd(10)} | Samples |     Median |        P95 |        Min |        Max`;
  const ms = (value: number) => `${value.toFixed(2)}ms`.padStart(10);
  const rows = Object.entries(report).map(([scenario, s]) =>
    [scenario.padEnd(10), String(s.count).padStart(7), ms(s.median), ms(s.p95), ms(s.min), ms(s.max)].join(' | ')
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
    await ready(element);
    const duration = performance.now() - start;
    await settleAndRemove(host);
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
    report[`bulk/${count}`] = await sample(bulk(count), Math.max(5, Math.floor(iterations / 2)), warmups);
  }

  console.warn(table(component.name, report));
  if (record !== false) await commands.recordPerformance(record, component.name, report);
  return report;
}

/** For leaf components with nothing to change: rerender is a bare `requestUpdate()`. */
export function benchmarkTag(name: string, tagName: string, options?: PerformanceOptions): Promise<PerformanceReport> {
  return benchmarkComponent(
    {
      name,
      create: () => document.createElement(tagName),
      update: (element) => (element as HTMLElement & { requestUpdate(): void }).requestUpdate(),
    },
    options
  );
}
```

- [ ] **Step 4: Run the harness test to verify it passes**

Run: `pnpm vitest run --project components packages/primitives/src/__tests__/performance-harness.test.ts`
Expected: PASS, 5 tests. If `commands.recordPerformance` is reported missing in the `components` project, that is expected only when `record` is not `false` — every harness test passes `record: false`, so it must not be called. If importing `vitest/browser` fails typechecking, check `node_modules/vitest/browser/context.d.ts` re-exports `commands` (it does in 4.1.10).

- [ ] **Step 5: Add the first real benchmark**

`packages/primitives/src/components/badge/badge.performance.ts`:

```ts
import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-badge performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('badge', 'zd-badge');
  });
});
```

Task 1 already registered `benchmarkTag` / `benchmarkComponent` with `vitest/expect-expect`, so this file lints clean without an `expect`.

- [ ] **Step 6: Run the pipeline end to end**

Run: `rm -rf performance-results && pnpm test:performance`
Expected: 1 file, 1 test passes; stderr shows `[component-performance] badge` with rows `mount`, `rerender`, `bulk/10`, `bulk/50`, `bulk/100`.

Run: `cat performance-results/primitives.json | head -12`
Expected: `{ "badge": { "mount": { "count": 20, ...` with numeric fields.

Run: `pnpm typecheck && pnpm lint`
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add packages/primitives/src/utils/test/performance.ts \
  packages/primitives/src/__tests__/performance-harness.test.ts \
  packages/primitives/src/components/badge/badge.performance.ts
git commit -m "$(cat <<'EOF'
test(perf): add the component benchmark harness

Generated with AI

Co-Authored-By: Claude Code
EOF
)"
```

---

### Task 3: Primitive benchmarks (remaining 35)

**Files:** Create `packages/primitives/src/components/<name>/<name>.performance.ts` for every primitive except `badge`.

**Interfaces:**
- Consumes: `benchmarkTag`, `benchmarkComponent`, `COMPOSED_OPTIONS` from `../../utils/test/performance.js` (Task 2).

No component module is imported — the setup file registered every `zd-*` tag from the built primitives package, and importing `./<name>.js` from source would define the tag a second time and throw.

- [ ] **Step 1: Leaf primitives with nothing meaningful to change — `benchmarkTag`**

Create one file per name in this list, each exactly this shape with `<name>` substituted:

`accordion-item, avatar, breadcrumb-item, button-group-overflow, card, disclosure, divider, menu-item, overflow, popup, push-pane, scoped-styles, skeleton, spinner, tab, tab-panel`

```ts
import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-<name> performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('<name>', 'zd-<name>');
  });
});
```

For example, `packages/primitives/src/components/divider/divider.performance.ts`:

```ts
import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-divider performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('divider', 'zd-divider');
  });
});
```

- [ ] **Step 2: Leaf primitives with a real attribute to change — `benchmarkComponent`**

Each file below is complete. All start with:

```ts
import { describe, it } from 'vitest';
import { benchmarkComponent } from '../../utils/test/performance.js';
```

`alert/alert.performance.ts`:

```ts
describe('zd-alert performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'alert',
      create: () => {
        const element = document.createElement('zd-alert');
        element.setAttribute('heading', 'Heads up');
        element.setAttribute('open', '');
        element.textContent = 'Your appointment details changed.';
        return element;
      },
      update: (element, i) => element.setAttribute('variant', i % 2 ? 'info' : 'warning'),
    });
  });
});
```

`button/button.performance.ts`:

```ts
describe('zd-button performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'button',
      create: () => {
        const element = document.createElement('zd-button');
        element.textContent = 'Continue';
        return element;
      },
      update: (element, i) => element.toggleAttribute('loading', i % 2 === 0),
    });
  });
});
```

`checkbox/checkbox.performance.ts`:

```ts
describe('zd-checkbox performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'checkbox',
      create: () => {
        const element = document.createElement('zd-checkbox');
        element.textContent = 'Remember me';
        return element;
      },
      update: (element, i) => element.toggleAttribute('checked', i % 2 === 0),
    });
  });
});
```

`icon/icon.performance.ts`:

```ts
describe('zd-icon performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'icon',
      create: () => {
        const element = document.createElement('zd-icon');
        element.setAttribute('name', 'calendar');
        element.setAttribute('label', 'Calendar');
        return element;
      },
      update: (element, i) => element.setAttribute('name', i % 2 ? 'calendar' : 'search'),
    });
  });
});
```

`input/input.performance.ts`:

```ts
describe('zd-input performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'input',
      create: () => {
        const element = document.createElement('zd-input');
        element.setAttribute('label', 'ZIP code');
        return element;
      },
      update: (element, i) => ((element as HTMLElement & { value: string }).value = String(10000 + i)),
    });
  });
});
```

`progress-bar/progress-bar.performance.ts`:

```ts
describe('zd-progress-bar performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'progress-bar',
      create: () => {
        const element = document.createElement('zd-progress-bar');
        element.setAttribute('label', 'Booking progress');
        element.setAttribute('value', '0');
        return element;
      },
      update: (element, i) => element.setAttribute('value', String((i * 10) % 100)),
    });
  });
});
```

`radio/radio.performance.ts`:

```ts
describe('zd-radio performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'radio',
      create: () => {
        const element = document.createElement('zd-radio');
        element.setAttribute('label', 'New patient');
        element.setAttribute('value', 'new');
        return element;
      },
      update: (element, i) => element.toggleAttribute('checked', i % 2 === 0),
    });
  });
});
```

`switch/switch.performance.ts`:

```ts
describe('zd-switch performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'switch',
      create: () => {
        const element = document.createElement('zd-switch');
        element.textContent = 'Video visits only';
        return element;
      },
      update: (element, i) => element.toggleAttribute('checked', i % 2 === 0),
    });
  });
});
```

`text-area/text-area.performance.ts`:

```ts
describe('zd-text-area performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'text-area',
      create: () => {
        const element = document.createElement('zd-text-area');
        element.setAttribute('label', 'Notes for the office');
        return element;
      },
      update: (element, i) => ((element as HTMLElement & { value: string }).value = `Note ${i}`),
    });
  });
});
```

`tooltip/tooltip.performance.ts`:

```ts
describe('zd-tooltip performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent({
      name: 'tooltip',
      create: () => {
        const element = document.createElement('zd-tooltip');
        element.setAttribute('content', 'In-network for your plan');
        return element;
      },
      update: (element, i) => element.setAttribute('content', `Tooltip ${i}`),
    });
  });
});
```

- [ ] **Step 3: Composed primitives — realistic children, `COMPOSED_OPTIONS`**

Each file below is complete. All start with:

```ts
import { describe, it } from 'vitest';
import { benchmarkComponent, COMPOSED_OPTIONS } from '../../utils/test/performance.js';
```

A shared helper for repeated children, defined at the top of each file that needs it:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');
```

`accordion/accordion.performance.ts`:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-accordion performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'accordion',
        create: () => {
          const element = document.createElement('zd-accordion');
          element.innerHTML = repeat(5, (n) => `<zd-accordion-item heading="Section ${n}"><p>Content ${n}</p></zd-accordion-item>`);
          return element;
        },
        update: (element, i) => element.toggleAttribute('open-single', i % 2 === 0),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

`breadcrumb/breadcrumb.performance.ts`:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-breadcrumb performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'breadcrumb',
        create: () => {
          const element = document.createElement('zd-breadcrumb');
          element.innerHTML =
            repeat(4, (n) => `<zd-breadcrumb-item href="/level-${n}">Level ${n}</zd-breadcrumb-item>`) +
            '<zd-breadcrumb-item current>Current</zd-breadcrumb-item>';
          return element;
        },
        update: (element, i) => element.setAttribute('label', `Breadcrumb ${i}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

`button-group/button-group.performance.ts`:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-button-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'button-group',
        create: () => {
          const element = document.createElement('zd-button-group');
          element.setAttribute('label', 'Actions');
          element.innerHTML = repeat(5, (n) => `<zd-button>Action ${n}</zd-button>`);
          return element;
        },
        update: (element, i) => element.toggleAttribute('vertical', i % 2 === 0),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

`dialog/dialog.performance.ts`:

```ts
describe('zd-dialog performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'dialog',
        create: () => {
          const element = document.createElement('zd-dialog');
          element.innerHTML =
            '<span slot="heading">Cancel appointment</span>' +
            '<p>Are you sure you want to cancel?</p>' +
            '<zd-button slot="footer">Keep it</zd-button><zd-button slot="footer">Cancel it</zd-button>';
          return element;
        },
        update: (element, i) => element.setAttribute('heading', `Dialog ${i}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

(Rerender changes `heading`, not `open`: opening a modal dialog calls `showModal()`, and fifty open modals in one document is not a realistic bulk case.)

`menu/menu.performance.ts`:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-menu performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'menu',
        create: () => {
          const element = document.createElement('zd-menu');
          element.innerHTML =
            '<button slot="trigger">Options</button>' +
            repeat(5, (n) => `<zd-menu-item>Action ${n}</zd-menu-item>`);
          return element;
        },
        update: (element, i) => element.setAttribute('placement', i % 2 ? 'bottom-start' : 'bottom-end'),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

The trigger slot is `trigger`, as in `menu.test.ts:12`.

`menu-group/menu-group.performance.ts`:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-menu-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'menu-group',
        create: () => {
          const element = document.createElement('zd-menu-group');
          element.setAttribute('heading', 'Actions');
          element.innerHTML = repeat(5, (n) => `<zd-menu-item>Action ${n}</zd-menu-item>`);
          return element;
        },
        update: (element, i) => element.setAttribute('heading', `Group ${i}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

`radio-group/radio-group.performance.ts`:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-radio-group performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'radio-group',
        create: () => {
          const element = document.createElement('zd-radio-group');
          element.setAttribute('label', 'Visit type');
          element.innerHTML = repeat(5, (n) => `<zd-radio value="option-${n}" label="Option ${n}"></zd-radio>`);
          return element;
        },
        update: (element, i) => ((element as HTMLElement & { value: string }).value = `option-${(i % 5) + 1}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

`select/select.performance.ts`:

```ts
const repeat = (count: number, item: (n: number) => string) => Array.from({ length: count }, (_, i) => item(i + 1)).join('');

describe('zd-select performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'select',
        create: () => {
          const element = document.createElement('zd-select');
          element.setAttribute('label', 'Specialty');
          element.innerHTML = repeat(20, (n) => `<option value="sp_${n}">Specialty ${n}</option>`);
          return element;
        },
        update: (element, i) => ((element as HTMLElement & { value: string }).value = `sp_${(i % 20) + 1}`),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

`tabs/tabs.performance.ts`:

```ts
describe('zd-tabs performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'tabs',
        create: () => {
          const element = document.createElement('zd-tabs');
          element.innerHTML =
            '<zd-tab slot="tab" id="tab-one">One</zd-tab><zd-tab slot="tab" id="tab-two">Two</zd-tab>' +
            '<zd-tab-panel>Panel one</zd-tab-panel><zd-tab-panel>Panel two</zd-tab-panel>';
          return element;
        },
        update: (element, i) => element.setAttribute('active-id', i % 2 ? 'tab-one' : 'tab-two'),
      },
      COMPOSED_OPTIONS
    );
  });
});
```

Note: `tabs.test.ts` is skipped for "a cleanup bug that throws after test completion" in Charm tabs. If the tabs benchmark fails with an error thrown from `handlePanelSlotChange` during teardown, keep the file and mark the `it` with `it.skip` plus the same comment the test uses — do not drop the file.

- [ ] **Step 4: Verify the count and run the suite**

Run: `ls packages/primitives/src/components/*/*.performance.ts | wc -l`
Expected: `36`.

Run: `rm -rf performance-results && pnpm test:performance`
Expected: 36 files pass (or 35 + 1 skipped for tabs, per the note); a `[component-performance] <name>` table for each.

Run: `node -e "console.log(Object.keys(require('./performance-results/primitives.json')).length)"`
Expected: `36` (or `35` if tabs is skipped).

- [ ] **Step 5: Verify isolation still holds, then lint and typecheck**

Run: `pnpm vitest list --filesOnly | grep -c '\.performance\.ts'`
Expected: `0`.

Run: `pnpm typecheck && pnpm lint`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add packages/primitives/src/components/*/*.performance.ts
git commit -m "$(cat <<'EOF'
test(perf): benchmark every primitive component

Generated with AI

Co-Authored-By: Claude Code
EOF
)"
```

---

### Task 4: API component benchmarks (13)

**Files:** Create `packages/api-components/src/components/<name>/<name>.performance.ts` for all 13 API components.

**Interfaces:**
- Consumes: `benchmarkComponent`, `untilPart`, `COMPOSED_OPTIONS`, `PerformanceOptions` from `../../../../primitives/src/utils/test/performance.js` (relative source path — primitives' `utils/test` is not built into `dist`).
- Fixtures from `../../client/mock/fixtures.js`: `PROVIDER_LOCATIONS`, `SCENARIOS`, `SPECIALTIES`, `INSURANCE_PLANS`, `buildTimeslots`, `buildAppointment`.

Every file passes `record: 'api-components'`. Define it once per file:

```ts
const OPTIONS: PerformanceOptions = { record: 'api-components' };
```

and `{ ...COMPOSED_OPTIONS, record: 'api-components' }` for the composite flows (booking, provider-results, appointment).

- [ ] **Step 1: Prove the cross-package import with one presentational component**

`provider-card/provider-card.performance.ts`:

```ts
import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import type { ZdProviderCard } from './index.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

describe('zd-provider-card performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdProviderCard>(
      {
        name: 'provider-card',
        create: () => {
          const element = document.createElement('zd-provider-card') as ZdProviderCard;
          element.provider = PROVIDER_LOCATIONS[0];
          return element;
        },
        update: (element, i) => (element.provider = PROVIDER_LOCATIONS[i % PROVIDER_LOCATIONS.length]),
      },
      OPTIONS
    );
  });
});
```

Run: `pnpm vitest run --config vitest.performance.config.ts packages/api-components/src/components/provider-card`
Expected: PASS, table printed, `performance-results/api-components.json` contains `provider-card`.

If the import fails to resolve, add to `vitest.performance.config.ts` under `test`:
```ts
alias: { '#test/performance': join(import.meta.dirname, 'packages/primitives/src/utils/test/performance.ts') },
```
and switch every API benchmark import to `'#test/performance'` (add `"#test/performance": ["./packages/primitives/src/utils/test/performance.ts"]` under `compilerOptions.paths` in root `tsconfig.json` so typecheck agrees). Prefer the relative path if it works.

Every API component's `index.ts` exports its class (`ZdProviderCard`, `ZdBooking`, …), so `import type { ZdX } from './index.js'` works throughout.

- [ ] **Step 2: Remaining presentational components (no mocks)**

Each file below is complete. Shared imports at the top of each (drop unused names per file):

```ts
import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import { buildTimeslots, PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };
```

`provider-summary/provider-summary.performance.ts`:

```ts
import type { ZdProviderSummary } from './index.js';

describe('zd-provider-summary performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdProviderSummary>(
      {
        name: 'provider-summary',
        create: () => {
          const element = document.createElement('zd-provider-summary') as ZdProviderSummary;
          element.provider = PROVIDER_LOCATIONS[0];
          return element;
        },
        update: (element, i) => (element.provider = PROVIDER_LOCATIONS[i % PROVIDER_LOCATIONS.length]),
      },
      OPTIONS
    );
  });
});
```

`provider-profile/provider-profile.performance.ts`:

```ts
import type { ZdProviderProfile } from './index.js';

describe('zd-provider-profile performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdProviderProfile>(
      {
        name: 'provider-profile',
        create: () => {
          const element = document.createElement('zd-provider-profile') as ZdProviderProfile;
          element.provider = PROVIDER_LOCATIONS[0];
          return element;
        },
        update: (element, i) => (element.provider = PROVIDER_LOCATIONS[i % PROVIDER_LOCATIONS.length]),
      },
      OPTIONS
    );
  });
});
```

`availability-window/availability-window.performance.ts`:

```ts
describe('zd-availability-window performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'availability-window',
        create: () => {
          const element = document.createElement('zd-availability-window');
          element.setAttribute('start-date', '2026-08-05');
          element.setAttribute('end-date', '2026-08-11');
          return element;
        },
        update: (element, i) => element.toggleAttribute('can-go-earlier', i % 2 === 0),
      },
      OPTIONS
    );
  });
});
```

`availability-grid/availability-grid.performance.ts` — supplied `timeslots` means no fetch:

```ts
import type { ZdAvailabilityGrid } from './index.js';

const PROVIDER_LOCATION_ID = SCENARIOS.providerLocationConfirmed;
const WEEK_A = [...buildTimeslots('2026-08-05', ['09:00', '14:00', '15:30']), ...buildTimeslots('2026-08-06', ['09:00'])];
const WEEK_B = [...buildTimeslots('2026-08-07', ['10:00', '11:30']), ...buildTimeslots('2026-08-08', ['16:00'])];

describe('zd-availability-grid performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdAvailabilityGrid>(
      {
        name: 'availability-grid',
        create: () => {
          const element = document.createElement('zd-availability-grid') as ZdAvailabilityGrid;
          element.setAttribute('provider-location-id', PROVIDER_LOCATION_ID);
          element.setAttribute('start-date', '2026-08-05');
          element.timeslots = WEEK_A;
          return element;
        },
        update: (element, i) => (element.timeslots = i % 2 ? WEEK_A : WEEK_B),
      },
      OPTIONS
    );
  });
});
```

The grid fetches nothing when handed `timeslots` (`availability-grid.ts:83-91`, `:239`), so no mock is needed.

`booking-confirmation/booking-confirmation.performance.ts`:

```ts
import type { ZdBookingConfirmation } from './index.js';

describe('zd-booking-confirmation performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdBookingConfirmation>(
      {
        name: 'booking-confirmation',
        create: () => {
          const element = document.createElement('zd-booking-confirmation') as ZdBookingConfirmation;
          element.setAttribute('appointment-id', SCENARIOS.appointmentConfirmed);
          element.setAttribute('start-time', '2026-08-05T09:00:00-04:00');
          element.setAttribute('provider-name', 'Dr. Avery Sandoval, MD');
          return element;
        },
        update: (element, i) => (element.status = i % 2 ? 'confirmed' : 'pending_booking'),
      },
      OPTIONS
    );
  });
});
```

`provider-name` reuses the fixture provider's name, as `booking-confirmation.test.ts:16` does. The component fetches nothing (it only imports `AppointmentStatus` from the client).

`patient-form/patient-form.performance.ts`:

```ts
import type { ZdPatientForm } from './index.js';

/** The documented test patient (TEST-003) — the same values patient-form.test.ts uses. */
const TEST_PATIENT_VALUES = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '5551234567',
  email_address: 'test@example.test',
};

describe('zd-patient-form performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdPatientForm>(
      {
        name: 'patient-form',
        create: () => document.createElement('zd-patient-form') as ZdPatientForm,
        update: (element, i) => (element.values = i % 2 ? {} : { ...TEST_PATIENT_VALUES }),
      },
      OPTIONS
    );
  });
});
```

`provider-results/provider-results.performance.ts` — supplied `availability` means the cards' grids do not fetch:

```ts
import { COMPOSED_OPTIONS } from '../../../../primitives/src/utils/test/performance.js';
import type { ZdProviderResults } from './index.js';

const START = '2026-08-05';
const AVAILABILITY = PROVIDER_LOCATIONS.map((location) => {
  const timeslots = buildTimeslots(START, ['09:00', '14:00']);
  return { provider_location_id: location.provider_location_id, first_availability: timeslots[0] ?? null, timeslots };
});

describe('zd-provider-results performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdProviderResults>(
      {
        name: 'provider-results',
        create: () => {
          const element = document.createElement('zd-provider-results') as ZdProviderResults;
          element.providers = PROVIDER_LOCATIONS;
          element.totalCount = PROVIDER_LOCATIONS.length;
          element.availabilityStart = START;
          element.availability = AVAILABILITY;
          return element;
        },
        update: (element, i) =>
          (element.selectedId = PROVIDER_LOCATIONS[i % PROVIDER_LOCATIONS.length].provider_location_id),
      },
      { ...COMPOSED_OPTIONS, record: 'api-components' }
    );
  });
});
```

Add `vi.mock('../../client/availability.js', { spy: true })` with `getAvailability` resolving `AVAILABILITY` in `beforeEach` as a safety net (import `vi`, `beforeEach`, `afterEach` from `vitest` and `* as availability from '../../client/availability.js'`), with `afterEach(() => vi.restoreAllMocks())` — matches `provider-results.test.ts`, which mocks it too.

- [ ] **Step 3: Async components — mocked client layer, part-based `ready`**

Each mounts through a fetch, so `ready` waits for a part only the success template renders. Rerender changes an input that does not refetch (see spec). All start with:

```ts
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import {
  benchmarkComponent,
  untilPart,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };
```

`availability-picker/availability-picker.performance.ts`:

```ts
import * as availability from '../../client/availability.js';
import { buildTimeslots, SCENARIOS, VISIT_REASONS } from '../../client/mock/fixtures.js';
import type { ZdAvailabilityPicker } from './index.js';

vi.mock('../../client/availability.js', { spy: true });

const PROVIDER_LOCATION_ID = SCENARIOS.providerLocationConfirmed;
const SLOTS = [...buildTimeslots('2026-08-05', ['09:00', '14:00', '15:30']), ...buildTimeslots('2026-08-06', ['09:00'])];

describe('zd-availability-picker performance', () => {
  beforeEach(() => {
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([
      { provider_location_id: PROVIDER_LOCATION_ID, first_availability: SLOTS[0], timeslots: SLOTS },
    ]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdAvailabilityPicker>(
      {
        name: 'availability-picker',
        create: () => {
          const element = document.createElement('zd-availability-picker') as ZdAvailabilityPicker;
          element.setAttribute('visit-reason-id', VISIT_REASONS[0].id);
          element.setAttribute('start-date', '2026-08-05');
          element.providerLocationId = PROVIDER_LOCATION_ID;
          return element;
        },
        update: (element, i) => (element.selectedStartTime = SLOTS[i % SLOTS.length].start_time),
        ready: untilPart('days'),
      },
      OPTIONS
    );
  });
});
```

`part="days"` (`availability-picker.ts:338`) renders only once availability has loaded; `slots` depends on a chosen day, so it is not used.

`appointment/appointment.performance.ts`:

```ts
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import { buildAppointment, PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import * as providerLocations from '../../client/provider-locations.js';
import { COMPOSED_OPTIONS } from '../../../../primitives/src/utils/test/performance.js';

vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });
vi.mock('../../client/provider-locations.js', { spy: true });

const ID = SCENARIOS.appointmentConfirmed;
const APPOINTMENT = buildAppointment(ID, '2026-08-01')!;

describe('zd-appointment performance', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'getAppointment').mockResolvedValue(APPOINTMENT);
    vi.spyOn(providerLocations, 'getProviderLocation').mockResolvedValue(PROVIDER_LOCATIONS[0]);
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'appointment',
        create: () => {
          const element = document.createElement('zd-appointment');
          element.setAttribute('appointment-id', ID);
          return element;
        },
        update: (element, i) => element.toggleAttribute('hide-photo', i % 2 === 0),
        ready: untilPart('panel'),
      },
      { ...COMPOSED_OPTIONS, record: 'api-components' }
    );
  });
});
```

`provider-search/provider-search.performance.ts` — mount loads reference data (`connectedCallback`); the search itself only runs on submit, so it is not part of mount:

```ts
import { INSURANCE_PLANS, SCENARIOS, SPECIALTIES } from '../../client/mock/fixtures.js';
import { DEFAULT_PAGE_SIZE } from '../../client/provider-locations.js';
import * as providerLocations from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';

vi.mock('../../client/provider-locations.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

/** Ready once the specialty select holds the loaded options, not just its placeholder. */
async function referenceDataLoaded(element: HTMLElement): Promise<void> {
  await untilPart('specialty')(element);
  await vi.waitFor(
    () => {
      const options = element.shadowRoot?.querySelectorAll('[part~="specialty"] option').length ?? 0;
      if (options < SPECIALTIES.length + 1) throw new Error('specialties not loaded');
    },
    { timeout: 5_000, interval: 0 }
  );
}

describe('zd-provider-search performance', () => {
  beforeEach(() => {
    vi.spyOn(providerLocations, 'searchProviderLocations').mockResolvedValue({
      providerLocations: [],
      totalCount: 0,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue(SPECIALTIES);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue(INSURANCE_PLANS);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'provider-search',
        create: () => {
          const element = document.createElement('zd-provider-search');
          element.setAttribute('zip-code', SCENARIOS.zipWithResults);
          element.setAttribute('specialty-id', SPECIALTIES[0].id);
          return element;
        },
        update: (element, i) => element.setAttribute('specialty-id', SPECIALTIES[i % SPECIALTIES.length].id),
        ready: referenceDataLoaded,
      },
      OPTIONS
    );
  });
});
```

The `searchProviderLocations` stub only guards against an accidental search (search runs on submit, never on mount). The ready check mirrors `provider-search.test.ts:105`: one placeholder plus every loaded specialty. If `ProviderSearchResult` requires `searchParameters`, add `searchParameters: undefined` as the test's `searchResult` helper does.

`booking/booking.performance.ts` — first step only (search + results with supplied `providers`):

```ts
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import { PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import * as providerLocations from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';
import { COMPOSED_OPTIONS } from '../../../../primitives/src/utils/test/performance.js';
import type { ZdBooking } from './index.js';

vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });
vi.mock('../../client/provider-locations.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

describe('zd-booking performance', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'createAppointment').mockRejectedValue(new Error('not booked in a benchmark'));
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getVisitReasons').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdBooking>(
      {
        name: 'booking',
        create: () => {
          const element = document.createElement('zd-booking') as ZdBooking;
          element.setAttribute('zip-code', SCENARIOS.zipWithResults);
          element.providers = PROVIDER_LOCATIONS;
          return element;
        },
        update: (element, i) => element.toggleAttribute('hide-photos', i % 2 === 0),
        ready: untilPart('results'),
      },
      { ...COMPOSED_OPTIONS, record: 'api-components' }
    );
  });
});
```

`providerLocations` is mocked only so no real search can fire; no spy is set on it, so add `vi.spyOn(providerLocations, 'searchProviderLocations').mockRejectedValue(new Error('no search in a benchmark'))` to `beforeEach`.

`sign-in/sign-in.performance.ts` — stub `auth` (as `sign-in.test.ts` does), first step only:

```ts
import type { PatientAuth } from '../../client/patient-auth.js';
import type { ZdSignIn } from './index.js';

function stubAuth(): PatientAuth {
  return {
    signIn: vi.fn<PatientAuth['signIn']>().mockResolvedValue(undefined),
    completeSignIn: vi.fn<PatientAuth['completeSignIn']>().mockResolvedValue(false),
    getToken: vi.fn<PatientAuth['getToken']>().mockResolvedValue('stub-token-not-a-credential'),
    isSignedIn: vi.fn<PatientAuth['isSignedIn']>().mockReturnValue(false),
  };
}

describe('zd-sign-in performance', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdSignIn>(
      {
        name: 'sign-in',
        create: () => {
          const element = document.createElement('zd-sign-in') as ZdSignIn;
          element.auth = stubAuth();
          return element;
        },
        update: (element, i) => (element.email = `patient${i}@example.test`),
        ready: untilPart('form'),
      },
      OPTIONS
    );
  });
});
```

(`beforeEach` is unused here — drop it from the import. `@example.test` is a reserved, non-routable domain, consistent with `patient-form.test.ts`.)

- [ ] **Step 4: Run each async benchmark alone to verify `ready`**

For each of `availability-picker`, `appointment`, `provider-search`, `booking`, `sign-in`:

Run: `pnpm vitest run --config vitest.performance.config.ts packages/api-components/src/components/<name>`
Expected: PASS; the `mount` median is plausibly larger than a bare `updateComplete` (a fetch round-trip through a resolved promise plus a render) and **no** `never rendered [part~=...]` error.

If one rejects with `never rendered`, read that component's success template for the right part name and fix `ready` — do not raise the timeout.

- [ ] **Step 5: Run the full suite and verify results**

Run: `ls packages/api-components/src/components/*/*.performance.ts | wc -l`
Expected: `13`.

Run: `rm -rf performance-results && pnpm test:performance`
Expected: 49 files (or 48 + tabs skipped) pass, one table each.

Run: `node -e "console.log(Object.keys(require('./performance-results/api-components.json')).length)"`
Expected: `13`.

Run: `pnpm vitest list --filesOnly | grep -c '\.performance\.ts'` → `0`
Run: `pnpm build:types && find packages/*/dist -name '*.performance*' | wc -l` → `0`
Run: `pnpm typecheck && pnpm lint` → pass
Run: `pnpm test` → existing suite still passes (no regressions from config/lint/tsconfig changes)

- [ ] **Step 6: Commit**

```bash
git add packages/api-components/src/components/*/*.performance.ts
git commit -m "$(cat <<'EOF'
test(perf): benchmark every API component

Generated with AI

Co-Authored-By: Claude Code
EOF
)"
```

---

### Task 5: Docs

**Files:**
- Create: `.agents/rules/testing/TEST-004.md`
- Modify: `.claude/rules/testing.md` (append a line)
- Modify: `AGENTS.md` (testing rules table, after the TEST-003 row at line 92)
- Modify: `.claude/skills/create-component/SKILL.md` (file tree at line ~17, checklist at ~241)
- Modify: `.claude/skills/testing/SKILL.md` (Projects table at line ~14)

- [ ] **Step 1: Write TEST-004**

`.agents/rules/testing/TEST-004.md`:

````markdown
# TEST-004: Ship a report-only `*.performance.ts` for every component

Every component has a `<name>.performance.ts` beside it. It times mount, rerender, and bulk
mount (10 / 50 / 100 instances) and prints median, p95, min and max. It **never fails on a
number** — timings on a laptop are too noisy for a budget — only on a thrown error or a
component that never becomes ready.

Run locally only: `pnpm test:performance`. It is not part of `pnpm test` or CI. Results are
also merged into `performance-results/<package>.json` (gitignored); compare two runs with
`diff` after copying the first aside.

The harness is `packages/primitives/src/utils/test/performance.ts`.

**Leaf primitive** — nothing to change, rerender is `requestUpdate()`:

```ts
import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-badge performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('badge', 'zd-badge');
  });
});
```

**Composed primitive** — realistic children, a real state change, `COMPOSED_OPTIONS`:

```ts
await benchmarkComponent(
  {
    name: 'tabs',
    create: () => {
      const element = document.createElement('zd-tabs');
      element.innerHTML = '<zd-tab slot="tab" id="tab-one">One</zd-tab>…';
      return element;
    },
    update: (element, i) => element.setAttribute('active-id', i % 2 ? 'tab-one' : 'tab-two'),
  },
  COMPOSED_OPTIONS
);
```

**API component** — mock the client layer (TEST-002), fixtures only (TEST-003), wait for a
success-only part, and rerender with an input that does **not** refetch:

```ts
vi.mock('../../client/appointments.js', { spy: true });
// beforeEach: vi.spyOn(appointments, 'getAppointment').mockResolvedValue(APPOINTMENT);

await benchmarkComponent(
  {
    name: 'appointment',
    create: () => { /* set appointment-id */ },
    update: (element, i) => element.toggleAttribute('hide-photo', i % 2 === 0),
    ready: untilPart('panel'),
  },
  { ...COMPOSED_OPTIONS, record: 'api-components' }
);
```

**Don't:**

- Assert on a duration (`expect(report.mount.median).toBeLessThan(…)`).
- Import a primitive's component module in its benchmark — the setup file already registered
  every `zd-*` tag, and a second definition throws.
- Rerender an async component by changing an id it fetches on — the old success markup is
  still on screen, so `ready` resolves before the new render.
- Mock `fetch`.
````

- [ ] **Step 2: Add the summary lines**

Append to `.claude/rules/testing.md`:

```markdown
- **TEST-004** Report-only perf benchmark per component — `<name>.performance.ts` beside each component, run with `pnpm test:performance` (local only, never CI). Never assert on a duration. ([details](../../.agents/rules/testing/TEST-004.md))
```

Insert after `AGENTS.md:92`:

```markdown
| [TEST-004](.agents/rules/testing/TEST-004.md) | **Report-only perf benchmarks.** One `*.performance.ts` per component; `pnpm test:performance`, local only, never asserts on timings. |
```

In `.claude/skills/create-component/SKILL.md`, add to the file tree after `<name>.test.ts`:

```
  <name>.performance.ts # Report-only benchmark (TEST-004)
```

and to the checklist after "Axe accessibility tests for each state":

```markdown
- [ ] `<name>.performance.ts` benchmark (TEST-004); ran `pnpm test:performance` on it
```

In `.claude/skills/testing/SKILL.md`, add a row to the Projects table:

```markdown
| `performance` | Browser (Chromium only) | `packages/*/src/components/**/*.performance.ts` via `vitest.performance.config.ts` | Client layer via `vi.mock` |
```

- [ ] **Step 3: Verify**

Run: `pnpm format:check`
Expected: pass (run `pnpm format` and re-check if it flags the new markdown).

Run: `grep -n "TEST-004" AGENTS.md .claude/rules/testing.md`
Expected: one hit in each.

- [ ] **Step 4: Commit**

```bash
git add .agents/rules/testing/TEST-004.md .claude/rules/testing.md AGENTS.md \
  .claude/skills/create-component/SKILL.md .claude/skills/testing/SKILL.md
git commit -m "$(cat <<'EOF'
docs(testing): add TEST-004 for report-only component benchmarks

Generated with AI

Co-Authored-By: Claude Code
EOF
)"
```
