# Component Performance Tests — Design

**Date:** 2026-10-12
**Status:** Approved design, pending spec review

## Goal

Every component in `packages/primitives` (36) and `packages/api-components` (13) gets a
performance benchmark, modeled on `charm-ux/core`'s `*.performance.ts` suite. The benchmarks
are **report-only**: they print timings for a developer to read and never fail on a number.
They run **locally on demand only** — not in CI, not in `pnpm test`.

### Non-goals

- Budgets, thresholds, or baseline comparison that fail a run.
- CI integration.
- Memory or bundle-size measurement.
- Network latency. API components are measured against a mocked client layer.
- Multi-step flows past the first step (`zd-sign-in`, `zd-booking`).
- `packages/demo` and `packages/docs`, which contain no components.

## Background

`charm-ux/core` ships one `<name>.performance.ts` per component, all built on a shared harness
(`src/internal/testing/component-performance.ts`). The harness times three scenarios with
`performance.now()` — mount, rerender, and bulk mount of N instances — and prints median, p95,
min, and max to the console. It runs on Web Test Runner, Chromium only, separate from unit
tests. It has no budgets and no CI.

This repo has no benchmarks and runs tests through Vitest 4 browser mode (Playwright, installed
Chrome), with one root `vitest.config.ts` defining `client`, `components`, and `tools` projects.

## Design

### 1. Runner and config

New root file `vitest.performance.config.ts` with a single browser project, `performance`:

- `include: ['packages/*/src/components/**/*.performance.ts']`
- `setupFiles: ['./packages/api-components/src/utils/test/setup-browser.ts']` — registers the
  `zd` prefix and injects theme CSS, exactly as component tests do.
- Browser: Chromium via `playwright({ launchOptions: { channel: 'chrome' } })`, headless. One
  browser only — cross-browser timings add noise, not signal. Installed Chrome works in the
  sandbox.
- `fileParallelism: false` so benchmarks never compete for CPU.
- `clearMocks: true`, matching the existing projects.
- Same `optimizeDeps.include` as `vitest.config.ts`.

Root `package.json` gains:

```json
"test:performance": "pnpm run build:types && vitest run --config vitest.performance.config.ts"
```

`vitest.config.ts` is unchanged. Its globs match only `*.test.ts`, so `.performance.ts` files
never run under `pnpm test`, `test:components`, or `test:client`.

Both `packages/primitives/tsconfig.build.json` and `packages/api-components/tsconfig.build.json`
add `"**/*.performance.ts"` to `exclude` so benchmarks never ship in `dist`. The root
`tsconfig.json` already includes `packages/*/src/**/*.ts`, so the files are typechecked.

`performance-results/` is added to `.gitignore`.

### 2. Harness

`packages/primitives/src/utils/test/performance.ts` — ported from charm's
`component-performance.ts`. It lives in primitives because api-components may depend on
primitives but not the reverse (PBZD-005). `utils/test/` is excluded from the primitives build,
so api-components benchmarks import it by relative source path; implementation must confirm
that resolves under the performance config (fallback: a `#test/performance` path alias in the
perf config).

API:

```ts
interface PerformanceCase<T extends HTMLElement = HTMLElement> {
  name: string;                                    // results key, e.g. 'menu'
  create: () => T;                                 // fresh, unconnected element
  update: (element: T, iteration: number) => void; // one realistic input change
  ready?: (element: T) => Promise<void>;           // "rendered" signal; default: updateComplete
}

interface PerformanceOptions {
  iterations?: number;   // default 20
  warmups?: number;      // default 3
  bulkCounts?: number[]; // default [10, 50, 100]
}

benchmarkComponent(case, options?): Promise<PerformanceReport>
benchmarkTag(name, tagName, options?): Promise<PerformanceReport> // update = requestUpdate()
```

Scenarios, each preceded by `warmups` unrecorded runs:

| Scenario | Timed span | Samples |
|---|---|---|
| `mount` | `create()` + append → `ready(el)` | `iterations` |
| `rerender` | (mounted and ready) `update(el, i)` → `ready(el)` | `iterations` |
| `bulk/N` | create N into a fragment + append → `ready` on every child | `max(5, iterations / 2)` |

After every sample, outside the timed span, the harness settles the whole tree (up to 5 rounds
of awaiting `updateComplete` on every element across shadow roots, each followed by a
`requestAnimationFrame`) and removes the host.

Changes from charm:

- Bulk counts run **sequentially**. Charm runs them under `Promise.all`, interleaving samples
  in one document and skewing results.
