# TEST-001: Two Vitest projects: node and browser

A single `vitest.config.ts` defines two projects:

**`client`** — `environment: 'node'`, `fetch` mocked. Covers:
- Query-parameter serialization
- Error mapping and typed error hierarchy
- The 401/auth error path
- Reference-data caching
- Appointment payload construction
- Token parsing and color math

Runs anywhere, including inside the ZD sandbox.

**`components`** — `@vitest/browser-playwright` on Chromium, real DOM. Covers:
- Component rendering and state transitions
- Event emission
- User interactions
- Accessibility (axe-core)

The component project drives a real browser, so it **cannot run inside the ZD sandbox** —
seatbelt denies Chromium's mach port rendezvous. Run it on the host.

**Do:**

The **browser project claims specific directories**; the client project takes everything
else. Only two directories need a real DOM — `components/` (rendering) and `__tests__/`
(prefix registration, which calls `customElements.define`) — so those are enumerated, and
`client` is the catch-all.

The catch-all direction is the important part. If both projects used allowlists, a package
gaining a folder would match neither project and its tests would be collected by nothing:
no failure, no warning, silently zero tests. Making `client` a catch-all means a new
folder defaults to running, and the worst case is a DOM-dependent test failing loudly in
node rather than passing vacuously.

```ts
// vitest.config.ts
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const BROWSER_TESTS = [
  'packages/*/src/components/**/*.test.ts',
  'packages/*/src/__tests__/**/*.test.ts',
];

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'client',
          environment: 'node',
          include: ['packages/*/src/**/*.test.ts'],
          exclude: BROWSER_TESTS,
        },
      },
      {
        test: {
          name: 'components',
          include: BROWSER_TESTS,
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

Share the glob list through one `BROWSER_TESTS` constant rather than repeating it. The two
projects must partition the suite exactly; duplicating the patterns invites an edit to one
and not the other, which either double-runs a file or drops it.

Every test file is plain `*.test.ts`. There is no `.browser.test.ts` suffix — a file's
directory decides its environment.

Adding a new directory that needs a real DOM means adding it to `BROWSER_TESTS`. Verify
routing rather than assuming it:

```bash
pnpm vitest list --project client --filesOnly
pnpm vitest list --project components --filesOnly
```

`setupFiles` registers the `zd` prefix and injects the theme before any test module
renders. It must be the browser project's first evaluation — see PBZD-001. It lives in
`api-components` while currently serving only `primitives` tests; that is deliberate, so
there is one setup file rather than one per package.

`provider` takes a **factory**, not a string. Vitest 4 changed this; `provider: 'playwright'`
fails with `TypeError: The browser.provider configuration was changed to accept a factory instead of a string.`

**Don't:**

```ts
// ❌ Single test environment — can't test both layers properly
export default defineConfig({
  environment: 'jsdom',
  include: ['**/*.test.ts'],
});
```

```ts
// ❌ Both projects on allowlists — a new folder matches neither and runs nowhere
{ name: 'client', include: ['packages/*/src/theme/**/*.test.ts', 'packages/*/src/test/**/*.test.ts'] },
{ name: 'components', include: ['packages/*/src/components/**/*.test.ts'] },
// packages/api-components/src/client/http.test.ts is collected by nothing.
```

See also: [TEST-002](./TEST-002.md), [TEST-003](./TEST-003.md)
