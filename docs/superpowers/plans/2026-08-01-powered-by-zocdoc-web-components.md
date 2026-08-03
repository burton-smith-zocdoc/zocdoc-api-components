# Powered by Zocdoc Web Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a proof-of-concept set of framework-agnostic custom elements, layered on Charm UX, that drive the Zocdoc public API's patient booking funnel end to end.

**Architecture:** A pnpm workspace of three packages with strictly one-way dependencies — `primitives` (design tokens, Charm prefix configuration, and the Charm primitive classes to build on) ← `api-components` (`src/client/`, the typed API client, plus `src/components/`, six booking components) ← `demo` (Vite vanilla-TS site). The split is presentation versus Zocdoc-API knowledge; the client sits inside `api-components` because nothing else consumes it. Components communicate by properties in and `CustomEvent`s out; a `zd-booking-flow` coordinator holds flow state and renders its children with direct Lit property bindings. No shared-state container, no context protocol.

**Tech Stack:** TypeScript, Lit 3, `@charm-ux/core` + `@charm-ux/theming`, pnpm workspaces, Vite, Storybook 10 (`@storybook/web-components-vite`), Vitest 4 (node project + browser project via `@vitest/browser-playwright`).

**Design spec:** `docs/superpowers/specs/2026-07-31-powered-by-zocdoc-web-components-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Do not run `git commit`.** Burton commits. Each task ends by staging its files with `git add` and reporting what is staged. Never run `git commit`, `git push`, or `git reset --hard`.
- **Node 24.11.0**, pnpm workspaces. `.nvmrc` pins `24.11.0`. Not arbitrary: Vitest 4
  peer-requires Vite ≥6, and Vite 7 calls `crypto.hash`, which landed in Node 20.12 —
  on anything older the browser project dies at startup with
  `crypto.hash is not a function`. 24.11.0 also matches Charm's own `.nvmrc`.
- **Charm is consumed from Burton's local checkout, not npm.** Both deps use pnpm
  `link:` paths into `/Users/burton.smith/Projects/charm-ux/core/packages/*`
  (`link:../../../charm-ux/core/packages/theming` and `.../core`, relative to each
  consuming package). `@charm-ux/theming@0.5.0` is unpublished — npm tops out at
  `0.2.0` — and local `core` carries fixes past the published `0.5.2` tag. The
  checkout is on branch `next` and both packages are built (verified 2026-08-02:
  `dist/` newer than `src/` in each). Do not run `pnpm build` there and do not change
  its branch. If a Charm export is missing at runtime, report it rather than switching
  to the npm version — a missing export usually means a stale `dist/`, and Charm's
  build only works under Node 24.11.0 (it passes `--disable-warning`, which Node 20
  rejects outright).
- **Vitest `^4.1.10`**, `@vitest/browser@^4.1.10`, `@vitest/browser-playwright@^4.1.10`. `@charm-ux/theming` already depends on Vitest `^4.1.8`, so stay on the 4.x line.
- **No build step.** Every package's `exports` points at `./src/index.ts`. Do not add `tsc` emit, `dist/`, or Vite library builds. Typecheck runs as `tsc --noEmit`.
- **Tag prefix is `zd`.** Never hardcode a tag name in a template. Use `this.scope.tag('name')` with `html` imported from `lit/static-html.js`.
- **Never import a Charm component barrel (`.../button/index.js`) anywhere.** A
  folder's `index.js` calls `registerComponent()` as an import side effect, which
  defines the element under whatever prefix is current at that instant — permanently.
  Import the Charm primitive classes from `@powered-by-zocdoc/primitives`, which
  re-exports the class modules, and declare them in
  `static override get dependencies()`. Registration then happens at construction
  time, when the prefix is guaranteed set.
- **Tests are routed by filename, not directory.** `*.browser.test.ts` runs in real
  Chromium; every other `*.test.ts` runs in node. Anything touching `customElements`,
  rendering, or `document` gets the `.browser` infix.
- **No `as unknown as typeof CharmElement` casts in `dependencies()` arrays.** Task 4 confirmed the arrays typecheck clean against the class-module exports. If some future primitive genuinely demands a cast, that is a signal to check the import path, not to add one.
- **PHI rules.** No patient field values in `console.log`, thrown error messages, or error bodies. No patient data in committed fixtures, stories, or tests — use only the sandbox test values in Task 2. No telemetry, analytics, or any network destination other than the configured `baseUrl`.
- **Secrets.** Tokens live only in `.env.local`, which is gitignored. Never commit a token, never paste one into a source file, story, test, or fixture.
- **TypeScript:** `strict: true`. Explicit accessibility modifiers on class members and `override` where it applies, matching Charm's CODE-\* conventions. Relative imports end in `.js`.
- **Every `zd-*` component** extends `CharmElement`, declares `static override baseName`, and is registered via `project.scope.registerComponent()` in its own `index.ts` barrel. Our own barrels registering at import time is correct — the prefix is already set by the time anything can import them. The no-barrel rule above is about Charm's barrels, not ours.

---

## File Structure

```
powered-by-zocdoc/
  .env.local                    gitignored — VITE_ZOCDOC_TOKEN, VITE_ZOCDOC_BASE_URL
  .gitignore
  .nvmrc
  package.json                  root scripts only
  pnpm-workspace.yaml
  tsconfig.base.json
  vitest.config.ts              two projects, split on the *.browser.test.ts suffix
  custom-elements-manifest.config.mjs
  .storybook/
    main.ts
    preview.ts
  scripts/
    verify-api.ts               one-off recon script (Task 2)
  packages/
    primitives/
      package.json
      README.md                 documents the import-order and no-barrels rules
      src/configure.ts          side-effect only: sets the zd prefix
      src/tokens.ts             token definition + generated theme CSS
      src/charm.ts              Charm primitive classes, for dependencies()
      src/index.ts              imports configure first, then re-exports the above
      src/charm.stories.ts      stories for the themed Charm primitives
      src/__tests__/tokens.test.ts
      src/__tests__/prefix.browser.test.ts
    api-components/
      package.json
      README.md
      src/index.ts
      src/client/
        configure.ts            ZocdocConfig singleton
        http.ts                 the only module that calls fetch
        errors.ts               ZocdocApiError, ZocdocAuthError
        types.ts                shared API types
        reference-data.ts       specialties, visit reasons, insurance plans (cached)
        provider-locations.ts   search
        availability.ts
        appointments.ts
        __fixtures__/           real recorded responses (Task 2)
        __tests__/
      src/components/
        internal/
          request-state.ts      shared idle|loading|success|empty|error rendering
        provider-search/
        provider-results/
        availability-picker/
        patient-form/
        booking-confirmation/
        booking-flow/
      src/test/
        setup-browser.ts        imports primitives before any test module
        mount.ts                browser-mode mount helper
    demo/
      package.json
      index.html                <zd-booking-flow> alone
      composed.html             five components wired by hand
      src/main.ts
      src/composed.ts
      vite.config.ts
```

---

### Task 1: Workspace scaffold — ✅ COMPLETE

Built and verified. `pnpm install` succeeds, `pnpm typecheck` passes.

**Files as built:** `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json`,
`tsconfig.json`, `.gitignore`, `.nvmrc`, `.env.local.example`

Two things landed differently from the original plan, and later tasks depend on both:

- **`.nvmrc` is `24.11.0`, not `20.9.0`**, and root `vite` is `^7.1.5`, not `^5.3.4`.
  Vitest 4 peer-requires Vite ≥6; Vite 7 calls `crypto.hash`, added in Node 20.12. On
  20.9.0 the browser project died at startup with `crypto.hash is not a function`.
- **`@types/node`, `typescript`, `vitest`, `@vitest/browser`,
  `@vitest/browser-playwright`, and `playwright` are all root devDependencies.**
  Packages carry only runtime deps.

`tsconfig.base.json` sets `useDefineForClassFields: false` and
`experimentalDecorators: true`. Both are required by Lit 3 decorators — getting them
wrong produces reactive properties that silently never update.

---

### Task 2: Verify the API contract and record fixtures

The spec flags a real discrepancy: the booking guide documents the search params as `specialty_id` / `visit_reason_id` / `insurance_plan_id` with paging, while the OpenAPI summary lists `specialty` / `visit_reason` / `accepted_insurance`. Every later task depends on which is right. Resolve it against the live sandbox and record real responses as test fixtures, so no test is written against a guess.

**Files:**
- Create: `scripts/verify-api.ts`
- Create: `packages/api-components/src/client/__fixtures__/` (populated by running the script)
- Create: `docs/api-contract-notes.md`

**Interfaces:**
- Consumes: `.env.local` with a valid sandbox token
- Produces: `__fixtures__/{specialties,visit-reasons,insurance-plans,provider-locations,availability,appointment}.json` and a written record of the actual parameter names

- [ ] **Step 1: Create `scripts/verify-api.ts`**

```ts
/**
 * One-off reconnaissance against the sandbox. Records real responses as test
 * fixtures so downstream tests assert against reality, not documentation.
 *
 * Run: pnpm dlx tsx scripts/verify-api.ts
 *
 * PHI: the sandbox returns synthetic data only. Do not point this at production.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.env.VITE_ZOCDOC_BASE_URL ?? 'https://api-developer-sandbox.zocdoc.com';
const TOKEN = process.env.VITE_ZOCDOC_TOKEN;
const OUT = join(process.cwd(), 'packages/api-components/src/client/__fixtures__');

if (!TOKEN) {
  throw new Error('VITE_ZOCDOC_TOKEN is not set. Source .env.local first.');
}

async function probe(name: string, path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  });
  const text = await res.text();
  console.log(`\n=== ${name} ===\nGET ${path}\n${res.status} ${res.statusText}`);
  console.log(text.slice(0, 1200));

  if (res.ok) {
    await writeFile(join(OUT, `${name}.json`), text, 'utf8');
  }
}

await mkdir(OUT, { recursive: true });

await probe('specialties', '/v1/specialties');
await probe('visit-reasons', '/v1/visit_reasons');
await probe('insurance-plans', '/v1/insurance_plans');

// Both documented spellings of the search params. Exactly one should return
// results for zip 11201, which the testing-data guide documents as valid.
await probe('provider-locations-guide-spelling', '/v1/provider_locations?zip_code=11201&page=1&page_size=5');
await probe('provider-locations-spec-spelling', '/v1/provider_locations?zip_code=11201');

// Documented sandbox behaviors used later as component-state test inputs.
await probe('provider-locations-empty', '/v1/provider_locations?zip_code=99734');
await probe('provider-locations-error', '/v1/provider_locations?zip_code=10112');
```

- [ ] **Step 2: Run the script**

Run: `set -a && source .env.local && set +a && pnpm dlx tsx scripts/verify-api.ts`

Expected: `specialties`, `visit_reasons`, and `insurance_plans` return `200` with arrays. Zip `11201` returns results, `99734` returns an empty result set, `10112` returns a 500.

If a call returns 401, the token has expired (they last 60 minutes) — get a fresh one before continuing.

- [ ] **Step 3: Record the availability and booking shapes**

Take a real `provider_location_id` and `visit_reason_id` from the recorded `provider-locations-*.json`, then append to `scripts/verify-api.ts` and re-run:

```ts
const PROVIDER_LOCATION_ID = ''; // paste from provider-locations fixture
const VISIT_REASON_ID = '';      // paste from provider-locations fixture

await probe(
  'availability',
  `/v1/provider_locations/availability?provider_location_ids=${encodeURIComponent(PROVIDER_LOCATION_ID)}` +
    `&visit_reason_id=${encodeURIComponent(VISIT_REASON_ID)}&patient_type=new`
);
```

Expected: `200` with timeslots carrying ISO-8601 `start_time` values.

- [ ] **Step 4: Write `docs/api-contract-notes.md`**

Record, from the observed responses:
- The parameter spelling that actually worked for `/v1/provider_locations`, and what the other returned.
- Whether `page` / `page_size` are accepted.
- The exact top-level response envelope for each endpoint (is it a bare array, or `{ data: [...] }`?).
- The exact field names on a provider-location object and an availability timeslot.

This file is the source of truth for Tasks 5–8. Write down what you saw, not what you expected.

- [ ] **Step 5: Confirm no PHI in fixtures**

Run: `ls packages/api-components/src/client/__fixtures__/`

Read each recorded file. The sandbox returns synthetic data, but confirm no real-looking patient names, dates of birth, or contact details are present before staging. If any appear, redact them and note the redaction in `docs/api-contract-notes.md`.

- [ ] **Step 6: Stage**

```bash
git add scripts/verify-api.ts packages/api-components/src/client/__fixtures__ docs/api-contract-notes.md
```

Report what is staged. Do not commit.

---

### Task 3: `@powered-by-zocdoc/primitives` — tokens — ✅ COMPLETE

Built and verified: 3 tests passing in the node project.

**Files as built:** `packages/primitives/package.json`,
`packages/primitives/src/tokens.ts`,
`packages/primitives/src/__tests__/tokens.test.ts`

**Produces:** `zocdocTokenDefinition`, `zocdocTheme`, `zocdocThemeCss: string` — 220
`--zd-` custom properties, about 8.5 KB, from five base colors.

Three corrections from the original plan, each load-bearing:

- **`generateThemeSync`, not `generateTheme`.** `generateTheme` is async and does file
  I/O. Reading `.css` off the returned Promise yields `undefined`, so `zocdocThemeCss`
  would have silently been `''` and both original tests would still have passed —
  `''` contains neither `--zd-` nor `--ch-`. `generateThemeSync(definition, { dryRun:
  true })` returns the CSS on the result instead of writing it.
- **`prefix: 'zd'` sits on the token definition passed to `defineTokens`**, not on
  `generateThemeSync`'s options. `defineTokens` resolves
  `options.prefix ?? input.prefix ?? 'charm'`, and the variable references it emits
  must agree with the declarations.
- **A third test asserts the stylesheet is non-empty.** Without it the suite passes
  against an empty string, which is exactly the failure the first correction describes.

The palette is a **placeholder** — not real Zocdoc brand values. Replacing it is a
single-file change to the `primitives.color` block in `tokens.ts`.

Note the import in `__tests__/tokens.test.ts`: it pulls from `../tokens.js`, **not**
`../index.js`. `index.js` runs `configure.ts`, which needs `window`; importing it
would break this test under node.

---

### Task 4: Test harness and the Charm prefix-ordering guarantee — ✅ COMPLETE

Built and verified: 4 tests passing in real Chromium. This was the highest-risk task
in the plan and it resolved differently from how it was written. Read this section
before writing any component.

**Files as built:** `vitest.config.ts`,
`packages/api-components/src/test/setup-browser.ts`,
`packages/primitives/src/configure.ts`, `packages/primitives/src/charm.ts`,
`packages/primitives/src/index.ts`, `packages/primitives/README.md`,
`packages/primitives/src/__tests__/prefix.browser.test.ts`

**Produces:** `pnpm test`, `pnpm test:client`, `pnpm test:components`; the `zd` prefix
as an import side effect of `@powered-by-zocdoc/primitives`; the Charm primitive
classes; re-exports of `project` and `CharmElement`.

#### What changed, and why it matters

The original Task 4 had `primitives/src/index.ts` import twelve Charm **barrels**
(`.../button/index.js`) so they would register at import time. That is wrong for this
project. Burton's ruling: *if we are extending the components, we should not be
pulling them in from the barrel files.*

Barrels register eagerly and permanently. `registerComponent()` reads the prefix at
call time and immediately calls `customElements.define()`; custom elements cannot be
unregistered, and `updateProject()` does not re-register anything already defined. One
badly-ordered import poisons a tag for the lifetime of the page, unrepairable.

So `primitives` imports **no Charm barrels at all**. `charm.ts` re-exports the class
modules, which register nothing:

```ts
export { default as button } from '@charm-ux/core/components/button/button.js';
export { default as input } from '@charm-ux/core/components/input/input.js';
// …button-group, select, radio, radio-group, card, alert, spinner, skeleton,
//   avatar, badge
```

Components list those classes in `static override get dependencies()`, and the
`CharmElement` constructor registers them — at construction time, long after the
prefix is set. Ordering stops being something a future contributor has to get right.

`index.ts` still has exactly one ordering rule, and it is enforced by comment only:

```ts
// Side-effect import, and it must stay first. ES modules evaluate depth-first in
// source order, so the prefix is configured before anything below is evaluated.
// Do not reorder these imports and do not let a formatter sort them.
import './configure.js';

export * from './tokens.js';
export * from './charm.js';
export { project, CharmElement } from '@charm-ux/core';
```

No ESLint is configured in this repo, so there is no lint rule to lean on and no
point adding a disable comment for a linter that does not run. The comment plus the
browser test are the guard.

#### The guard test

`prefix.browser.test.ts` asserts four things, and the third is the one that proves the
mechanism: after importing `input` as a class module, `zd-input` is **undefined**;
after constructing a host that declares `input` in `dependencies()`, it is
**defined**. The fourth asserts nothing ever registered under `ch-`.

#### Vitest configuration

Projects split on **filename**, not directory:

```ts
import { playwright } from '@vitest/browser-playwright';

// client:     include ['packages/*/src/**/*.test.ts']
//             exclude ['packages/*/src/**/*.browser.test.ts']   environment: node
// components: include ['packages/*/src/**/*.browser.test.ts']   browser: chromium
//             setupFiles ['./packages/api-components/src/test/setup-browser.ts']
```

Two corrections from the original:

- **`provider: playwright()`, not `provider: 'playwright'`.** Vitest 4 changed this to
  a factory and fails with a clear `TypeError` on the string form.
- **Directory globs became filename globs.** A directory split has to be edited every
  time a package gains a folder — and this plan's restructure would have broken it
  immediately. The suffix travels with the file.

`pnpm exec playwright install chromium` downloads a browser and will not work inside
the ZD sandbox. Run it outside.

---

### Task 5: API client — configuration, errors, and the HTTP layer

**Files:**
- Create: `packages/api-components/package.json`, `packages/api-components/src/client/configure.ts`, `packages/api-components/src/client/errors.ts`, `packages/api-components/src/client/http.ts`
- Test: `packages/api-components/src/client/__tests__/http.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `configureZocdoc(config: ZocdocConfig): void`
  - `getZocdocConfig(): ZocdocConfig`
  - `resetZocdocConfig(): void` (test-only)
  - `interface ZocdocConfig { baseUrl: string; getToken: string | (() => string | Promise<string>) }`
  - `class ZocdocApiError extends Error { readonly status: number; readonly body: unknown }`
  - `class ZocdocAuthError extends ZocdocApiError`
  - `request<T>(path: string, init?: { method?: string; query?: QueryParams; body?: unknown; config?: ZocdocConfig }): Promise<T>`
  - `type QueryParams = Record<string, string | number | boolean | string[] | undefined | null>`

