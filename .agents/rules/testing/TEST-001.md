# TEST-001: Two Vitest projects: node and browser

A single `vitest.config.ts` defines two projects:

**`client`** — `environment: 'node'`, `fetch` mocked. Covers:
- Query-parameter serialization
- Error mapping and typed error hierarchy
- The 401/auth error path
- Reference-data caching
- Appointment payload construction

Runs anywhere, including inside the ZD sandbox.

**`components`** — `@vitest/browser-playwright` on Chromium, real DOM. Covers:
- Component rendering and state transitions
- Event emission
- User interactions
- Accessibility (axe-core)

The component project drives a real browser, so it runs outside the ZD sandbox.

**Do:**

Projects are split on the **`*.browser.test.ts` filename suffix**, not on directory. A directory split has to be edited every time a package gains a folder; the suffix travels with the file.

```ts
// vitest.config.ts
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

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
```

`provider` takes a **factory**, not a string. Vitest 4 changed this; `provider: 'playwright'` fails with `TypeError: The browser.provider configuration was changed to accept a factory instead of a string.`

**Don't:**

```ts
// ❌ Single test environment — can't test both layers properly
export default defineConfig({
  environment: 'jsdom',
  include: ['**/*.test.ts'],
});
```

See also: [TEST-002](./TEST-002.md), [TEST-003](./TEST-003.md)
