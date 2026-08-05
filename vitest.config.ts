import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * The directories that need a real DOM, shared by both projects so they partition the
 * suite exactly. Duplicating these patterns invites an edit to one list and not the
 * other, which either double-runs a file or drops it.
 *
 * `components/` renders, and `src/__tests__/` calls `customElements.define`. Note this
 * matches `__tests__` directly under `src` only — `client/__tests__/` and
 * `theme/__tests__/` are text-and-logic tests that stay with the client project.
 */
const BROWSER_TESTS = [
  'packages/*/src/components/**/*.test.ts',
  'packages/*/src/__tests__/**/*.test.ts',
];

/**
 * Empties `mock.calls` before every test. Not a nicety, and set per project because project
 * configs do not inherit this from the root.
 *
 * Without it, call history leaks between tests in a file: `vi.mock(path, { spy: true })`
 * makes a module export permanently a spy, so a later `vi.spyOn` on it hands back that same
 * spy rather than a fresh one, and `restoreAllMocks` puts the implementation back without
 * emptying the recorded calls. `toHaveBeenCalledTimes(1)` then counts every call the whole
 * file has made, and `mock.calls[0]` belongs to whichever test ran first — both of which
 * this suite hit. `mockClear` leaves implementations alone, so a `beforeEach` that installs
 * one still works regardless of hook order.
 */
const clearMocks = true;

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          clearMocks,
          /**
           * The catch-all, and deliberately so (TEST-001). If both projects used
           * allowlists, a package gaining a folder would match neither and its tests
           * would be collected by nothing — no failure, no warning, silently zero
           * tests. As a catch-all, a new folder defaults to running, and the worst case
           * is a DOM-dependent test failing loudly in node rather than passing
           * vacuously.
           */
          name: 'client',
          environment: 'node',
          include: ['packages/*/src/**/*.test.ts'],
          exclude: BROWSER_TESTS,
        },
      },
      {
        test: {
          clearMocks,
          name: 'components',
          include: BROWSER_TESTS,
          // Registers the zd prefix and injects the theme before any test module
          // renders. Must be this project's first evaluation (PBZD-001).
          setupFiles: ['./packages/api-components/src/test/setup-browser.ts'],
          browser: {
            enabled: true,
            // A factory, not a string. Vitest 4 changed this; `provider: 'playwright'`
            // fails with "The browser.provider configuration was changed to accept a
            // factory instead of a string."
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
          },
        },
      },
    ],
  },
});