- [ ] **Step 1: Verify `packages/api-components/package.json`**

The scaffold already created it. Confirm it reads exactly this:

```json
{
  "name": "@powered-by-zocdoc/api-components",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "dependencies": {
    "@powered-by-zocdoc/primitives": "workspace:*",
    "lit": "^3.2.1"
  }
}
```

- [ ] **Step 2: Write the failing tests**

`packages/api-components/src/client/__tests__/http.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { ZocdocApiError, ZocdocAuthError } from '../errors.js';
import { request } from '../http.js';

function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      })
    )
  );
}

describe('request', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok_123' });
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('sends a bearer token', async () => {
    mockFetch(200, { ok: true });
    await request('/v1/thing');

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok_123');
  });

  it('resolves an async getToken function', async () => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: async () => 'tok_async' });
    mockFetch(200, { ok: true });
    await request('/v1/thing');

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok_async');
  });

  it('comma-joins array query params and omits undefined ones', async () => {
    mockFetch(200, { ok: true });
    await request('/v1/thing', { query: { ids: ['a', 'b'], skip: undefined, n: 3 } });

    const [url] = vi.mocked(fetch).mock.calls[0]!;
    expect(String(url)).toBe('https://example.test/v1/thing?ids=a%2Cb&n=3');
  });

  it('throws ZocdocAuthError on 401', async () => {
    mockFetch(401, { message: 'Unauthorized' });
    await expect(request('/v1/thing')).rejects.toBeInstanceOf(ZocdocAuthError);
  });

  it('throws ZocdocApiError with the status on other failures', async () => {
    mockFetch(500, { message: 'boom' });
    await expect(request('/v1/thing')).rejects.toMatchObject({ status: 500 });
    await expect(request('/v1/thing')).rejects.toBeInstanceOf(ZocdocApiError);
  });

  it('sends a JSON body for POST', async () => {
    mockFetch(200, { appointment_id: 'ap_1' });
    await request('/v1/appointments', { method: 'POST', body: { a: 1 } });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"a":1}');
  });
});
```

- [ ] **Step 3: Run and confirm failure**

Run: `pnpm test:client`
Expected: FAIL — cannot resolve `../configure.js`.

- [ ] **Step 4: Write `packages/api-components/src/client/configure.ts`**

```ts
export interface ZocdocConfig {
  /** e.g. https://api-developer-sandbox.zocdoc.com */
  baseUrl: string;
  /**
   * A token, or a function returning one. Called per request; memoization is
   * the consumer's responsibility, which keeps this layer stateless and lets a
   * 60-minute token refresh happen without our cooperation.
   */
  getToken: string | (() => string | Promise<string>);
}

let current: ZocdocConfig | undefined;

export function configureZocdoc(config: ZocdocConfig): void {
  current = config;
}

export function getZocdocConfig(): ZocdocConfig {
  if (!current) {
    throw new Error('Zocdoc API is not configured. Call configureZocdoc({ baseUrl, getToken }) first.');
  }
  return current;
}

/** Test-only. Clears the singleton between cases. */
export function resetZocdocConfig(): void {
  current = undefined;
}

export async function resolveToken(config: ZocdocConfig): Promise<string> {
  return typeof config.getToken === 'string' ? config.getToken : config.getToken();
}
```

- [ ] **Step 5: Write `packages/api-components/src/client/errors.ts`**

```ts
export class ZocdocApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  public constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ZocdocApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * 401 specifically. Access tokens last 60 minutes, so an expired token is the
 * most common failure and deserves a different message from "no results".
 */
export class ZocdocAuthError extends ZocdocApiError {
  public constructor(body: unknown) {
    super(401, 'Zocdoc API rejected the access token. It may have expired.', body);
    this.name = 'ZocdocAuthError';
  }
}
```

- [ ] **Step 6: Write `packages/api-components/src/client/http.ts`**

```ts
import { getZocdocConfig, resolveToken, type ZocdocConfig } from './configure.js';
import { ZocdocApiError, ZocdocAuthError } from './errors.js';

export type QueryParams = Record<string, string | number | boolean | string[] | undefined | null>;

export interface RequestInit_ {
  method?: string;
  query?: QueryParams;
  body?: unknown;
  config?: ZocdocConfig;
  signal?: AbortSignal;
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return url.toString();
}

/** The only place in this codebase that calls fetch. */
export async function request<T>(path: string, init: RequestInit_ = {}): Promise<T> {
  const config = init.config ?? getZocdocConfig();
  const token = await resolveToken(config);

  const response = await fetch(buildUrl(config.baseUrl, path, init.query), {
    method: init.method ?? 'GET',
    signal: init.signal,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = text;
  }

  if (response.status === 401) {
    throw new ZocdocAuthError(parsed);
  }

  if (!response.ok) {
    // Deliberately generic: request bodies may contain PHI and must never be
    // echoed into an error message.
    throw new ZocdocApiError(response.status, `Zocdoc API request failed with ${response.status}.`, parsed);
  }

  return parsed as T;
}
```

- [ ] **Step 7: Run and confirm the tests pass**

Run: `pnpm test:client`
Expected: PASS, 6 new tests.

- [ ] **Step 8: Stage**

```bash
git add packages/api-components/package.json packages/api-components/src/client
```

---

### Task 6: Reference data with in-memory caching

**Files:**
- Create: `packages/api-components/src/client/types.ts`, `packages/api-components/src/client/reference-data.ts`
- Test: `packages/api-components/src/client/__tests__/reference-data.test.ts`

**Interfaces:**
- Consumes: `request` from Task 5
- Produces:
  - `getSpecialties(): Promise<Specialty[]>`
  - `getVisitReasons(specialty?: string): Promise<VisitReason[]>`
  - `getInsurancePlans(): Promise<InsurancePlan[]>`
  - `clearReferenceDataCache(): void`
  - `interface Specialty { id: string; name: string }`
  - `interface VisitReason { id: string; name: string }`
  - `interface InsurancePlan { id: string; name: string }`

Correct the field names in `types.ts` to match what Task 2 actually recorded in `__fixtures__/`. The names above are the expected shape; the fixtures are the truth.

- [ ] **Step 1: Write the failing tests**

`packages/api-components/src/client/__tests__/reference-data.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { clearReferenceDataCache, getSpecialties } from '../reference-data.js';

describe('reference data', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    clearReferenceDataCache();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify([{ id: 'sp_1', name: 'Dermatologist' }]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    );
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('requests /v1/specialties', async () => {
    await getSpecialties();
    expect(String(vi.mocked(fetch).mock.calls[0]![0])).toContain('/v1/specialties');
  });

  it('caches results across calls', async () => {
    await getSpecialties();
    await getSpecialties();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('refetches after the cache is cleared', async () => {
    await getSpecialties();
    clearReferenceDataCache();
    await getSpecialties();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('does not cache a rejected request', async () => {
    clearReferenceDataCache();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })));
    await expect(getSpecialties()).rejects.toBeTruthy();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }))
    );
    await expect(getSpecialties()).resolves.toEqual([]);
  });
});
```

