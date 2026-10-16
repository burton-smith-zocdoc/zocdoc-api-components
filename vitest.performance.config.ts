import { join } from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { defaultClientConditions } from 'vite';
import { defineConfig } from 'vitest/config';
import type { BrowserCommand } from 'vitest/node';
import { mainThreadMetrics } from './tools/performance/src/cdp.ts';
import { recordPerformance, type PerformanceReport } from './tools/performance/src/record.ts';

/**
 * Report-only component benchmarks (TEST-004). Kept out of `vitest.config.ts` so `pnpm test`
 * never collects them: timings belong to a developer reading a table, not to a pass/fail run.
 *
 * Installed Chrome only, one file at a time — a second browser or a parallel file adds noise
 * to every number without adding signal. Chrome rather than Playwright's bundled shell for the
 * same sandbox reason `vitest.config.ts` gives.
 *
 * `PERF_BUILD=production` resolves Lit's production build instead of its dev build (which adds
 * warnings and validation to every update) and records to `<package>.production.json`.
 *
 * `PERF_PROFILE=1` runs the diagnostic profiles under `tools/performance/src` instead of the
 * benchmarks: full-readiness mounts with a style/layout/script breakdown, printed only.
 */
const RESULTS_DIR = join(import.meta.dirname, 'performance-results');
const PRODUCTION = process.env.PERF_BUILD === 'production';
const PROFILE = process.env.PERF_PROFILE === '1';

/**
 * Merges a component's report into `performance-results/<package>.json`. A command rather than
 * the built-in `commands.writeFile`, which resolves paths against the calling test file — the
 * shared harness has no single path that works from both packages.
 */
const recordPerformanceCommand: BrowserCommand<
  [pkg: string, name: string, report: PerformanceReport]
> = (_context, pkg, name, report) =>
  recordPerformance(
    join(RESULTS_DIR, PRODUCTION ? `${pkg}.production.json` : `${pkg}.json`),
    name,
    report
  );

export default defineConfig({
  // Pinned rather than left to Vite's mode check: Vitest runs with NODE_ENV=test, which would
  // otherwise resolve Lit's `development` export.
  resolve: {
    conditions: defaultClientConditions.map((condition) =>
      condition === 'development|production'
        ? PRODUCTION
          ? 'production'
          : 'development'
        : condition
    ),
  },
  // Cross-origin isolation lifts Chrome's 0.1ms clamp on performance.now(); most samples are
  // under a millisecond. The harness refuses to record without it.
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    include: ['culori', 'axe-core'],
  },
  cacheDir: `node_modules/.vite-performance/${PRODUCTION ? 'production' : 'development'}`,
  test: {
    name: 'performance',
    include: PROFILE
      ? ['tools/performance/src/**/*.profile.ts']
      : ['packages/*/src/components/**/*.performance.ts'],
    // Registers the zd prefix and injects the theme, exactly as for component tests (PBZD-001).
    setupFiles: ['./packages/api-components/src/utils/test/setup-browser.ts'],
    clearMocks: true,
    fileParallelism: false,
    testTimeout: 60_000,
    // The table is the output. Vitest's agent reporter (picked automatically in AI-agent
    // shells) drops console output from passing tests, which would leave only the JSON.
    reporters: ['default'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: { channel: 'chrome' } }),
      instances: [{ browser: 'chromium' }],
      commands: { recordPerformance: recordPerformanceCommand, mainThreadMetrics },
    },
  },
});
