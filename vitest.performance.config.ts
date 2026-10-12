import { join } from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import type { BrowserCommand } from 'vitest/node';
import { recordPerformance, type PerformanceReport } from './tools/performance/src/record.ts';

/**
 * Report-only component benchmarks (TEST-004). Kept out of `vitest.config.ts` so `pnpm test`
 * never collects them: timings belong to a developer reading a table, not to a pass/fail run.
 *
 * Installed Chrome only, one file at a time — a second browser or a parallel file adds noise
 * to every number without adding signal. Chrome rather than Playwright's bundled shell for the
 * same sandbox reason `vitest.config.ts` gives.
 */
const RESULTS_DIR = join(import.meta.dirname, 'performance-results');

/**
 * Merges a component's report into `performance-results/<package>.json`. A command rather than
 * the built-in `commands.writeFile`, which resolves paths against the calling test file — the
 * shared harness has no single path that works from both packages.
 */
const recordPerformanceCommand: BrowserCommand<
  [pkg: string, name: string, report: PerformanceReport]
> = (_context, pkg, name, report) =>
  recordPerformance(join(RESULTS_DIR, `${pkg}.json`), name, report);

export default defineConfig({
  optimizeDeps: {
    include: ['culori', 'axe-core'],
  },
  test: {
    name: 'performance',
    include: ['packages/*/src/components/**/*.performance.ts'],
    // Registers the zd prefix and injects the theme, exactly as for component tests (PBZD-001).
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