The last test matters: caching a rejected promise permanently poisons the cache for the page's lifetime.

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:client`
Expected: FAIL — cannot resolve `../reference-data.js`.

- [ ] **Step 3: Write `packages/api-components/src/client/types.ts`**

```ts
export interface Specialty {
  id: string;
  name: string;
}

export interface VisitReason {
  id: string;
  name: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
}

export type PatientType = 'new' | 'existing';

export interface ProviderLocation {
  provider_location_id: string;
  provider_name: string;
  specialty?: string;
  address?: {
    address1?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  photo_url?: string;
}

export interface Timeslot {
  provider_location_id: string;
  start_time: string;
}

export interface PatientAddress {
  address1: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface Patient {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex_at_birth: 'male' | 'female';
  phone_number: string;
  email_address: string;
  patient_address: PatientAddress;
  insurance?: {
    plan_id?: string;
    group_number?: string;
    member_id?: string;
    is_self_pay?: boolean;
  };
}
```

Reconcile every field name here against `docs/api-contract-notes.md` from Task 2 before moving on.

- [ ] **Step 4: Write `packages/api-components/src/client/reference-data.ts`**

```ts
import { request } from './http.js';
import type { InsurancePlan, Specialty, VisitReason } from './types.js';

/**
 * Reference data is stable within a page load and the search UI needs it to
 * populate selects. Rejected promises are evicted so one failure does not
 * poison the cache for the lifetime of the page.
 */
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const existing = cache.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const pending = load().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, pending);
  return pending;
}

export function clearReferenceDataCache(): void {
  cache.clear();
}

export function getSpecialties(): Promise<Specialty[]> {
  return cached('specialties', () => request<Specialty[]>('/v1/specialties'));
}

export function getVisitReasons(specialty?: string): Promise<VisitReason[]> {
  return cached(`visit_reasons:${specialty ?? ''}`, () =>
    request<VisitReason[]>('/v1/visit_reasons', { query: { specialty } })
  );
}

export function getInsurancePlans(): Promise<InsurancePlan[]> {
  return cached('insurance_plans', () => request<InsurancePlan[]>('/v1/insurance_plans'));
}
```

If Task 2 recorded an envelope such as `{ data: [...] }` rather than a bare array, unwrap it here and update the test's mock body to match the real shape.

- [ ] **Step 5: Run and confirm the tests pass**

Run: `pnpm test:client`
Expected: PASS, 4 new tests.

- [ ] **Step 6: Stage**

```bash
git add packages/api-components/src/client
```

---

### Task 7: Provider search and availability endpoints

**Files:**
- Create: `packages/api-components/src/client/provider-locations.ts`, `packages/api-components/src/client/availability.ts`
- Test: `packages/api-components/src/client/__tests__/provider-locations.test.ts`, `packages/api-components/src/client/__tests__/availability.test.ts`

**Interfaces:**
- Consumes: `request` (Task 5), types (Task 6)
- Produces:
  - `searchProviderLocations(params: ProviderSearchParams): Promise<ProviderLocation[]>`
  - `interface ProviderSearchParams { zipCode: string; specialtyId?: string; visitReasonId?: string; insurancePlanId?: string; page?: number; pageSize?: number }`
  - `getAvailability(params: AvailabilityParams): Promise<Timeslot[]>`
  - `interface AvailabilityParams { providerLocationIds: string[]; visitReasonId: string; patientType: PatientType; startDate?: string; endDate?: string }`

- [ ] **Step 1: Write the failing search test**

`packages/api-components/src/client/__tests__/provider-locations.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { searchProviderLocations } from '../provider-locations.js';

describe('searchProviderLocations', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
      )
    );
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('maps camelCase params onto the API snake_case names', async () => {
    await searchProviderLocations({ zipCode: '11201', visitReasonId: 'vr_1', pageSize: 5 });

    const url = new URL(String(vi.mocked(fetch).mock.calls[0]![0]));
    expect(url.pathname).toBe('/v1/provider_locations');
    expect(url.searchParams.get('zip_code')).toBe('11201');
    expect(url.searchParams.get('visit_reason_id')).toBe('vr_1');
    expect(url.searchParams.get('page_size')).toBe('5');
  });

  it('omits params that were not supplied', async () => {
    await searchProviderLocations({ zipCode: '11201' });

    const url = new URL(String(vi.mocked(fetch).mock.calls[0]![0]));
    expect(url.searchParams.has('visit_reason_id')).toBe(false);
    expect(url.searchParams.has('insurance_plan_id')).toBe(false);
  });
});
```

**Before implementing:** open `docs/api-contract-notes.md`. If Task 2 found the working parameter names are `specialty` / `visit_reason` / `accepted_insurance` rather than the `_id` forms, change both this test and the implementation to the observed names. The test must encode reality.

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:client`
Expected: FAIL — cannot resolve `../provider-locations.js`.

- [ ] **Step 3: Write `packages/api-components/src/client/provider-locations.ts`**

```ts
import { request } from './http.js';
import type { ProviderLocation } from './types.js';

export interface ProviderSearchParams {
  zipCode: string;
  specialtyId?: string;
  visitReasonId?: string;
  insurancePlanId?: string;
  visitType?: string;
  maxDistanceMi?: number;
  page?: number;
  pageSize?: number;
}

export function searchProviderLocations(params: ProviderSearchParams): Promise<ProviderLocation[]> {
  return request<ProviderLocation[]>('/v1/provider_locations', {
    query: {
      zip_code: params.zipCode,
      specialty_id: params.specialtyId,
      visit_reason_id: params.visitReasonId,
      insurance_plan_id: params.insurancePlanId,
      visit_type: params.visitType,
      max_distance_to_patient_mi: params.maxDistanceMi,
      page: params.page,
      page_size: params.pageSize,
    },
  });
}
```

- [ ] **Step 4: Write the failing availability test**

`packages/api-components/src/client/__tests__/availability.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAvailability } from '../availability.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';

describe('getAvailability', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
      )
    );
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('comma-joins provider location ids', async () => {
    await getAvailability({
      providerLocationIds: ['pr_a|lo_a', 'pr_b|lo_b'],
      visitReasonId: 'vr_1',
      patientType: 'new',
    });

    const url = new URL(String(vi.mocked(fetch).mock.calls[0]![0]));
    expect(url.pathname).toBe('/v1/provider_locations/availability');
    expect(url.searchParams.get('provider_location_ids')).toBe('pr_a|lo_a,pr_b|lo_b');
    expect(url.searchParams.get('patient_type')).toBe('new');
  });

  it('passes the date window through under the provider-local-time names', async () => {
    await getAvailability({
      providerLocationIds: ['pr_a|lo_a'],
      visitReasonId: 'vr_1',
      patientType: 'new',
      startDate: '2026-08-01',
      endDate: '2026-08-08',
    });

    const url = new URL(String(vi.mocked(fetch).mock.calls[0]![0]));
    expect(url.searchParams.get('start_date_in_provider_local_time')).toBe('2026-08-01');
    expect(url.searchParams.get('end_date_in_provider_local_time')).toBe('2026-08-08');
  });
});
```

- [ ] **Step 5: Write `packages/api-components/src/client/availability.ts`**

```ts
import { request } from './http.js';
import type { PatientType, Timeslot } from './types.js';

export interface AvailabilityParams {
  providerLocationIds: string[];
  visitReasonId: string;
  patientType: PatientType;
  /** YYYY-MM-DD. Defaults to today in ET on the server. */
  startDate?: string;
  /** YYYY-MM-DD. Must be within 30 days of startDate, and at most 150 days out. */
  endDate?: string;
}

export function getAvailability(params: AvailabilityParams): Promise<Timeslot[]> {
  return request<Timeslot[]>('/v1/provider_locations/availability', {
    query: {
      provider_location_ids: params.providerLocationIds,
      visit_reason_id: params.visitReasonId,
      patient_type: params.patientType,
      start_date_in_provider_local_time: params.startDate,
      end_date_in_provider_local_time: params.endDate,
    },
  });
}
```

- [ ] **Step 6: Run and confirm all four pass**

Run: `pnpm test:client`
Expected: PASS, 4 new tests.

- [ ] **Step 7: Stage**

```bash
git add packages/api-components/src/client
```

---

### Task 8: Appointment creation

**Files:**
- Create: `packages/api-components/src/client/appointments.ts`, `packages/api-components/src/index.ts`
- Test: `packages/api-components/src/client/__tests__/appointments.test.ts`

**Interfaces:**
- Consumes: `request` (Task 5), `Patient` / `PatientType` (Task 6)
- Produces:
  - `createAppointment(input: CreateAppointmentInput): Promise<CreatedAppointment>`
  - `interface CreateAppointmentInput { providerLocationId: string; visitReasonId: string; startTime: string; patientType: PatientType; patient: Patient; notes?: string }`
  - `interface CreatedAppointment { appointment_id: string }`

- [ ] **Step 1: Write the failing test**

`packages/api-components/src/client/__tests__/appointments.test.ts`. Patient values here are obviously synthetic placeholders, never real data.

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppointment } from '../appointments.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import type { Patient } from '../types.js';

const TEST_PATIENT: Patient = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '5551234567',
  email_address: 'test@example.test',
  patient_address: { address1: '1 Test St', city: 'Brooklyn', state: 'NY', zip_code: '11201' },
};

