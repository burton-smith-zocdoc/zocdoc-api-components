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

| Component | Event | Detail |
|-----------|-------|--------|
| `zd-provider-search` | `provider-results` | `{ providers: ProviderLocation[] }` |
| `zd-provider-results` | `provider-select` | `{ provider: ProviderLocation }` |
| `zd-availability-picker` | `slot-select` | `{ slot: TimeSlot }` |
| `zd-patient-form` | `patient-submit` | `{ patient: Patient }` |
| `zd-booking-flow` | `booking-complete` | `{ appointmentId: string }` |
| (any) | `error` | `{ message: string, code: string }` |

### Tooling

- **No build step.** Package `exports` point at `./src/index.ts`. Vite transpiles directly.
- **Storybook** on `@storybook/web-components-vite`, globbing `packages/{primitives,api-components}/src/**/*.stories.ts`.
- **Vitest browser mode** with `@vitest/browser-playwright` for component tests.
