# Powered by Zocdoc — Agent Instructions

Framework-agnostic web components for the [Zocdoc public API](https://api-docs.zocdoc.com/guides), built on [Charm UX](https://github.com/charm-ux/core). This is a proof of concept demonstrating browser-direct API calls through custom elements.

## Workspace Structure

```
packages/
  primitives/    @powered-by-zocdoc/primitives   Charm config + token re-exports
  api-components/@powered-by-zocdoc/api-components   API client + booking components
  demo/          private                         Vite demo site
```

Dependency direction is one-way: `primitives` ← `api-components` ← `demo`.

## Critical Rules

These rules are always loaded. Full details and examples are in [`.agents/rules/`](.agents/rules/README.md).

### PBZD — Internal Architecture

| Rule | Summary |
|------|---------|
| [PBZD-001](.agents/rules/internal/PBZD-001.md) | **Configure the prefix first, and never import a Charm barrel.** `configure.ts` runs before anything else; Charm primitives come from `@powered-by-zocdoc/primitives` as classes and register via `dependencies()`, not via `.../button/index.js`. |
| [PBZD-002](.agents/rules/internal/PBZD-002.md) | **Extend CharmElement.** API components extend `CharmElement` from `@powered-by-zocdoc/primitives`, not `LitElement` directly. |
| [PBZD-003](.agents/rules/internal/PBZD-003.md) | **Use scope.tag() for tag names.** Templates use `this.scope.tag('button')`, never hardcoded `zd-button`. |
| [PBZD-004](.agents/rules/internal/PBZD-004.md) | **Register through project scope.** Components declare `static override baseName` and register via `project.scope.registerComponent()`. |
| [PBZD-005](.agents/rules/internal/PBZD-005.md) | **Package dependency direction.** Strictly `primitives` ← `api-components` ← `demo`. |

### CLIENT — API Client Patterns

| Rule | Summary |
|------|---------|
| [CLIENT-001](.agents/rules/client/CLIENT-001.md) | **Centralize fetch in http.ts.** Only `client/http.ts` calls `fetch`. Endpoint modules are thin typed wrappers. |
| [CLIENT-002](.agents/rules/client/CLIENT-002.md) | **Token via getToken function.** `getToken` is a function (or string) called per request. Library never mints tokens. |
| [CLIENT-003](.agents/rules/client/CLIENT-003.md) | **Typed error hierarchy.** `ZocdocAuthError` distinct from generic errors. No raw API messages to users. |
| [CLIENT-004](.agents/rules/client/CLIENT-004.md) | **Cache reference data.** Specialties, visit reasons, insurance plans cached in module-level map (cache the Promise). |

### PHI — Protected Health Information

| Rule | Summary |
|------|---------|
| [PHI-001](.agents/rules/phi/PHI-001.md) | **No PHI in logs, errors, or messages.** Patient field values never appear in console, errors, or debug output. |
| [PHI-002](.agents/rules/phi/PHI-002.md) | **Test data from documented scenarios only.** Use `https://api-docs.zocdoc.com/guides/testing-data`. |
| [PHI-003](.agents/rules/phi/PHI-003.md) | **No analytics or third-party calls.** Only outbound destination is the configured Zocdoc `baseUrl`. |

### A11Y — Accessibility

| Rule | Summary |
|------|---------|
| [A11Y-001](.agents/rules/accessibility/A11Y-001.md) | **WCAG 2.2 AA target.** All components must conform; test with axe-core. |
| [A11Y-002](.agents/rules/accessibility/A11Y-002.md) | **Announce state changes.** Loading/error/empty states use `aria-live` regions. |
| [A11Y-003](.agents/rules/accessibility/A11Y-003.md) | **Manage focus in flows.** Move focus to heading or first interactive on step change. |
| [A11Y-004](.agents/rules/accessibility/A11Y-004.md) | **Form accessibility.** Visible labels, error association, fieldsets for groups. |
| [A11Y-005](.agents/rules/accessibility/A11Y-005.md) | **Test with axe-core.** Every component, every state. |

### I18N — Internationalization

| Rule | Summary |
|------|---------|
| [I18N-001](.agents/rules/i18n/I18N-001.md) | **Text in DOM.** Not in attributes — enables browser translation tools. |
| [I18N-002](.agents/rules/i18n/I18N-002.md) | **Intl APIs.** Use `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` for dates/times. |
| [I18N-003](.agents/rules/i18n/I18N-003.md) | **CSS logical properties.** `margin-inline-start`, not `margin-left`. |
| [I18N-004](.agents/rules/i18n/I18N-004.md) | **Don't split text.** Keep translatable phrases in single text nodes. |

## Path-Gated Rules

These rules activate when working on matching files. See `.claude/rules/` for the glob patterns.

### COMP — Component Design

| Rule | Summary |
|------|---------|
| [COMP-001](.agents/rules/component-design/COMP-001.md) | **State machine for async.** Every fetching component: `idle | loading | success | empty | error`. |
| [COMP-002](.agents/rules/component-design/COMP-002.md) | **Props in, events out.** No context protocol, no shared state container. |
| [COMP-003](.agents/rules/component-design/COMP-003.md) | **Emit through base helper.** Use `this.emit()`, never `dispatchEvent(new CustomEvent(...))`. |
| [COMP-004](.agents/rules/component-design/COMP-004.md) | **Standalone-capable children.** Every child works without its parent. |

### STYLE — Style Authoring

| Rule | Summary |
|------|---------|
| [STYLE-001](.agents/rules/styles/STYLE-001.md) | **Prefer CSS nesting.** Nest states, inner parts, and scoped queries under their parent with `&` instead of repeating the selector chain. |

### TEST — Testing

| Rule | Summary |
|------|---------|
| [TEST-001](.agents/rules/testing/TEST-001.md) | **Two Vitest projects.** `client` in node (mock fetch), `components` in browser (mock client layer). |
| [TEST-002](.agents/rules/testing/TEST-002.md) | **Mock client layer, not network.** Component tests mock endpoint functions, not `fetch`. |
| [TEST-003](.agents/rules/testing/TEST-003.md) | **Documented test scenarios.** Use ZIP codes and patient data from Zocdoc testing guide. |

## Reference

### ADR — Architecture Decision Records

When making architectural decisions, follow [ADR-001](.agents/rules/adr/ADR-001.md) for when to write an ADR and [ADR-002](.agents/rules/adr/ADR-002.md) for format. ADRs live in `docs/adr/`.

### Design Spec

The full design specification is at [`docs/superpowers/specs/2026-07-31-powered-by-zocdoc-web-components-design.md`](docs/superpowers/specs/2026-07-31-powered-by-zocdoc-web-components-design.md).

### Component Events

Every detail below is an exported type, and every component types its own `addEventListener`, so
`event.detail` is inferred from the element the listener is on — a host page never describes these
shapes itself. `emit` is typed the same way, which is what stops a component's event map from
drifting from what it emits. See `components/events.ts`.

| Component | Event | Detail |
|-----------|-------|--------|
| `zd-provider-search` | `provider-results` | `ProviderResultsDetail` — `{ providers, totalCount, page, pageSize, searchParameters, …criteria }` |
| `zd-provider-search` | `provider-search-error` | `ErrorDetail` |
| `zd-provider-results` | `provider-select` | `ProviderSelectDetail` — `{ provider: ProviderLocation }` |
| `zd-provider-results` | `page-change` | `PageChangeDetail` — `{ page: number }` |
| `zd-provider-results` | `day-select` | `ProviderDaySelectDetail` — `{ day: string, provider: ProviderLocation }` |
| `zd-provider-results` | `window-change` | `AvailabilityWindowDetail` — `{ startDate: string, endDate: string }` |
| `zd-availability-grid` | `day-select` | `DaySelectDetail` — `{ day: string, providerLocationId?: string }` |
| `zd-availability-grid` | `window-change` | `AvailabilityWindowDetail` |
| `zd-availability-grid` | `more-select` | — (an empty detail) |
| `zd-availability-grid` | `availability-error` | `ErrorDetail` |
| `zd-availability-picker` | `slot-select` | `SlotSelectDetail` — `{ startTime: string, providerLocationId: string }` |
| `zd-availability-picker` | `patient-type-change` | `PatientTypeChangeDetail` — `{ patientType: 'new' \| 'existing' }` |
| `zd-availability-picker` | `availability-error` | `ErrorDetail` |
| `zd-patient-form` | `patient-submit` | `PatientSubmitDetail` — `{ patient: Patient, notes?: string }`. **The one detail carrying PHI:** pass it to `createAppointment` and nowhere else (PHI-001, PHI-003). |
| `zd-booking-flow` | `booking-complete` | `BookingCompleteDetail` — `{ appointmentId: string, status: AppointmentStatus }` |
| `zd-booking-flow` | `booking-error` | `BookingErrorDetail` — `{ error: unknown, status?: AppointmentStatus }` |
| `zd-booking-flow` | `availability-error` | `ErrorDetail` — nothing is rendered for it |

`day-select` and `window-change` are each emitted by two components with different payloads, which
is why these live in per-component event maps rather than a global `HTMLElementEventMap`
augmentation — a global map allows one entry per name. Every `error` payload is developer-facing:
its body can echo request values, so it is never rendered or logged wholesale (CLIENT-003,
PHI-001).

### Tooling

- **`tsc --build` emits declarations and JS to `dist/`,** which is where both packages' `exports` point. `pnpm build:types` is a prerequisite of `test`, `typecheck`, and `storybook`, because a stale `dist` is what makes a cross-package import fail on a change that is already on disk.
- **`@powered-by-zocdoc/api-components` has one extra subpath, `./mock`** — a fake transport and the documented sentinel inputs, for a host page that wants the funnel without a token. Importing `.` pulls in none of it.
- **Storybook** on `@storybook/web-components-vite`, globbing `packages/{primitives,api-components}/src/**/*.stories.ts`.
- **Vitest browser mode** with `@vitest/browser-playwright` for component tests.
- **`pnpm demo`** serves two pages: `/` is `zd-booking-flow` alone, `/composed.html` is the same five components wired by a host page. Both serve fixtures unless `VITE_ZOCDOC_MODE=live` **and** `VITE_ZOCDOC_TOKEN` are set in `.env.local` at the workspace root — a demo that reached the live sandbox by default would post a patient's details the first time anyone clicked through it.
