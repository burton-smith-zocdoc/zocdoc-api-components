import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Two projects, split by filename rather than by directory:
 *
 *   *.browser.test.ts  -> real Chromium (anything touching customElements or DOM)
 *   *.test.ts          -> node
 *
 * A directory-based split has to be updated every time a package gains a folder.
 * The suffix travels with the file, so a test lands in the right project no matter
 * where it lives.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'client',
          environment: 'node',
          include: ['packages/*/src/**/*.test.ts'],
          exclude: ['packages/*/src/**/*.browser.test.ts'],
        },
      },
      {
        test: {
          name: 'components',
          include: ['packages/*/src/**/*.browser.test.ts'],
          setupFiles: ['./packages/api-components/src/test/setup-browser.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