describe('createAppointment', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ appointment_id: 'ap_1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    );
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('POSTs the documented envelope', async () => {
    const result = await createAppointment({
      providerLocationId: 'pr_a|lo_a',
      visitReasonId: 'vr_1',
      startTime: '2026-08-05T14:00:00-04:00',
      patientType: 'new',
      patient: TEST_PATIENT,
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(String(url)).toBe('https://example.test/v1/appointments');
    expect(init?.method).toBe('POST');

    const body = JSON.parse(String(init?.body));
    expect(body.appointment_type).toBe('providers');
    expect(body.data.provider_location_id).toBe('pr_a|lo_a');
    expect(body.data.start_time).toBe('2026-08-05T14:00:00-04:00');
    expect(body.data.patient.first_name).toBe('Test');
    expect(result.appointment_id).toBe('ap_1');
  });

  it('omits notes when not supplied', async () => {
    await createAppointment({
      providerLocationId: 'pr_a|lo_a',
      visitReasonId: 'vr_1',
      startTime: '2026-08-05T14:00:00-04:00',
      patientType: 'new',
      patient: TEST_PATIENT,
    });

    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0]![1]?.body));
    expect('notes' in body.data).toBe(false);
  });

  it('rejects notes longer than 100 characters before sending', async () => {
    await expect(
      createAppointment({
        providerLocationId: 'pr_a|lo_a',
        visitReasonId: 'vr_1',
        startTime: '2026-08-05T14:00:00-04:00',
        patientType: 'new',
        patient: TEST_PATIENT,
        notes: 'x'.repeat(101),
      })
    ).rejects.toThrow(/100 characters/);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:client`
Expected: FAIL — cannot resolve `../appointments.js`.

- [ ] **Step 3: Write `packages/api-components/src/client/appointments.ts`**

```ts
import { request } from './http.js';
import type { Patient, PatientType } from './types.js';

export interface CreateAppointmentInput {
  providerLocationId: string;
  visitReasonId: string;
  /** Must match a start_time returned by getAvailability exactly. */
  startTime: string;
  patientType: PatientType;
  patient: Patient;
  /** Max 100 characters. */
  notes?: string;
}

export interface CreatedAppointment {
  appointment_id: string;
}

const MAX_NOTES_LENGTH = 100;

export function createAppointment(input: CreateAppointmentInput): Promise<CreatedAppointment> {
  if (input.notes !== undefined && input.notes.length > MAX_NOTES_LENGTH) {
    // Reject locally rather than round-tripping PHI to get a 400 back.
    return Promise.reject(new Error(`notes must be at most ${MAX_NOTES_LENGTH} characters.`));
  }

  return request<CreatedAppointment>('/v1/appointments', {
    method: 'POST',
    body: {
      appointment_type: 'providers',
      data: {
        provider_location_id: input.providerLocationId,
        visit_reason_id: input.visitReasonId,
        start_time: input.startTime,
        patient_type: input.patientType,
        patient: input.patient,
        ...(input.notes === undefined ? {} : { notes: input.notes }),
      },
    },
  });
}
```

- [ ] **Step 4: Write `packages/api-components/src/index.ts`**

```ts
// Importing primitives first guarantees the zd prefix is set before any
// component module below is evaluated. Keep this import first.
import '@powered-by-zocdoc/primitives';

export * from './client/appointments.js';
export * from './client/availability.js';
export * from './client/configure.js';
export * from './client/errors.js';
export * from './client/provider-locations.js';
export * from './client/reference-data.js';
export * from './client/types.js';
```

Component exports are appended to this file as Tasks 10–15 land.

- [ ] **Step 5: Run and confirm the tests pass**

Run: `pnpm test:client`
Expected: PASS, 3 new tests.

- [ ] **Step 6: Stage**

```bash
git add packages/api-components/src
```

---

### Task 9: Mount helper and shared request-state rendering

**Files:**
- Create: `packages/api-components/src/test/mount.ts`, `packages/api-components/src/components/internal/request-state.ts`
- Test: `packages/api-components/src/components/internal/__tests__/request-state.browser.test.ts`

**Interfaces:**
- Consumes: `CharmElement` from `@charm-ux/core`
- Produces:
  - `mount<T extends HTMLElement>(html: string): Promise<T>` — appends, waits for `updateComplete`, auto-cleans in `afterEach`
  - `type RequestState = 'idle' | 'loading' | 'success' | 'empty' | 'error'`
  - `renderRequestState(state: RequestState, scope: { tag(name: string): unknown }, options: RequestStateOptions): unknown`
  - `interface RequestStateOptions { errorMessage?: string; emptyMessage: string; onRetry: () => void; children: () => unknown }`

- [ ] **Step 1: Write `packages/api-components/src/test/mount.ts`**

```ts
import { afterEach } from 'vitest';

const mounted: HTMLElement[] = [];

afterEach(() => {
  while (mounted.length) {
    mounted.pop()?.remove();
  }
});

/**
 * Renders a fragment into the document, waits for the first Lit update, and
 * registers it for teardown.
 */
export async function mount<T extends HTMLElement>(markup: string): Promise<T> {
  const host = document.createElement('div');
  host.innerHTML = markup;
  const element = host.firstElementChild as T;
  document.body.append(element);
  mounted.push(element);

  await (element as T & { updateComplete?: Promise<unknown> }).updateComplete;
  return element;
}

/** Waits for a Lit element to finish its next update cycle. */
export async function settled(element: HTMLElement): Promise<void> {
  await (element as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
}
```

- [ ] **Step 2: Write the failing test**

`packages/api-components/src/components/internal/__tests__/request-state.browser.test.ts`:

```ts
import { html, render } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { renderRequestState } from '../request-state.js';

const scope = { tag: (name: string) => `zd-${name}` };

function renderTo(state: Parameters<typeof renderRequestState>[0], onRetry = vi.fn()): HTMLElement {
  const host = document.createElement('div');
  render(
    html`${renderRequestState(state, scope, {
      emptyMessage: 'Nothing here',
      errorMessage: 'It broke',
      onRetry,
      children: () => html`<p class="content">loaded</p>`,
    })}`,
    host
  );
  return host;
}

describe('renderRequestState', () => {
  it('renders children only in the success state', () => {
    expect(renderTo('success').querySelector('.content')).not.toBeNull();
    expect(renderTo('loading').querySelector('.content')).toBeNull();
  });

  it('renders the empty message in the empty state', () => {
    expect(renderTo('empty').textContent).toContain('Nothing here');
  });

  it('renders the error message and a retry control in the error state', () => {
    const host = renderTo('error');
    expect(host.textContent).toContain('It broke');
    expect(host.querySelector('[part="retry"]')).not.toBeNull();
  });

  it('renders nothing in the idle state', () => {
    expect(renderTo('idle').textContent?.trim()).toBe('');
  });
});
```

- [ ] **Step 3: Run and confirm failure**

Run: `pnpm test:components`
Expected: FAIL — cannot resolve `../request-state.js`.

- [ ] **Step 4: Write `packages/api-components/src/components/internal/request-state.ts`**

```ts
import { nothing } from 'lit';
import { html } from 'lit/static-html.js';

export type RequestState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface RequestStateOptions {
  /** Shown in the error state. */
  errorMessage?: string;
  /** Shown in the empty state. An empty result is routine, not a failure. */
  emptyMessage: string;
  onRetry: () => void;
  children: () => unknown;
}

interface ScopeLike {
  tag(name: string): unknown;
}

/**
 * Single rendering of the five request states, shared by every fetching
 * component so their loading, empty, and error affordances stay identical.
 */
export function renderRequestState(state: RequestState, scope: ScopeLike, options: RequestStateOptions): unknown {
  switch (state) {
    case 'idle':
      return nothing;

    case 'loading':
      return html`<${scope.tag('spinner')} part="loading" label="Loading"></${scope.tag('spinner')}>`;

    case 'empty':
      return html`<p part="empty">${options.emptyMessage}</p>`;

    case 'error':
      return html`
        <${scope.tag('alert')} part="error" variant="danger" open>
          ${options.errorMessage ?? 'Something went wrong.'}
          <${scope.tag('button')} part="retry" size="small" @click=${options.onRetry}>
            Try again
          </${scope.tag('button')}>
        </${scope.tag('alert')}>
      `;

    case 'success':
      return options.children();

    default:
      return nothing;
  }
}
```

- [ ] **Step 5: Run and confirm the tests pass**

Run: `pnpm test:components`
Expected: PASS, 4 new tests.

- [ ] **Step 6: Stage**

```bash
git add packages/api-components/src/test packages/api-components/src/components/internal
```

---

### Task 10: `zd-provider-results`

Pure presentation — it renders what it is given and emits a selection. Built first because every other component's tests can reuse its shape, and it has no network dependency.

**Files:**
- Create: `packages/api-components/src/components/provider-results/provider-results.ts`, `.../index.ts`, `.../provider-results.styles.ts`
- Test: `packages/api-components/src/components/provider-results/provider-results.browser.test.ts`

**Interfaces:**
- Consumes: `ProviderLocation` (Task 6), `renderRequestState` (Task 9)
- Produces: `<zd-provider-results>` with property `providers: ProviderLocation[]`, `selectedId?: string`; emits `provider-select` with `detail: { provider: ProviderLocation }`

- [ ] **Step 1: Write the failing test**

`packages/api-components/src/components/provider-results/provider-results.browser.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { ProviderLocation } from '../../client/types.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

const PROVIDERS: ProviderLocation[] = [
  { provider_location_id: 'pr_a|lo_a', provider_name: 'Dr. A', specialty: 'Dermatologist' },
  { provider_location_id: 'pr_b|lo_b', provider_name: 'Dr. B', specialty: 'Dermatologist' },
];

describe('zd-provider-results', () => {
  it('renders one card per provider', async () => {
    const el = await mount<HTMLElement & { providers: ProviderLocation[] }>('<zd-provider-results></zd-provider-results>');
    el.providers = PROVIDERS;
    await settled(el);

    expect(el.shadowRoot!.querySelectorAll('[part="provider"]')).toHaveLength(2);
  });

  it('shows an empty state when given no providers', async () => {
    const el = await mount<HTMLElement & { providers: ProviderLocation[] }>('<zd-provider-results></zd-provider-results>');
    el.providers = [];
    await settled(el);

    expect(el.shadowRoot!.textContent).toContain('No providers');
  });

  it('emits provider-select with the chosen provider', async () => {
    const el = await mount<HTMLElement & { providers: ProviderLocation[] }>('<zd-provider-results></zd-provider-results>');
    el.providers = PROVIDERS;
    await settled(el);

    const events: CustomEvent[] = [];
    el.addEventListener('provider-select', event => events.push(event as CustomEvent));

    el.shadowRoot!.querySelectorAll<HTMLElement>('[part="provider"]')[1]!.click();

    expect(events).toHaveLength(1);
    expect(events[0]!.detail.provider.provider_location_id).toBe('pr_b|lo_b');
  });

  it('emits a composed event that escapes the shadow root', async () => {
    const el = await mount<HTMLElement & { providers: ProviderLocation[] }>('<zd-provider-results></zd-provider-results>');
    el.providers = PROVIDERS;
    await settled(el);

    const events: Event[] = [];
    document.body.addEventListener('provider-select', event => events.push(event));

    el.shadowRoot!.querySelector<HTMLElement>('[part="provider"]')!.click();

    expect(events).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:components`
Expected: FAIL — cannot resolve `./index.js`.

- [ ] **Step 3: Write `packages/api-components/src/components/provider-results/provider-results.styles.ts`**

```ts
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  ul {
    display: grid;
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  [part='provider'] {
    cursor: pointer;
    text-align: start;
    width: 100%;
  }
`;
```

- [ ] **Step 4: Write `packages/api-components/src/components/provider-results/provider-results.ts`**

```ts
import { card, CharmElement } from '@powered-by-zocdoc/primitives';
import { property } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import type { ProviderLocation } from '../../client/types.js';
import styles from './provider-results.styles.js';

/**
 * Renders a list of provider locations and emits the one the user picks.
 * Purely presentational — it performs no network requests.
 *
 * @event provider-select - Emitted with `{ provider }` when a provider is chosen.
 */
export default class ProviderResults extends CharmElement {
  public static override baseName = 'provider-results';
  public static override styles = [CharmElement.styles, styles];

  public static override get dependencies(): (typeof CharmElement)[] {
    return [card];
  }

  /** The provider locations to display. */
  @property({ attribute: false })
  public providers: ProviderLocation[] = [];

  /** The currently selected provider_location_id, if any. */
  @property({ type: String, attribute: 'selected-id' })
  public selectedId?: string;

  protected override render(): unknown {
    if (this.providers.length === 0) {
      return html`<p part="empty">No providers match this search.</p>`;
    }

    return html`
      <ul part="list">
        ${this.providers.map(
          provider => html`
            <li>
              <${this.scope.tag('card')}
                part="provider"
                role="button"
                tabindex="0"
                aria-pressed=${provider.provider_location_id === this.selectedId ? 'true' : 'false'}
                @click=${() => this.#select(provider)}
                @keydown=${(event: KeyboardEvent) => this.#onKeydown(event, provider)}
              >
                <strong>${provider.provider_name}</strong>
                ${provider.specialty ? html`<div>${provider.specialty}</div>` : ''}
              </${this.scope.tag('card')}>
            </li>
          `
        )}
      </ul>
    `;
  }

  #select(provider: ProviderLocation): void {
    this.selectedId = provider.provider_location_id;
    this.emit('provider-select', { detail: { provider } });
  }

  #onKeydown(event: KeyboardEvent, provider: ProviderLocation): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.#select(provider);
    }
  }
}
```

`emit()` is `protected` on `CharmElement` and defaults to `bubbles: true, composed: true`, which is what the fourth test asserts.

- [ ] **Step 5: Write `packages/api-components/src/components/provider-results/index.ts`**

```ts
import { project } from '@powered-by-zocdoc/primitives';
import providerResults from './provider-results.js';

export * from './provider-results.js';
export { default } from './provider-results.js';

project.scope.registerComponent(providerResults);
```

- [ ] **Step 6: Run and confirm the tests pass**

Run: `pnpm test:components`
Expected: PASS, 4 new tests.

- [ ] **Step 7: Export from the package and stage**

Append to `packages/api-components/src/index.ts`:

```ts
export { default as ProviderResults } from './components/provider-results/index.js';
```

```bash
git add packages/api-components/src
```

---

### Task 11: `zd-provider-search`

**Files:**
- Create: `packages/api-components/src/components/provider-search/provider-search.ts`, `.../index.ts`, `.../provider-search.styles.ts`
- Test: `packages/api-components/src/components/provider-search/provider-search.browser.test.ts`

**Interfaces:**
- Consumes: `searchProviderLocations` (Task 7), `getVisitReasons` / `getInsurancePlans` (Task 6), `renderRequestState` (Task 9)
- Produces: `<zd-provider-search>` with attributes `zip-code`, `visit-reason-id`, `insurance-plan-id`; emits `provider-results` with `detail: { providers: ProviderLocation[] }` and `error` with `detail: { error: unknown }`

- [ ] **Step 1: Write the failing test**

`packages/api-components/src/components/provider-search/provider-search.browser.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as providerLocations from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

describe('zd-provider-search', () => {
  beforeEach(() => {
    vi.spyOn(providerLocations, 'searchProviderLocations').mockResolvedValue([
      { provider_location_id: 'pr_a|lo_a', provider_name: 'Dr. A' },
    ]);
    vi.spyOn(referenceData, 'getVisitReasons').mockResolvedValue([{ id: 'vr_1', name: 'Skin check' }]);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([{ id: 'ip_1', name: 'Aetna PPO' }]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not search until asked', async () => {
    await mount('<zd-provider-search></zd-provider-search>');
    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
  });

  it('populates the visit reason and insurance selects from reference data', async () => {
    const el = await mount('<zd-provider-search zip-code="11201"></zd-provider-search>');

    // One placeholder option plus one loaded option in each select.
    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelectorAll('[part="visit-reason"] option')).toHaveLength(2);
      expect(el.shadowRoot!.querySelectorAll('[part="insurance"] option')).toHaveLength(2);
    });
  });

  it('sends the selected visit reason and insurance with the search', async () => {
    const el = await mount<HTMLElement & { visitReasonId?: string; insurancePlanId?: string; search(): Promise<void> }>(
      '<zd-provider-search zip-code="11201"></zd-provider-search>'
    );
    el.visitReasonId = 'vr_1';
    el.insurancePlanId = 'ip_1';
    await settled(el);
    await el.search();

    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({ zipCode: '11201', visitReasonId: 'vr_1', insurancePlanId: 'ip_1' })
    );
  });

  it('still renders the form when reference data fails to load', async () => {
    vi.mocked(referenceData.getVisitReasons).mockRejectedValue(new Error('boom'));

    const el = await mount('<zd-provider-search zip-code="11201"></zd-provider-search>');
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector('[part="submit"]')).not.toBeNull());
  });

  it('emits provider-results after a successful search', async () => {
    const el = await mount<HTMLElement & { zipCode: string; search(): Promise<void> }>(
      '<zd-provider-search zip-code="11201"></zd-provider-search>'
    );

    const events: CustomEvent[] = [];
    el.addEventListener('provider-results', event => events.push(event as CustomEvent));

    await el.search();
    await settled(el);

    expect(events).toHaveLength(1);
    expect(events[0]!.detail.providers).toHaveLength(1);
  });

  it('renders the error state and emits error when the request fails', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockRejectedValue(new Error('boom'));

    const el = await mount<HTMLElement & { search(): Promise<void> }>(
      '<zd-provider-search zip-code="10112"></zd-provider-search>'
    );

    const errors: CustomEvent[] = [];
    el.addEventListener('error', event => errors.push(event as CustomEvent));

    await el.search();
    await settled(el);

    expect(el.shadowRoot!.querySelector('[part="error"]')).not.toBeNull();
    expect(errors).toHaveLength(1);
  });

  it('renders the empty state when no providers come back', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue([]);

    const el = await mount<HTMLElement & { search(): Promise<void> }>(
      '<zd-provider-search zip-code="99734"></zd-provider-search>'
    );
    await el.search();
    await settled(el);

    expect(el.shadowRoot!.querySelector('[part="empty"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:components`
Expected: FAIL — cannot resolve `./index.js`.

- [ ] **Step 3: Write `packages/api-components/src/components/provider-search/provider-search.styles.ts`**

```ts
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  form {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
`;
```

- [ ] **Step 4: Write `packages/api-components/src/components/provider-search/provider-search.ts`**

```ts
import { button, CharmElement, input, select } from '@powered-by-zocdoc/primitives';
import { property, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { searchProviderLocations } from '../../client/provider-locations.js';
import { getInsurancePlans, getVisitReasons } from '../../client/reference-data.js';
import type { InsurancePlan, ProviderLocation, VisitReason } from '../../client/types.js';
import { renderRequestState, type RequestState } from '../internal/request-state.js';
import styles from './provider-search.styles.js';

/**
 * Collects search criteria and queries GET /v1/provider_locations.
 * Emits results rather than rendering them, so it composes with
 * zd-provider-results or anything else.
 *
 * @event provider-results - Emitted with `{ providers }` on a successful search.
 * @event error - Emitted with `{ error }` when the request fails.
 */
export default class ProviderSearch extends CharmElement {
  public static override baseName = 'provider-search';
  public static override styles = [CharmElement.styles, styles];

  public static override get dependencies(): (typeof CharmElement)[] {
    return [
      input,
      select,
      button,
    ];
  }

  @property({ type: String, attribute: 'zip-code' })
  public zipCode = '';

  @property({ type: String, attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ type: String, attribute: 'insurance-plan-id' })
  public insurancePlanId?: string;

  @state()
  private visitReasons: VisitReason[] = [];

  @state()
  private insurancePlans: InsurancePlan[] = [];

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private errorMessage?: string;

  public override connectedCallback(): void {
    super.connectedCallback();
    void this.#loadReferenceData();
  }

  /**
   * Reference data populates the selects. A failure here degrades the form to
   * ZIP-only rather than blocking search, so it is caught and not surfaced as
   * the component's error state.
   */
  async #loadReferenceData(): Promise<void> {
    const [visitReasons, insurancePlans] = await Promise.all([
      getVisitReasons().catch(() => []),
      getInsurancePlans().catch(() => []),
    ]);

    this.visitReasons = visitReasons;
    this.insurancePlans = insurancePlans;
  }

  /** Runs the search. Public so a host page or coordinator can trigger it. */
  public async search(): Promise<void> {
    this.requestState = 'loading';
    this.errorMessage = undefined;

    try {
      const providers = await searchProviderLocations({
        zipCode: this.zipCode,
        visitReasonId: this.visitReasonId,
        insurancePlanId: this.insurancePlanId,
      });

      this.requestState = providers.length === 0 ? 'empty' : 'success';
      this.emit('provider-results', { detail: { providers } });
    } catch (error: unknown) {
      this.requestState = 'error';
      this.errorMessage = error instanceof Error ? error.message : 'Search failed.';
      this.emit('error', { detail: { error } });
    }
  }

  protected override render(): unknown {
    return html`
      <form
        part="form"
        @submit=${(event: Event) => {
          event.preventDefault();
          void this.search();
        }}
      >
        <${this.scope.tag('input')}
          part="zip"
          label="ZIP code"
          .value=${this.zipCode}
          @change=${(event: Event) => {
            this.zipCode = (event.target as HTMLInputElement).value;
          }}
        ></${this.scope.tag('input')}>

        <${this.scope.tag('select')}
          part="visit-reason"
          label="Reason for visit"
          .value=${this.visitReasonId ?? ''}
          @change=${(event: Event) => {
            this.visitReasonId = (event.target as HTMLSelectElement).value || undefined;
          }}
        >
          <option value="">Any reason</option>
          ${this.visitReasons.map(reason => html`<option value=${reason.id}>${reason.name}</option>`)}
        </${this.scope.tag('select')}>

        <${this.scope.tag('select')}
          part="insurance"
          label="Insurance"
          .value=${this.insurancePlanId ?? ''}
          @change=${(event: Event) => {
            this.insurancePlanId = (event.target as HTMLSelectElement).value || undefined;
          }}
        >
          <option value="">Any insurance</option>
          ${this.insurancePlans.map(plan => html`<option value=${plan.id}>${plan.name}</option>`)}
        </${this.scope.tag('select')}>

        <${this.scope.tag('button')} part="submit" type="submit" variant="primary">
          Search
        </${this.scope.tag('button')}>
      </form>

      ${renderRequestState(this.requestState, this.scope, {
        emptyMessage: 'No providers match this search.',
        errorMessage: this.errorMessage,
        onRetry: () => void this.search(),
        children: () => '',
      })}
    `;
  }
}
```

The success branch renders nothing because results are emitted, not displayed — `zd-provider-results` owns display.

- [ ] **Step 5: Write `packages/api-components/src/components/provider-search/index.ts`**

```ts
import { project } from '@powered-by-zocdoc/primitives';
import providerSearch from './provider-search.js';

export * from './provider-search.js';
export { default } from './provider-search.js';

project.scope.registerComponent(providerSearch);
```

- [ ] **Step 6: Run and confirm the tests pass**

Run: `pnpm test:components`
Expected: PASS, 7 new tests.

- [ ] **Step 7: Export and stage**

Append to `packages/api-components/src/index.ts`:

```ts
export { default as ProviderSearch } from './components/provider-search/index.js';
```

```bash
git add packages/api-components/src
```

---

### Task 12: `zd-availability-picker`

Renders a day strip built from Charm's `button-group` plus a timeslot list. No calendar primitive is built.

**Files:**
- Create: `packages/api-components/src/components/availability-picker/availability-picker.ts`, `.../index.ts`, `.../availability-picker.styles.ts`
- Test: `packages/api-components/src/components/availability-picker/availability-picker.browser.test.ts`

**Interfaces:**
- Consumes: `getAvailability` (Task 7), `renderRequestState` (Task 9)
- Produces: `<zd-availability-picker>` with properties `providerLocationId?: string`, `visitReasonId?: string`, `patientType: PatientType`, `days: number`; emits `slot-select` with `detail: { startTime: string; providerLocationId: string }`

- [ ] **Step 1: Write the failing test**

`packages/api-components/src/components/availability-picker/availability-picker.browser.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as availability from '../../client/availability.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

const SLOTS = [
  { provider_location_id: 'pr_a|lo_a', start_time: '2026-08-05T14:00:00-04:00' },
  { provider_location_id: 'pr_a|lo_a', start_time: '2026-08-05T15:30:00-04:00' },
  { provider_location_id: 'pr_a|lo_a', start_time: '2026-08-06T09:00:00-04:00' },
];

describe('zd-availability-picker', () => {
  beforeEach(() => {
    vi.spyOn(availability, 'getAvailability').mockResolvedValue(SLOTS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stays idle until it has a provider location id', async () => {
    await mount('<zd-availability-picker visit-reason-id="vr_1"></zd-availability-picker>');
    expect(availability.getAvailability).not.toHaveBeenCalled();
  });

  it('fetches once both ids are set', async () => {
    const el = await mount<HTMLElement & { providerLocationId: string; visitReasonId: string }>(
      '<zd-availability-picker visit-reason-id="vr_1"></zd-availability-picker>'
    );
    el.providerLocationId = 'pr_a|lo_a';
    await settled(el);
    await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));
  });

  it('groups slots into one day button per distinct date', async () => {
    const el = await mount<HTMLElement & { providerLocationId: string }>(
      '<zd-availability-picker visit-reason-id="vr_1"></zd-availability-picker>'
    );
    el.providerLocationId = 'pr_a|lo_a';
    await vi.waitFor(() => expect(el.shadowRoot!.querySelectorAll('[part="day"]').length).toBe(2));
  });

  it('emits slot-select when a timeslot is clicked', async () => {
    const el = await mount<HTMLElement & { providerLocationId: string }>(
      '<zd-availability-picker visit-reason-id="vr_1"></zd-availability-picker>'
    );
    el.providerLocationId = 'pr_a|lo_a';
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector('[part="slot"]')).not.toBeNull());

    const events: CustomEvent[] = [];
    el.addEventListener('slot-select', event => events.push(event as CustomEvent));
    el.shadowRoot!.querySelector<HTMLElement>('[part="slot"]')!.click();

    expect(events[0]!.detail.startTime).toBe('2026-08-05T14:00:00-04:00');
  });

  it('renders the empty state when there is no availability', async () => {
    vi.mocked(availability.getAvailability).mockResolvedValue([]);

    const el = await mount<HTMLElement & { providerLocationId: string }>(
      '<zd-availability-picker visit-reason-id="vr_1"></zd-availability-picker>'
    );
    el.providerLocationId = 'pr_a|lo_a';
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector('[part="empty"]')).not.toBeNull());
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:components`
Expected: FAIL — cannot resolve `./index.js`.

- [ ] **Step 3: Write `packages/api-components/src/components/availability-picker/availability-picker.styles.ts`**

```ts
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  [part='days'] {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
    padding-block-end: 0.5rem;
  }

  [part='slots'] {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block-start: 0.75rem;
  }
`;
```

- [ ] **Step 4: Write `packages/api-components/src/components/availability-picker/availability-picker.ts`**

```ts
import { button, buttonGroup, CharmElement } from '@powered-by-zocdoc/primitives';
import { property, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { getAvailability } from '../../client/availability.js';
import type { PatientType, Timeslot } from '../../client/types.js';
import { renderRequestState, type RequestState } from '../internal/request-state.js';
import styles from './availability-picker.styles.js';

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Fetches and renders bookable timeslots as a day strip plus a time list.
 * Uses Charm's button-group rather than a calendar primitive.
 *
 * @event slot-select - Emitted with `{ startTime, providerLocationId }`.
 * @event error - Emitted with `{ error }` when the request fails.
 */
export default class AvailabilityPicker extends CharmElement {
  public static override baseName = 'availability-picker';
  public static override styles = [CharmElement.styles, styles];

  public static override get dependencies(): (typeof CharmElement)[] {
    return [button, buttonGroup];
  }

  @property({ type: String, attribute: 'provider-location-id' })
  public providerLocationId?: string;

  @property({ type: String, attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ type: String, attribute: 'patient-type' })
  public patientType: PatientType = 'new';

  /** Size of the availability window in days. The API caps this at 30. */
  @property({ type: Number })
  public days = 7;

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private slots: Timeslot[] = [];

  @state()
  private activeDay?: string;

  @state()
  private errorMessage?: string;

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('providerLocationId') || changed.has('visitReasonId') || changed.has('patientType')) {
      void this.load();
    }
  }

  /** Fetches availability. Safe to call repeatedly; no-ops without both ids. */
  public async load(): Promise<void> {
    if (!this.providerLocationId || !this.visitReasonId) {
      this.requestState = 'idle';
      return;
    }

    this.requestState = 'loading';
    this.errorMessage = undefined;

    const start = new Date();
    const end = new Date(start.getTime() + this.days * 24 * 60 * 60 * 1000);

    try {
      const slots = await getAvailability({
        providerLocationIds: [this.providerLocationId],
        visitReasonId: this.visitReasonId,
        patientType: this.patientType,
        startDate: isoDate(start),
        endDate: isoDate(end),
      });

      this.slots = slots;
      this.activeDay = slots[0]?.start_time.slice(0, 10);
      this.requestState = slots.length === 0 ? 'empty' : 'success';
    } catch (error: unknown) {
      this.requestState = 'error';
      this.errorMessage = error instanceof Error ? error.message : 'Could not load availability.';
      this.emit('error', { detail: { error } });
    }
  }

  private get dayKeys(): string[] {
    return [...new Set(this.slots.map(slot => slot.start_time.slice(0, 10)))];
  }

  #selectSlot(slot: Timeslot): void {
    this.emit('slot-select', {
      detail: { startTime: slot.start_time, providerLocationId: slot.provider_location_id },
    });
  }

  protected override render(): unknown {
    return renderRequestState(this.requestState, this.scope, {
      emptyMessage: 'No availability in this range.',
      errorMessage: this.errorMessage,
      onRetry: () => void this.load(),
      children: () => html`
        <${this.scope.tag('button-group')} part="days" label="Available days">
          ${this.dayKeys.map(
            day => html`
              <${this.scope.tag('button')}
                part="day"
                aria-pressed=${day === this.activeDay ? 'true' : 'false'}
                @click=${() => {
                  this.activeDay = day;
                }}
              >
                ${day}
              </${this.scope.tag('button')}>
            `
          )}
        </${this.scope.tag('button-group')}>

        <div part="slots">
          ${this.slots
            .filter(slot => slot.start_time.slice(0, 10) === this.activeDay)
            .map(
              slot => html`
                <${this.scope.tag('button')} part="slot" @click=${() => this.#selectSlot(slot)}>
                  ${new Date(slot.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </${this.scope.tag('button')}>
              `
            )}
        </div>
      `,
    });
  }
}
```

- [ ] **Step 5: Write `packages/api-components/src/components/availability-picker/index.ts`**

```ts
import { project } from '@powered-by-zocdoc/primitives';
import availabilityPicker from './availability-picker.js';

export * from './availability-picker.js';
export { default } from './availability-picker.js';

project.scope.registerComponent(availabilityPicker);
```

- [ ] **Step 6: Run and confirm the tests pass**

Run: `pnpm test:components`
Expected: PASS, 5 new tests.

- [ ] **Step 7: Export and stage**

Append to `packages/api-components/src/index.ts`:

```ts
export { default as AvailabilityPicker } from './components/availability-picker/index.js';
```

```bash
git add packages/api-components/src
```

---

### Task 13: `zd-patient-form`

Collects PHI. Re-read the PHI rules in Global Constraints before starting. This component collects and validates only — it never calls the API.

It extends `CharmElement`, not `CharmFormControlElement`. A form-control element represents a single value participating in a form; this is a composite of ten fields that emits one object. It composes Charm's `input` and `select` — which are form controls themselves — and validates the collected values in one pass.

**Files:**
- Create: `packages/api-components/src/components/patient-form/patient-form.ts`, `.../index.ts`, `.../patient-form.styles.ts`
- Test: `packages/api-components/src/components/patient-form/patient-form.browser.test.ts`

**Interfaces:**
- Consumes: `Patient` (Task 6)
- Produces: `<zd-patient-form>`; emits `patient-submit` with `detail: { patient: Patient; notes?: string }`

- [ ] **Step 1: Write the failing test**

`packages/api-components/src/components/patient-form/patient-form.browser.test.ts`. Every value is a synthetic placeholder.

```ts
import { describe, expect, it } from 'vitest';
import { mount, settled } from '../../test/mount.js';
import './index.js';

type FormEl = HTMLElement & {
  values: Record<string, string>;
  submit(): void;
};

async function fill(el: FormEl): Promise<void> {
  el.values = {
    first_name: 'Test',
    last_name: 'Patient',
    date_of_birth: '1990-01-01',
    sex_at_birth: 'female',
    phone_number: '5551234567',
    email_address: 'test@example.test',
    address1: '1 Test St',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: '11201',
  };
  await settled(el);
}

describe('zd-patient-form', () => {
  it('does not emit when required fields are missing', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');

    const events: CustomEvent[] = [];
    el.addEventListener('patient-submit', event => events.push(event as CustomEvent));
    el.submit();

    expect(events).toHaveLength(0);
  });

  it('emits a correctly shaped patient object when complete', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);

    const events: CustomEvent[] = [];
    el.addEventListener('patient-submit', event => events.push(event as CustomEvent));
    el.submit();

    expect(events).toHaveLength(1);
    const { patient } = events[0]!.detail;
    expect(patient.first_name).toBe('Test');
    expect(patient.patient_address).toEqual({
      address1: '1 Test St',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: '11201',
    });
  });

  it('rejects a phone number that is not 10 digits', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await fill(el);
    el.values = { ...el.values, phone_number: '555-123-4567' };
    await settled(el);

    const events: CustomEvent[] = [];
    el.addEventListener('patient-submit', event => events.push(event as CustomEvent));
    el.submit();

    expect(events).toHaveLength(0);
    expect(el.shadowRoot!.textContent).toContain('10 digits');
  });

  it('caps notes at 100 characters', async () => {
    const el = await mount<FormEl>('<zd-patient-form></zd-patient-form>');
    await settled(el);

    const notes = el.shadowRoot!.querySelector('[part="notes"]');
    expect(notes?.getAttribute('maxlength')).toBe('100');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:components`
Expected: FAIL — cannot resolve `./index.js`.

- [ ] **Step 3: Write `packages/api-components/src/components/patient-form/patient-form.styles.ts`**

```ts
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  form {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  [part='errors'] {
    grid-column: 1 / -1;
  }
`;
```

- [ ] **Step 4: Write `packages/api-components/src/components/patient-form/patient-form.ts`**

```ts
import { button, CharmElement, input, select } from '@powered-by-zocdoc/primitives';
import { property, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import type { Patient } from '../../client/types.js';
import styles from './patient-form.styles.js';

const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'date_of_birth',
  'sex_at_birth',
  'phone_number',
  'email_address',
  'address1',
  'city',
  'state',
  'zip_code',
] as const;

const FIELD_LABELS: Record<string, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  date_of_birth: 'Date of birth',
  sex_at_birth: 'Sex at birth',
  phone_number: 'Phone number',
  email_address: 'Email address',
  address1: 'Street address',
  city: 'City',
  state: 'State',
  zip_code: 'ZIP code',
};

/**
 * Collects the patient demographics POST /v1/appointments requires, validates
 * them, and emits them. It never performs a network request.
 *
 * PHI: never log these values and never include them in an error message.
 *
 * @event patient-submit - Emitted with `{ patient, notes }` once valid.
 */
export default class PatientForm extends CharmElement {
  public static override baseName = 'patient-form';
  public static override styles = [CharmElement.styles, styles];

  public static override get dependencies(): (typeof CharmElement)[] {
    return [
      input,
      select,
      button,
    ];
  }

  /** Current field values, keyed by API field name. */
  @property({ attribute: false })
  public values: Record<string, string> = {};

  @property({ type: String })
  public notes = '';

  @state()
  private errors: string[] = [];

  /** Validates and, if valid, emits `patient-submit`. */
  public submit(): void {
    const errors: string[] = [];

    for (const field of REQUIRED_FIELDS) {
      if (!this.values[field]) {
        errors.push(`${FIELD_LABELS[field]} is required.`);
      }
    }

    if (this.values.phone_number && !/^\d{10}$/.test(this.values.phone_number)) {
      errors.push('Phone number must be 10 digits with no spaces or dashes.');
    }

    if (this.values.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(this.values.date_of_birth)) {
      errors.push('Date of birth must use the YYYY-MM-DD format.');
    }

    this.errors = errors;
    if (errors.length > 0) return;

    const patient: Patient = {
      first_name: this.values.first_name!,
      last_name: this.values.last_name!,
      date_of_birth: this.values.date_of_birth!,
      sex_at_birth: this.values.sex_at_birth as Patient['sex_at_birth'],
      phone_number: this.values.phone_number!,
      email_address: this.values.email_address!,
      patient_address: {
        address1: this.values.address1!,
        city: this.values.city!,
        state: this.values.state!,
        zip_code: this.values.zip_code!,
      },
    };

    this.emit('patient-submit', { detail: { patient, notes: this.notes || undefined } });
  }

  #setField(field: string, value: string): void {
    this.values = { ...this.values, [field]: value };
  }

  #renderField(field: string): unknown {
    return html`
      <${this.scope.tag('input')}
        part=${field}
        label=${FIELD_LABELS[field] ?? field}
        .value=${this.values[field] ?? ''}
        @change=${(event: Event) => this.#setField(field, (event.target as HTMLInputElement).value)}
      ></${this.scope.tag('input')}>
    `;
  }

  protected override render(): unknown {
    return html`
      <form
        part="form"
        @submit=${(event: Event) => {
          event.preventDefault();
          this.submit();
        }}
      >
        ${REQUIRED_FIELDS.filter(field => field !== 'sex_at_birth').map(field => this.#renderField(field))}

        <${this.scope.tag('select')}
          part="sex_at_birth"
          label="Sex at birth"
          .value=${this.values.sex_at_birth ?? ''}
          @change=${(event: Event) => this.#setField('sex_at_birth', (event.target as HTMLSelectElement).value)}
        >
          <option value="">Select…</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </${this.scope.tag('select')}>

        <${this.scope.tag('input')}
          part="notes"
          label="Notes (optional)"
          maxlength="100"
          .value=${this.notes}
          @change=${(event: Event) => {
            this.notes = (event.target as HTMLInputElement).value;
          }}
        ></${this.scope.tag('input')}>

        ${this.errors.length > 0
          ? html`<ul part="errors" role="alert">
              ${this.errors.map(message => html`<li>${message}</li>`)}
            </ul>`
          : ''}

        <${this.scope.tag('button')} part="submit" type="submit" variant="primary">
          Continue
        </${this.scope.tag('button')}>
      </form>
    `;
  }
}
```

Error messages name the field, never the value — that is the PHI rule in practice.

- [ ] **Step 5: Write `packages/api-components/src/components/patient-form/index.ts`**

```ts
import { project } from '@powered-by-zocdoc/primitives';
import patientForm from './patient-form.js';

export * from './patient-form.js';
export { default } from './patient-form.js';

project.scope.registerComponent(patientForm);
```

- [ ] **Step 6: Run and confirm the tests pass**

Run: `pnpm test:components`
Expected: PASS, 4 new tests.

- [ ] **Step 7: Export and stage**

Append to `packages/api-components/src/index.ts`:

```ts
export { default as PatientForm } from './components/patient-form/index.js';
```

```bash
git add packages/api-components/src
```

---

### Task 14: `zd-booking-confirmation`

**Files:**
- Create: `packages/api-components/src/components/booking-confirmation/booking-confirmation.ts`, `.../index.ts`
- Test: `packages/api-components/src/components/booking-confirmation/booking-confirmation.browser.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `<zd-booking-confirmation>` with attributes `appointment-id`, `start-time`, `provider-name`

- [ ] **Step 1: Write the failing test**

`packages/api-components/src/components/booking-confirmation/booking-confirmation.browser.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mount } from '../../test/mount.js';
import './index.js';

describe('zd-booking-confirmation', () => {
  it('shows the appointment id', async () => {
    const el = await mount('<zd-booking-confirmation appointment-id="ap_1"></zd-booking-confirmation>');
    expect(el.shadowRoot!.textContent).toContain('ap_1');
  });

  it('renders nothing without an appointment id', async () => {
    const el = await mount('<zd-booking-confirmation></zd-booking-confirmation>');
    expect(el.shadowRoot!.textContent?.trim()).toBe('');
  });

  it('exposes the confirmation as a live region', async () => {
    const el = await mount('<zd-booking-confirmation appointment-id="ap_1"></zd-booking-confirmation>');
    expect(el.shadowRoot!.querySelector('[part="confirmation"]')?.getAttribute('role')).toBe('status');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:components`
Expected: FAIL — cannot resolve `./index.js`.

- [ ] **Step 3: Write `packages/api-components/src/components/booking-confirmation/booking-confirmation.ts`**

```ts
import { alert, CharmElement } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';

/**
 * Renders the result of a successful booking. Presentational only.
 */
export default class BookingConfirmation extends CharmElement {
  public static override baseName = 'booking-confirmation';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [alert];
  }

  @property({ type: String, attribute: 'appointment-id' })
  public appointmentId?: string;

  @property({ type: String, attribute: 'start-time' })
  public startTime?: string;

  @property({ type: String, attribute: 'provider-name' })
  public providerName?: string;

  protected override render(): unknown {
    if (!this.appointmentId) return nothing;

    return html`
      <${this.scope.tag('alert')} part="confirmation" role="status" variant="success" open>
        <strong>Appointment confirmed.</strong>
        ${this.providerName ? html`<div>With ${this.providerName}</div>` : ''}
        ${this.startTime ? html`<div>${new Date(this.startTime).toLocaleString()}</div>` : ''}
        <div>Confirmation: ${this.appointmentId}</div>
      </${this.scope.tag('alert')}>
    `;
  }
}
```

- [ ] **Step 4: Write `packages/api-components/src/components/booking-confirmation/index.ts`**

```ts
import { project } from '@powered-by-zocdoc/primitives';
import bookingConfirmation from './booking-confirmation.js';

export * from './booking-confirmation.js';
export { default } from './booking-confirmation.js';

project.scope.registerComponent(bookingConfirmation);
```

- [ ] **Step 5: Run and confirm the tests pass**

Run: `pnpm test:components`
Expected: PASS, 3 new tests.

- [ ] **Step 6: Export and stage**

Append to `packages/api-components/src/index.ts`:

```ts
export { default as BookingConfirmation } from './components/booking-confirmation/index.js';
```

```bash
git add packages/api-components/src
```

---

### Task 15: `zd-booking-flow` coordinator

Holds flow state, renders the five children with direct property bindings, and owns the single write call.

**Files:**
- Create: `packages/api-components/src/components/booking-flow/booking-flow.ts`, `.../index.ts`, `.../booking-flow.styles.ts`
- Test: `packages/api-components/src/components/booking-flow/booking-flow.browser.test.ts`

**Interfaces:**
- Consumes: all five components (Tasks 10–14), `createAppointment` (Task 8)
- Produces: `<zd-booking-flow>` with attributes `zip-code`, `visit-reason-id`, `insurance-plan-id`, `patient-type`; emits `booking-complete` with `detail: { appointmentId: string }` and `error` with `detail: { error: unknown }`

- [ ] **Step 1: Write the failing test**

`packages/api-components/src/components/booking-flow/booking-flow.browser.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as appointments from '../../client/appointments.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

type FlowEl = HTMLElement & {
  providerLocationId?: string;
  startTime?: string;
};

const TEST_PATIENT = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female' as const,
  phone_number: '5551234567',
  email_address: 'test@example.test',
  patient_address: { address1: '1 Test St', city: 'Brooklyn', state: 'NY', zip_code: '11201' },
};

describe('zd-booking-flow', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'createAppointment').mockResolvedValue({ appointment_id: 'ap_1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the search step first', async () => {
    const el = await mount<FlowEl>('<zd-booking-flow zip-code="11201"></zd-booking-flow>');
    expect(el.shadowRoot!.querySelector('zd-provider-search')).not.toBeNull();
  });

  it('passes the selected provider down to the availability picker', async () => {
    const el = await mount<FlowEl>('<zd-booking-flow visit-reason-id="vr_1"></zd-booking-flow>');

    el.shadowRoot!.querySelector('zd-provider-results')!.dispatchEvent(
      new CustomEvent('provider-select', {
        bubbles: true,
        composed: true,
        detail: { provider: { provider_location_id: 'pr_a|lo_a', provider_name: 'Dr. A' } },
      })
    );
    await settled(el);

    const picker = el.shadowRoot!.querySelector('zd-availability-picker') as HTMLElement & {
      providerLocationId?: string;
    };
    expect(picker.providerLocationId).toBe('pr_a|lo_a');
  });

  it('books the appointment and emits booking-complete', async () => {
    const el = await mount<FlowEl>('<zd-booking-flow visit-reason-id="vr_1"></zd-booking-flow>');
    el.providerLocationId = 'pr_a|lo_a';
    el.startTime = '2026-08-05T14:00:00-04:00';
    await settled(el);

    const events: CustomEvent[] = [];
    el.addEventListener('booking-complete', event => events.push(event as CustomEvent));

    el.shadowRoot!.querySelector('zd-patient-form')!.dispatchEvent(
      new CustomEvent('patient-submit', {
        bubbles: true,
        composed: true,
        detail: { patient: TEST_PATIENT },
      })
    );

    await vi.waitFor(() => expect(events).toHaveLength(1));
    expect(events[0]!.detail.appointmentId).toBe('ap_1');
    expect(appointments.createAppointment).toHaveBeenCalledTimes(1);
  });

  it('emits error and does not emit booking-complete when the POST fails', async () => {
    vi.mocked(appointments.createAppointment).mockRejectedValue(new Error('boom'));

    const el = await mount<FlowEl>('<zd-booking-flow visit-reason-id="vr_1"></zd-booking-flow>');
    el.providerLocationId = 'pr_a|lo_a';
    el.startTime = '2026-08-05T14:00:00-04:00';
    await settled(el);

    const completed: CustomEvent[] = [];
    const errors: CustomEvent[] = [];
    el.addEventListener('booking-complete', event => completed.push(event as CustomEvent));
    el.addEventListener('error', event => errors.push(event as CustomEvent));

    el.shadowRoot!.querySelector('zd-patient-form')!.dispatchEvent(
      new CustomEvent('patient-submit', {
        bubbles: true,
        composed: true,
        detail: { patient: TEST_PATIENT },
      })
    );

    await vi.waitFor(() => expect(errors).toHaveLength(1));
    expect(completed).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm test:components`
Expected: FAIL — cannot resolve `./index.js`.

- [ ] **Step 3: Write `packages/api-components/src/components/booking-flow/booking-flow.styles.ts`**

```ts
import { css } from 'lit';

export default css`
  :host {
    display: grid;
    gap: 1.5rem;
  }
`;
```

- [ ] **Step 4: Write `packages/api-components/src/components/booking-flow/booking-flow.ts`**

```ts
import { CharmElement } from '@powered-by-zocdoc/primitives';
import { property, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { createAppointment } from '../../client/appointments.js';
import type { PatientType, Patient, ProviderLocation } from '../../client/types.js';
import availabilityPicker from '../availability-picker/availability-picker.js';
import bookingConfirmation from '../booking-confirmation/booking-confirmation.js';
import patientForm from '../patient-form/patient-form.js';
import providerResults from '../provider-results/provider-results.js';
import providerSearch from '../provider-search/provider-search.js';
import styles from './booking-flow.styles.js';

/**
 * Coordinates the booking funnel. Holds flow state and renders the five child
 * components with direct property bindings — no context, no child discovery.
 * Owns the only write call in the library.
 *
 * @event booking-complete - Emitted with `{ appointmentId }`.
 * @event error - Emitted with `{ error }` when booking fails.
 */
export default class BookingFlow extends CharmElement {
  public static override baseName = 'booking-flow';
  public static override styles = [CharmElement.styles, styles];

  public static override get dependencies(): (typeof CharmElement)[] {
    return [providerSearch, providerResults, availabilityPicker, patientForm, bookingConfirmation];
  }

  @property({ type: String, attribute: 'zip-code' })
  public zipCode = '';

  @property({ type: String, attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ type: String, attribute: 'insurance-plan-id' })
  public insurancePlanId?: string;

  @property({ type: String, attribute: 'patient-type' })
  public patientType: PatientType = 'new';

  @state()
  public providers: ProviderLocation[] = [];

  @state()
  public providerLocationId?: string;

  @state()
  public startTime?: string;

  @state()
  private providerName?: string;

  @state()
  private appointmentId?: string;

  async #book(patient: Patient, notes?: string): Promise<void> {
    if (!this.providerLocationId || !this.visitReasonId || !this.startTime) return;

    try {
      const result = await createAppointment({
        providerLocationId: this.providerLocationId,
        visitReasonId: this.visitReasonId,
        startTime: this.startTime,
        patientType: this.patientType,
        patient,
        notes,
      });

      this.appointmentId = result.appointment_id;
      this.emit('booking-complete', { detail: { appointmentId: result.appointment_id } });
    } catch (error: unknown) {
      // The patient object is deliberately not included in this event.
      this.emit('error', { detail: { error } });
    }
  }

  protected override render(): unknown {
    return html`
      <${this.scope.tag('provider-search')}
        zip-code=${this.zipCode}
        visit-reason-id=${this.visitReasonId ?? ''}
        insurance-plan-id=${this.insurancePlanId ?? ''}
        @provider-results=${(event: CustomEvent) => {
          this.providers = event.detail.providers;
        }}
      ></${this.scope.tag('provider-search')}>

      <${this.scope.tag('provider-results')}
        .providers=${this.providers}
        selected-id=${this.providerLocationId ?? ''}
        @provider-select=${(event: CustomEvent) => {
          this.providerLocationId = event.detail.provider.provider_location_id;
          this.providerName = event.detail.provider.provider_name;
        }}
      ></${this.scope.tag('provider-results')}>

      <${this.scope.tag('availability-picker')}
        .providerLocationId=${this.providerLocationId}
        .visitReasonId=${this.visitReasonId}
        .patientType=${this.patientType}
        @slot-select=${(event: CustomEvent) => {
          this.startTime = event.detail.startTime;
        }}
      ></${this.scope.tag('availability-picker')}>

      <${this.scope.tag('patient-form')}
        @patient-submit=${(event: CustomEvent) => void this.#book(event.detail.patient, event.detail.notes)}
      ></${this.scope.tag('patient-form')}>

      <${this.scope.tag('booking-confirmation')}
        appointment-id=${this.appointmentId ?? ''}
        start-time=${this.startTime ?? ''}
        provider-name=${this.providerName ?? ''}
      ></${this.scope.tag('booking-confirmation')}>
    `;
  }
}
```

- [ ] **Step 5: Write `packages/api-components/src/components/booking-flow/index.ts`**

```ts
import { project } from '@powered-by-zocdoc/primitives';
import bookingFlow from './booking-flow.js';

export * from './booking-flow.js';
export { default } from './booking-flow.js';

project.scope.registerComponent(bookingFlow);
```

- [ ] **Step 6: Run and confirm the tests pass**

Run: `pnpm test:components`
Expected: PASS, 4 new tests.

- [ ] **Step 7: Run the whole suite**

Run: `pnpm test && pnpm typecheck`
Expected: both pass.

- [ ] **Step 8: Export and stage**

Append to `packages/api-components/src/index.ts`:

```ts
export { default as BookingFlow } from './components/booking-flow/index.js';
```

```bash
git add packages/api-components/src
```

---

### Task 16: Storybook

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.ts`, `custom-elements-manifest.config.mjs`, `packages/primitives/src/charm.stories.ts`, and a `*.stories.ts` beside each of the six components in `packages/api-components/src/components/`
- Modify: root `package.json` (add the `analyze` script), `.gitignore` (ignore the generated manifest)

**Interfaces:**
- Consumes: everything built so far
- Produces: `pnpm storybook` on port 6006; `pnpm analyze` producing `custom-elements.json`

- [ ] **Step 1: Install Storybook dependencies**

```bash
pnpm add -Dw storybook@^10.1.5 @storybook/web-components-vite@^10.1.5 \
  @storybook/addon-docs@^10.1.5 @storybook/addon-a11y@^10.1.5 @storybook/addon-themes@^10.1.5 \
  @custom-elements-manifest/analyzer@^0.10.4 @wc-toolkit/storybook-helpers@^1.1.0
```

- [ ] **Step 2: Generate the custom elements manifest**

Controls come from JSDoc via the manifest, so it has to exist before Storybook is useful.

`custom-elements-manifest.config.mjs`:

```js
export default {
  globs: ['packages/api-components/src/components/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.browser.test.ts', '**/*.stories.ts', '**/*.styles.ts'],
  outdir: '.',
  litelement: true,
};
```

Add to root `package.json` scripts:

```json
"analyze": "cem analyze --config custom-elements-manifest.config.mjs"
```

Add to `.gitignore`:

```
custom-elements.json
```

Run: `pnpm analyze`
Expected: `custom-elements.json` is written and contains an entry for each `zd-*` component with its properties and the `@event` tags from their JSDoc.

- [ ] **Step 3: Create `.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../packages/{primitives,api-components}/src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/web-components-vite', options: {} },
};

export default config;
```

- [ ] **Step 4: Create `.storybook/preview.ts`**

```ts
import { configureZocdoc } from '@powered-by-zocdoc/api-components';
// Registers the zd prefix. Must be imported before any component module.
import { zocdocThemeCss } from '@powered-by-zocdoc/primitives';
import type { Preview } from '@storybook/web-components-vite';
import { setWcStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import manifest from '../custom-elements.json';

setWcStorybookHelpersConfig({ manifest, typeRef: 'expandedType' });

const style = document.createElement('style');
style.textContent = zocdocThemeCss;
document.head.append(style);

const token = import.meta.env.VITE_ZOCDOC_TOKEN as string | undefined;

if (token) {
  configureZocdoc({
    baseUrl: (import.meta.env.VITE_ZOCDOC_BASE_URL as string) ?? 'https://api-developer-sandbox.zocdoc.com',
    getToken: token,
  });
} else {
  console.warn('VITE_ZOCDOC_TOKEN is not set — stories that call the API will show their error state.');
}

const preview: Preview = {
  parameters: { controls: { expanded: true } },
};

export default preview;
```

`setWcStorybookHelpersConfig`'s exact signature varies by version — if it rejects these options, check the installed package's types. The goal is that controls generate from the manifest's JSDoc, not that this call looks a particular way.

- [ ] **Step 5: Create `packages/primitives/src/charm.stories.ts`**

```ts
import { html } from 'lit';
import { alert, button, input, project } from './index.js';

// Stories render bare tags rather than composing a host component, so nothing
// declares these in dependencies() and nothing would otherwise register them.
// Registering here is safe: importing './index.js' has already run configure.js,
// so the prefix is set.
for (const primitive of [button, input, alert]) {
  project.scope.registerComponent(primitive);
}

export default { title: 'Primitives/Charm' };

export const Button = () => html`
  <zd-button variant="primary">Primary</zd-button>
  <zd-button>Default</zd-button>
`;

export const Input = () => html`<zd-input label="ZIP code" value="11201"></zd-input>`;

export const Alert = () => html`<zd-alert variant="danger" open>Something went wrong.</zd-alert>`;
```

- [ ] **Step 6: Create `packages/api-components/src/components/provider-results/provider-results.stories.ts`**

```ts
import { html } from 'lit';
import './index.js';

export default { title: 'Booking/Provider Results' };

const PROVIDERS = [
  { provider_location_id: 'pr_a|lo_a', provider_name: 'Dr. Ada Lovelace', specialty: 'Dermatologist' },
  { provider_location_id: 'pr_b|lo_b', provider_name: 'Dr. Grace Hopper', specialty: 'Dermatologist' },
];

export const WithResults = () => html`<zd-provider-results .providers=${PROVIDERS}></zd-provider-results>`;

export const Empty = () => html`<zd-provider-results .providers=${[]}></zd-provider-results>`;
```

Provider names here are historical figures, not real Zocdoc providers, and there is no patient data in any story.

- [ ] **Step 7: Create `packages/api-components/src/components/booking-flow/booking-flow.stories.ts`**

```ts
import { html } from 'lit';
import './index.js';

export default { title: 'Booking/Booking Flow' };

/** Hits the live sandbox. Requires VITE_ZOCDOC_TOKEN in .env.local. */
export const LiveSandbox = () => html`<zd-booking-flow zip-code="11201"></zd-booking-flow>`;

/** Documented sandbox zip that returns no results. */
export const NoResults = () => html`<zd-booking-flow zip-code="99734"></zd-booking-flow>`;

/** Documented sandbox zip that returns a 500. */
export const ServerError = () => html`<zd-booking-flow zip-code="10112"></zd-booking-flow>`;
```

- [ ] **Step 8: Create stories for the remaining four components**

Success criterion 3 is that every component is inspectable in Storybook, not just the two above.

`packages/api-components/src/components/provider-search/provider-search.stories.ts`:

```ts
import { html } from 'lit';
import './index.js';

export default { title: 'Booking/Provider Search' };

/** Hits the live sandbox for the visit-reason and insurance selects. */
export const Default = () => html`<zd-provider-search zip-code="11201"></zd-provider-search>`;
```

`packages/api-components/src/components/availability-picker/availability-picker.stories.ts`. Fill in the ids from `docs/api-contract-notes.md` — they are real sandbox values recorded in Task 2, not placeholders:

```ts
import { html } from 'lit';
import './index.js';

export default { title: 'Booking/Availability Picker' };

const PROVIDER_LOCATION_ID = 'pr_example|lo_example'; // replace from docs/api-contract-notes.md
const VISIT_REASON_ID = 'vr_example'; // replace from docs/api-contract-notes.md

export const Default = () => html`
  <zd-availability-picker
    provider-location-id=${PROVIDER_LOCATION_ID}
    visit-reason-id=${VISIT_REASON_ID}
  ></zd-availability-picker>
`;

/** The documented sandbox id that returns a 500. */
export const ServerError = () => html`
  <zd-availability-picker
    provider-location-id="pr_error|lo_error"
    visit-reason-id=${VISIT_REASON_ID}
  ></zd-availability-picker>
`;
```

`packages/api-components/src/components/patient-form/patient-form.stories.ts`:

```ts
import { html } from 'lit';
import './index.js';

export default { title: 'Booking/Patient Form' };

/** Empty by design — no patient data appears in any story. */
export const Empty = () => html`<zd-patient-form></zd-patient-form>`;
```

`packages/api-components/src/components/booking-confirmation/booking-confirmation.stories.ts`:

```ts
import { html } from 'lit';
import './index.js';

export default { title: 'Booking/Booking Confirmation' };

export const Confirmed = () => html`
  <zd-booking-confirmation
    appointment-id="ap_example"
    provider-name="Dr. Ada Lovelace"
    start-time="2026-08-05T14:00:00-04:00"
  ></zd-booking-confirmation>
`;

export const NothingBookedYet = () => html`<zd-booking-confirmation></zd-booking-confirmation>`;
```

- [ ] **Step 9: Run Storybook and verify**

Run: `pnpm storybook`

Check, in a browser at `http://localhost:6006`:
- Primitives render with `zd-` tags and themed tokens.
- `Booking/Provider Results → Empty` shows the empty state.
- `Booking/Booking Flow → ServerError` shows the error alert with a retry button.
- The controls panel lists each component's documented properties and events, sourced from the manifest.
- All six `zd-*` components appear under `Booking/` and render.
- The a11y addon reports no violations on the provider results story.

- [ ] **Step 10: Stage**

```bash
git add .storybook custom-elements-manifest.config.mjs .gitignore \
  packages/primitives/src/charm.stories.ts packages/api-components/src/components/*/*.stories.ts \
  package.json pnpm-lock.yaml
```

---

### Task 17: Demo site

**Files:**
- Create: `packages/demo/package.json`, `packages/demo/vite.config.ts`, `packages/demo/index.html`, `packages/demo/composed.html`, `packages/demo/src/main.ts`, `packages/demo/src/composed.ts`

**Interfaces:**
- Consumes: `@powered-by-zocdoc/api-components`, `@powered-by-zocdoc/primitives`
- Produces: `pnpm demo` serving both pages

- [ ] **Step 1: Create `packages/demo/package.json`**

```json
{
  "name": "demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@powered-by-zocdoc/api-components": "workspace:*",
    "@powered-by-zocdoc/primitives": "workspace:*"
  },
  "devDependencies": {
    "vite": "^7.1.5"
  }
}
```

Match the root's Vite major. Two Vite versions in one workspace means two dev servers
with different module graphs resolving the same `link:`ed Charm source.

- [ ] **Step 2: Create `packages/demo/vite.config.ts`**

```ts
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Loads .env.local from the workspace root so there is one token file.
  envDir: resolve(import.meta.dirname, '../..'),
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        composed: resolve(import.meta.dirname, 'composed.html'),
      },
    },
  },
});
```

- [ ] **Step 3: Create `packages/demo/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Powered by Zocdoc — single element</title>
  </head>
  <body>
    <h1>One tag</h1>
    <p>The entire booking funnel from a single custom element.</p>
    <zd-booking-flow zip-code="11201"></zd-booking-flow>
    <p><a href="/composed.html">See the composed version</a></p>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `packages/demo/src/main.ts`**

```ts
import { configureZocdoc } from '@powered-by-zocdoc/api-components';
import '@powered-by-zocdoc/api-components';
import { zocdocThemeCss } from '@powered-by-zocdoc/primitives';

const style = document.createElement('style');
style.textContent = zocdocThemeCss;
document.head.append(style);

configureZocdoc({
  baseUrl: import.meta.env.VITE_ZOCDOC_BASE_URL ?? 'https://api-developer-sandbox.zocdoc.com',
  getToken: () => {
    const token = import.meta.env.VITE_ZOCDOC_TOKEN;
    if (!token) throw new Error('VITE_ZOCDOC_TOKEN is not set. Copy .env.local.example to .env.local.');
    return token;
  },
});
```

- [ ] **Step 5: Create `packages/demo/composed.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Powered by Zocdoc — composed</title>
  </head>
  <body>
    <h1>Composed by hand</h1>
    <p>The same five components, wired with events by the host page.</p>

    <zd-provider-search id="search" zip-code="11201"></zd-provider-search>
    <zd-provider-results id="results"></zd-provider-results>
    <zd-availability-picker id="picker"></zd-availability-picker>
    <zd-patient-form id="form"></zd-patient-form>
    <zd-booking-confirmation id="confirmation"></zd-booking-confirmation>

    <script type="module" src="/src/composed.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `packages/demo/src/composed.ts`**

```ts
import { createAppointment } from '@powered-by-zocdoc/api-components';
import './main.js';

const search = document.querySelector('#search') as HTMLElement & { visitReasonId?: string };
const results = document.querySelector('#results') as HTMLElement & { providers: unknown[] };
const picker = document.querySelector('#picker') as HTMLElement & {
  providerLocationId?: string;
  visitReasonId?: string;
};
const confirmation = document.querySelector('#confirmation') as HTMLElement & { appointmentId?: string };

let providerLocationId: string | undefined;
let startTime: string | undefined;

// The search component owns the visit-reason select. Mirroring its choice onto
// the picker is exactly the wiring zd-booking-flow does for you.
search.addEventListener('change', () => {
  picker.visitReasonId = search.visitReasonId;
});

search.addEventListener('provider-results', event => {
  results.providers = (event as CustomEvent).detail.providers;
});

results.addEventListener('provider-select', event => {
  providerLocationId = (event as CustomEvent).detail.provider.provider_location_id;
  picker.providerLocationId = providerLocationId;
});

picker.addEventListener('slot-select', event => {
  startTime = (event as CustomEvent).detail.startTime;
});

document.querySelector('#form')!.addEventListener('patient-submit', event => {
  if (!providerLocationId || !startTime || !picker.visitReasonId) return;

  void createAppointment({
    providerLocationId,
    visitReasonId: picker.visitReasonId,
    startTime,
    patientType: 'new',
    patient: (event as CustomEvent).detail.patient,
  }).then(result => {
    confirmation.appointmentId = result.appointment_id;
  });
});
```

Pick a reason for visit in the search form before booking — unlike `zd-booking-flow`, nothing here supplies a default.

- [ ] **Step 7: Run and verify both pages end to end**

Run: `pnpm demo`

At `http://localhost:5173/`:
- Search returns providers for zip `11201`.
- Selecting a provider loads availability.
- Selecting a slot, filling the form, and submitting produces a confirmation id.

At `http://localhost:5173/composed.html`, confirm the same flow works with the hand-wired version. This is what proves the standalone story.

- [ ] **Step 8: Full verification**

Run: `pnpm test && pnpm typecheck`
Expected: both pass.

- [ ] **Step 9: Stage**

```bash
git add packages/demo
```

Report everything staged across all tasks. Do not commit — Burton commits.

---

## Known follow-ups

Deliberately deferred, recorded so they are not mistaken for oversights:

- Real Zocdoc brand values replacing the placeholder palette in `packages/primitives/src/tokens.ts`.
- A per-element `.config` property for multi-tenant pages. `request()` already accepts a `config` override, so this is plumbing a property through each component — deferred because a PoC has one tenant.
- Context-protocol auto-wiring so slotted custom composition works without host wiring.
- Cancel and reschedule flows; provider scheduling; insurance management; webhooks.
- Reversing the no-build-step decision (to `tsc` project references with `dist`) if these packages are ever published.
- A calendar and combobox primitive, if the day-strip and select prove insufficient.