- `ready` hook, so async components are timed to their `success` state rather than their first
  Lit update.
- One shared settle/teardown path for all scenarios.
- Returns the report as well as printing it.

Output:

- Console: the same table as charm, prefixed `[component-performance] <name>`, with columns
  Scenario | Samples | Median | P95 | Min | Max.
- File: each run of a package's benchmarks merges `{ [name]: { [scenario]: summary } }` into
  `performance-results/<package>.json` at the repo root via Vitest browser mode's
  `commands.writeFile`/`readFile`. Two runs compare with `diff`. Writing happens per component
  so a partial run still records what finished.

Benchmarks fail only on real errors (a component throws, `ready` never resolves within the
test timeout). Each benchmark `it()` gets an explicit generous timeout (60s).

### 3. Per-component files

`<name>.performance.ts` beside each component — 49 files. Shape:

```ts
import { benchmarkTag } from '../../utils/test/performance.js';
import './badge.js';

describe('zd-badge performance', () => {
  it('reports mount, rerender, and bulk mount timings', () => benchmarkTag('badge', 'zd-badge'), 60_000);
});
```

Tests write literal `zd-*` tag names, as existing `*.test.ts` files do (PBZD-003 governs
templates, not tests).

**Leaf primitives** (alert, avatar, badge, button, card, checkbox, divider, icon, input,
progress-bar, skeleton, spinner, switch, text-area, tooltip, popup, push-pane, overflow,
scoped-styles, disclosure, tab, tab-panel, accordion-item, breadcrumb-item, menu-item, radio,
button-group-overflow): `benchmarkTag`, or `benchmarkComponent` with a
real attribute toggle where `requestUpdate()` would measure nothing meaningful (e.g. `checked`,
`value`, `variant`).

**Composed primitives** (accordion, breadcrumb, button-group, dialog, menu, menu-group,
radio-group, select, tabs): `benchmarkComponent` with realistic children (~5 items; 20 options
for select; heading/body/footer for dialog) and an update that changes real state (`active-id`,
`open`, `value`). Options `{ iterations: 10, warmups: 2, bulkCounts: [10, 50] }` as in charm's
composed cases.

**API components** — fixtures only from `client/mock/fixtures.js` and the documented testing
scenarios (TEST-003, PHI-002); mocks at the client-layer function, never `fetch` (TEST-002),
via `vi.mock(path, { spy: true })` + `vi.spyOn(...).mockResolvedValue(...)`:

| Component | Input | Rerender |
|---|---|---|
| provider-card, provider-summary, provider-profile | `provider` property from `PROVIDER_LOCATIONS` | swap to another fixture provider |
| availability-grid, availability-window | `timeslots` from `buildTimeslots` | new timeslot set |
| availability-picker | mocked `getAvailability` | change provider-location id |
| provider-search, provider-results | mocked `searchProviderLocations` (ZIP `10011`) | change query input |
| appointment, booking-confirmation | mocked lookups / fixture appointment | swap fixture |
| patient-form | fixture-free empty form | set one field value |
| booking, sign-in | mocked client calls, first step only | change one input on that step |

Async components pass a `ready` that waits for the component's `success` state. The exact
signal (state property, rendered part, or emitted event) is chosen per component during
implementation by reading its source.

### 4. Docs

- New `.agents/rules/testing/TEST-004.md`: "Ship a report-only `*.performance.ts` for every
  component" — when it applies, the harness API, leaf vs composed vs API-component patterns, how
  to run (`pnpm test:performance`), how to read the table and diff `performance-results/`, and
  that budgets are intentionally absent.
- `.claude/rules/testing.md`: one-line TEST-004 summary.
- `.claude/skills/create-component/SKILL.md`: add `<name>.performance.ts` to the files a new
  component ships with.

## Testing the harness

The harness is exercised by every benchmark. Success criteria for implementation:

1. `pnpm test:performance` runs all 49 files and prints a table for each.
2. `performance-results/primitives.json` and `performance-results/api-components.json` contain
   one entry per component.
3. `pnpm test` collects zero `.performance.ts` files (verify with
   `pnpm vitest list --filesOnly`).
4. `pnpm build:types` emits no `.performance` files into `dist`.
5. Typecheck and lint pass.

## Risks

- **Cross-package import of the harness from source.** Mitigation above (path alias).
- **Async readiness.** A wrong `ready` either times too little (first Lit update) or hangs.
  Each async component's `ready` is verified by running its benchmark individually.
- **Timing noise.** Accepted — report-only, read by eye, compared across local runs on one
  machine.
