# Powered by Zocdoc — Standards-Based Web Components

**Date:** 2026-07-31
**Status:** Approved design, ready for implementation planning

## Purpose

A proof of concept demonstrating that framework-agnostic custom elements, built on
[Charm UX](https://github.com/charm-ux/core), can drive the
[Zocdoc public API](https://api-docs.zocdoc.com/guides) end to end. The deliverable is a
working demo of the patient booking funnel — provider search through confirmed appointment —
plus a Storybook that makes each component inspectable in isolation.

This is exploratory. It is **not** a published package, not a supported product, and carries
no semver commitments. Release infrastructure (changesets, npm publishing, browser support
matrices) is deliberately out of scope.

### Success criteria

1. A single `<zd-booking-flow>` tag on a plain HTML page books a real sandbox appointment.
2. The same five child components, used standalone and wired by hand, do the same thing.
3. Every component renders in Storybook against the live sandbox.
4. `pnpm test` passes: client logic in node, component behavior in a real browser.

## Findings that constrain the design

These were verified during design, not assumed. Each one changed a decision.

### Browser-direct API calls work

The sandbox returns permissive CORS headers, reflecting an arbitrary origin:

```
$ curl -i -X OPTIONS \
    'https://api-developer-sandbox.zocdoc.com/v1/provider_locations?zip_code=10011' \
    -H 'Origin: http://localhost:6006' \
    -H 'Access-Control-Request-Method: GET' \
    -H 'Access-Control-Request-Headers: authorization'

HTTP/2 200
access-control-allow-origin: http://localhost:6006
access-control-allow-credentials: true
access-control-allow-headers: authorization
access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,TRACE,CONNECT
vary: Origin
```

An unauthenticated `GET` returns `401` *with* the same CORS headers. So components can call the
API directly from the browser and no dev proxy is needed. This removed the largest architectural
risk in the original idea.

### Charm's tag prefix must be set before any component module is imported

`CharmScope.registerComponent()` (`packages/core/src/utilities/scope.ts`) computes the tag name
from `this.prefix` at call time and immediately calls `customElements.define()`. Custom elements
cannot be unregistered.

`project.updateProject()` calls `scope.updateOptions()`, whose `initProperties()` resets
`this.components` to `[]` — so the subsequent re-registration loop replays nothing. The
`registeredComponents` set is only replayed by `setSuffix()`, and only for a new valid suffix.

**Therefore:** any Charm component module imported before the prefix is set is permanently
`ch-`prefixed, and setting the prefix afterward will not correct it. The result would be a
silently half-prefixed library. The `ui` package enforces ordering structurally (see below).

### Charm has no calendar, combobox, or pagination

Confirmed by listing `packages/core/src/components`. The design avoids needing them: the
availability UI is a day strip composed from Charm's existing `tabs`/`button-group`, and
insurance selection uses `select`. No new primitives are built.

### `vitest-lit-browser` is not a package

`npm view vitest-lit-browser` returns 404. The GitHub repo is a 2023 demonstration built against
a pre-release Vitest from PR #3584, requiring locally built tarballs. Its approach — Lit
components rendered into a real browser page, `await el.updateComplete`, assertions on shadow
DOM — has since shipped as stable Vitest browser mode (`vitest` 4.1.10 + `@vitest/browser` +
`@vitest/browser-playwright`). We adopt the approach on the stable stack.
`@charm-ux/theming` already depends on Vitest `^4.1.8`, so this is version-consistent.

### Reference-data paths, resolved

The reference-data guide lists `/specialties`, `/visit-reasons`, and `/insurance-plans` without
the `/v1` prefix that every other documented endpoint carries. Checking the OpenAPI summary at
`https://api-docs.zocdoc.com/apis` shows the real paths are `/v1/specialties`,
`/v1/visit_reasons`, and `/v1/insurance_plans` — the hyphenated forms in the guide are
documentation-link slugs, not routes.

### Provider-search parameter names are still in conflict

The same check surfaced a second discrepancy that the docs do not settle. The OpenAPI summary
lists `/v1/provider_locations` parameters as `zip_code`, `specialty`, `visit_reason`, and
`accepted_insurance`; the booking guide lists `zip_code`, `specialty_id`, `visit_reason_id`,
`insurance_plan_id`, `page`, and `page_size`. **Resolution:** send both spellings against the
live sandbox before writing the client, and encode whichever works in the tests. Do not guess.

## Architecture

### Workspace layout

```
powered-by-zocdoc/
  .storybook/                  single instance, globs ui + api stories
  pnpm-workspace.yaml
  tsconfig.base.json
  vitest.config.ts             two projects: node (client) + browser (components)
  packages/
    tokens/    @powered-by-zocdoc/tokens   design tokens, no lit dependency
    ui/        @powered-by-zocdoc/ui       charm configuration + re-exports
    api/       @powered-by-zocdoc/api      API client + booking components
    demo/      private                     Vite vanilla-TS demo site
```

Dependency direction is strictly one-way: `tokens` ← `ui` ← `api` ← `demo`.

### `@powered-by-zocdoc/tokens`

Extends `@charm-ux/theming`. Calls `defineTokens` / `generateTheme` with prefix `zd`, exporting
both the token definition and the generated CSS. No Lit dependency, so it is consumable by
anything.

Seeded with a **documented placeholder palette**, not real Zocdoc brand values — replacing them
is a single-file change and is explicitly a follow-up, not a blocker.

### `@powered-by-zocdoc/ui`

A thin layer: it configures Charm and re-exports it. It builds no new primitives.

Ordering is enforced by splitting configuration into its own module, because ES module imports
are hoisted and evaluated depth-first in source order:

```ts
// packages/ui/src/configure.ts — side effect only, imports NO component modules
import { project } from '@charm-ux/core';

project.updateProject({ prefix: 'zd', tokenPrefix: 'zd' });
```

```ts
// packages/ui/src/index.ts
import './configure.js';                                  // fully evaluated first
import '@charm-ux/core/components/button/button.js';      // registers as <zd-button>
import '@charm-ux/core/components/input/input.js';
// ...re-export the surface the booking flow needs
```

This is safe because `@charm-ux/core`'s root entry exports only `base`, `controller`, `internal`,
`theme`, and `utilities` — no components — so importing `project` registers nothing.

`api` depends on `ui` and imports it first, which transitively guarantees the same ordering for
our own components.

`ui` also carries Storybook stories for the Charm primitives the booking flow uses, so the themed
`zd`-prefixed versions are inspectable alongside the API components in one Storybook.

Components never hardcode tag names. Following Charm's own convention (see `select.ts`), templates
use static HTML plus the scope helper so the prefix stays configurable:

```ts
import { html } from 'lit/static-html.js';

html`<${this.scope.tag('button')} variant="primary">Book</${this.scope.tag('button')}>`
```

### `@powered-by-zocdoc/api`

```
packages/api/src/
  client/
    configure.ts        global config singleton
    http.ts             the only place fetch appears
    reference-data.ts   specialties, visit reasons, insurance plans (cached)
    provider-locations.ts
    availability.ts
    appointments.ts
    types.ts
  components/
    booking-flow/
    provider-search/
    provider-results/
    availability-picker/
    patient-form/
    booking-confirmation/
```

Every component extends `CharmElement`, declares `static override baseName`, and registers via
`project.scope.registerComponent()` in its `index.ts` — matching Charm's CHARM-002 convention.

## Components

| Element | Endpoint it owns | Emits |
| --- | --- | --- |
| `zd-provider-search` | `GET /v1/provider_locations` | `provider-results` |
| `zd-provider-results` | none — renders what it is given | `provider-select` |
| `zd-availability-picker` | `GET /v1/provider_locations/availability` | `slot-select` |
| `zd-patient-form` | none — collects and validates | `patient-submit` |
| `zd-booking-confirmation` | none — renders the result | none |
| `zd-booking-flow` | `POST /v1/appointments` | `booking-complete`, `error` |

Events go through Charm's base `emit()` helper and are composed by default (PROP-003), so they
cross shadow boundaries.

`zd-availability-picker` renders a day strip composed from Charm's existing `tabs` / `button-group`
rather than a calendar, and `zd-provider-search` uses `select` for insurance and visit reason.
This is what keeps the "no new primitives" constraint achievable.

### Composition model

Attributes and properties in, events out. No context protocol, no shared state container.

`zd-booking-flow` holds flow state — `zipCode`, `visitReasonId`, `insurancePlanId`, `patientType`,
`providerLocationId`, `startTime`, `appointmentId` — and renders the five children in its own
template with direct Lit property bindings:

```ts
render() {
  return html`
    <${this.scope.tag('availability-picker')}
      .providerLocationId=${this.state.providerLocationId}
      .visitReasonId=${this.visitReasonId}
      @slot-select=${this.#onSlotSelect}
    ></${this.scope.tag('availability-picker')}>
  `;
}
```

No child discovery, no protocol. Every child also works standalone — set its properties, listen
for its event — because no child reaches upward for anything.

**Known limitation, accepted:** slotted custom composition does not auto-wire. Reordering steps or
injecting your own markup between them means composing the children yourself and wiring the
events. Adding a context provider later is purely additive — the property and event API does not
change — so this is a deferral, not a dead end.

`zd-booking-flow` owns the write call rather than `zd-patient-form`. This keeps the form a dumb,
independently testable input collector, and means a read-only token is sufficient for every step
except the final POST.

### Booking flow

1. `GET /v1/provider_locations` — `zip_code` plus `specialty_id` or `visit_reason_id`; optional
   `insurance_plan_id`, `visit_type`, `max_distance_to_patient_mi`; paged.
2. `GET /v1/provider_locations/availability` — `provider_location_ids`, `visit_reason_id`,
   `patient_type`, `start_date_in_provider_local_time`, `end_date_in_provider_local_time`
   (within 30 days of start, max 150 days out).
3. `POST /v1/appointments` — `appointment_type: "providers"` and a `data` object carrying
   `start_time` (must match a value from step 2), `visit_reason_id`, `provider_location_id`,
   `patient_type`, the `patient` object, and optional `notes`.
4. Response `appointment_id` renders in `zd-booking-confirmation`.

Only the happy path is in scope. Cancel and reschedule are out.

## Configuration and the client layer

```ts
export interface ZocdocConfig {
  baseUrl: string;
  getToken: string | (() => string | Promise<string>);
}

export function configureZocdoc(config: ZocdocConfig): void;
```

A module-level singleton, with an optional `.config` property on each element for the rare
multi-tenant page.

`getToken` is a function so that a hardcoded sandbox token works today and the *same* components
later work against a backend proxy or a PKCE flow by changing only what that function does. It is
called per request; memoization is the consumer's responsibility, which keeps our side stateless
and lets a 60-minute token refresh happen without our cooperation.

`client/http.ts` is the only module that calls `fetch`. It resolves the token, sets
`Authorization: Bearer` and `Accept`, serializes query parameters (comma-joining array-valued ones
such as `provider_location_ids` and `npis`), and maps non-2xx responses to typed errors.
`ZocdocAuthError` is distinct for 401, because an expired token is the most common failure and
deserves a different message from "no providers found". Endpoint modules are thin typed wrappers
over it.

Reference data is cached in a module-level map — it is stable within a page load and the search UI
needs it to populate selects.

### Security boundary

The published auth guide states that `client_credentials` tokens must not be distributed to
browsers. This design does not distribute them: it takes whatever token `getToken` returns and
never mints one itself.

Any token reachable from `getToken` is readable by anyone with devtools. That is acceptable for
sandbox and testing tokens, which is the scope of this PoC. A production deployment would point
`getToken` at something that mints short-lived tokens server-side, or at the documented
`authorization_code` + PKCE flow. No code change would be required.

Tokens live in a gitignored `.env.local` and are read via `import.meta.env`. No token is ever
committed.

## Error and empty states

Every fetching component runs an explicit `idle | loading | success | empty | error` state and
renders each one:

- **loading** — Charm `skeleton` or `spinner`
- **empty** — a real empty state; "no availability in this range" is a routine outcome, not an error
- **error** — Charm `alert` with a retry action, plus an emitted `error` event so the host page can
  observe failures it did not cause

`zd-patient-form` validates client-side against what `POST /v1/appointments` requires:
`first_name`, `last_name`, `date_of_birth` (YYYY-MM-DD), `sex_at_birth`, `phone_number` (10 digits,
unformatted), `email_address`, and `patient_address` (`address1`, `city`, `state`, `zip_code`).
`notes` is capped at 100 characters via `maxlength`.

`zd-patient-form` extends `CharmElement`, not `CharmFormControlElement`. A form-control element
represents a single value participating in a form; the patient form is a composite of ten fields
that emits one object. It composes Charm's `input` and `select` — which are themselves form
controls — and runs its own validation pass over the collected values.

### PHI handling

`zd-patient-form` collects PHI by definition. These rules are part of the design:

1. No patient field values in `console.log`, error messages, or thrown error bodies.
2. No patient data in committed fixtures, stories, or test files. Tests and stories use the
   documented scenarios from `https://api-docs.zocdoc.com/guides/testing-data`.
3. No telemetry, analytics, or third-party network calls anywhere in these packages. The only
   outbound destination is the configured Zocdoc `baseUrl`.

## Testing

A single `vitest.config.ts` defining two projects:

**`client`** — `environment: 'node'`, `fetch` mocked. Covers query-parameter serialization, error
mapping, the 401 path, reference-data caching, and appointment payload construction. Runs
anywhere, including inside the ZD sandbox.

**`components`** — `@vitest/browser-playwright` on Chromium, real DOM. A mount helper appends the
element to `document.body`; tests `await el.updateComplete` and assert against shadow DOM, with
teardown in `afterEach`. The setup file imports `@powered-by-zocdoc/ui` first so the `zd` prefix is
registered before anything renders. Component tests mock the client layer rather than the network.

The component project drives a real browser, so — consistent with Charm's own AGENTS.md note about
Chromium — that suite runs outside the ZD sandbox.

## Tooling

**Storybook** — one root instance on `@storybook/web-components-vite`, globbing
`packages/{ui,api}/src/**/*.stories.ts`, with the docs, a11y, and themes addons.
`@wc-toolkit/storybook-helpers` is fed by `@custom-elements-manifest/analyzer` output so controls
generate from JSDoc. `preview.ts` imports the token CSS and `ui` (ordering again), then calls
`configureZocdoc` with a token from `.env.local`, so `api` stories exercise the live sandbox.

**No build step.** Because nothing is published, each package's `exports` points at
`./src/index.ts` rather than a built `dist`. Everything downstream — Storybook, the demo, Vitest —
runs on Vite, which transpiles TypeScript directly. This removes `tsc --watch` from the dev loop
and makes HMR work without coordination. `tsc --noEmit` runs as an independent check.

*Exit condition:* if these packages are ever published, this reverses to `tsc` project references
with `exports` pointing at `dist`, since consumers outside a Vite toolchain cannot import raw
TypeScript.

**Demo** — Vite vanilla-TS with two pages: one dropping in `<zd-booking-flow>` alone, one composing
the five components manually and wiring events by hand. The second page is what proves the
standalone usage story actually works.

## Out of scope

- Publishing, changesets, semver, browser support matrix
- Cancel and reschedule flows; provider scheduling; insurance management; webhooks
- New primitives (calendar, combobox, pagination)
- Context-protocol auto-wiring for slotted composition
- Server-side token minting, PKCE implementation, backend proxy
- Real Zocdoc brand token values
- Internationalization beyond what Charm provides
