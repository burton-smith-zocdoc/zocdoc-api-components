---
name: api-components
description: Map of @powered-by-zocdoc/api-components - which file to read for what, the shared shape every component follows, and the invariants that look cosmetic but aren't. Use when reading, modifying, or debugging anything in packages/api-components/src/components/.
---

# API Components Reference

Booking components for the Zocdoc public API. Seven public components over a
client layer, sharing one state machine and a folder of internal helpers.

For the layers around this one: `client` (endpoints, errors, caching), `testing`
(the two Vitest projects), `create-component` (adding one), `primitives` (the UI
elements these render).

## Reading This Package Efficiently

**Doc comments are 35–40% of every component file** — deliberately, because they
carry the *why*. That makes whole-file reads expensive and mostly wasted when you
came for one method. Six files are over 440 lines; `booking-flow.ts` is 751.

**Read `availability-grid.ts` first if you need the shape.** It is the smallest
complete fetching component: properties in, `load()`, state machine, window
arithmetic, typed events. Once you have it, the others are deltas.

**Skip the `@csspart` / `@cssprop` blocks** when you are after behaviour. They are
a manifest contract consumed by `custom-elements.json` and Storybook, not logic.
Grep for the method instead:

```bash
grep -n 'private render\|protected override render\|public async' <file>
```

**Never read `custom-elements.json`** (1.2MB, generated) or any `dist/`. The
source is the answer.

### What each component actually is

Only two components fetch on their own. Assuming the rest do is the most common
wrong turn in this package.

| Component | Fetches? | Entry point | Notes |
|---|---|---|---|
| `availability-grid` | yes | `load()` | The canonical one. Day counts across a window. |
| `availability-picker` | yes | `load()` | ~80% the same as the grid; times, not counts. |
| `provider-search` | yes | `search()` | Also loads reference data (specialties, visit reasons, plans). |
| `provider-results` | **no** | — | Pure props-in. Imports only `DEFAULT_PAGE_SIZE` from the client. |
| `provider-profile` | **no** | — | Presentational. No request state, no `<scoped-*>`, no dependencies. |
| `booking-confirmation` | **no** | — | Presentational. Renders one alert from attributes. |
| `booking-flow` | coordinates | `book()` | Owns the funnel. See below. |

**`booking-flow.step` is a derived getter (`:315`), not stored state.** Looking for
a `@state() step` and not finding it is the single most misread thing in the file.
The step falls out of which of `provider`, `slot`, and `appointment` are set.

### Internal helpers — check here before writing a utility

`components/internal/` is eight modules of shared logic. Reimplementing one of these
inline is the most common avoidable duplication.

| Module | Exports |
|---|---|
| `request-state.ts` | `RequestState`, `renderRequestState`, `requestStateDependencies` |
| `provider-time.ts` | `providerLocalTime`, `isValidDate`, `dayKey`, `todayDayKey`, `addDays`, `formatAppointmentTime` |
| `availability-window.ts` | `resolveWindowStart`, `windowEndDate`, `windowSpan`, `nextWindowStart`, `getLocationSlots`, `renderAvailabilityWindow` |
| `provider-summary.ts` | `providerHeading`, `providerAddress`, `providerLocationLine`, `providerPhotoUrl`, `renderProviderSummary` |
| `error-message.ts` | `userFacingError` |
| `provider-name.ts` | `providerDisplayName` |
| `format.ts` | `formatCount` |
| `messages.ts` | `NO_PROVIDERS_MATCH` |

`getLocationSlots` is the one worth knowing about: `GET /v1/availability` takes a list
and answers with a list, so fetching for one location means matching its entry back out
by id. Taking `entries[0]` looks equivalent and isn't.

### Intl formatters

Every formatter is a module-scope `const`, never built inside a render. Where the value
being formatted is a `YYYY-MM-DD` day key, the formatter is pinned to `timeZone: 'UTC'`,
because those keys are parsed as UTC midnight — see `providerLocalTime`. Locale is always
`undefined`, meaning the reader's own (I18N-002).

That's the package-wide convention, so a formatter's own comment should only say what is
specific to it — which fields it includes and why, not that it was hoisted.

## Templates and dependencies

Markup is `<scoped-*>` inside `this.html`; `CharmElement` rewrites the tag to the
registered prefix. **No `zd-` in a template, no `scope.tag()` interpolation** —
`scope.tag()` appears nowhere in this package's source and `lit/static-html.js` is
imported nowhere. Full rule: PBZD-003.

Every `<scoped-*>` needs its class in `static get dependencies()`. A missing entry
renders an undefined element — no error, no console warning, an empty box. Two
ways that bites:

- **`renderRequestState()` renders tags your template doesn't contain.** Spinner,
  alert, and retry button come from the helper, so a caller must spread
  `...requestStateDependencies` even though grepping its own template for
  `scoped-` finds none of them. `availability-grid` is exactly this case: zero
  `<scoped-*>` in its markup, `requestStateDependencies` in its list.
- **Slotted children are the caller's to register.** `ZdRadioGroup.dependencies`
  declares only the icon it renders itself, so `availability-picker` lists
  `ZdRadio` alongside it.

The one hardcoded-prefix site is `internal/request-state.ts` — a free function
with no `this.html` to resolve against. Its header documents the limitation. Don't
copy the pattern into a component.

## The request state machine (COMP-001)

`idle | loading | success | empty | error`. **Empty is not an error** — a search
that legitimately returns nothing is a success with different wording, and
collapsing the two is what makes a component offer "retry" for a query that worked.

`renderRequestState(state, options)` renders loading/empty/error and delegates
`success` to `children`. A component with nothing to render on success passes
`children: () => nothing` — both `availability-grid:436` and
`provider-search:487` do, because they render their own markup outside the helper.

## Typed events (COMP-002, COMP-003)

Props in, events out. No context protocol, no shared store. Each component
declares its own event map beside it:

```ts
export interface ZdThingEventMap {
  'thing-select': CustomEvent<ThingSelectDetail>;
  'thing-error': CustomEvent<ErrorDetail>;
}

declare public addEventListener: TypedEventTarget<ZdThingEventMap>['addEventListener'];
declare public removeEventListener: TypedEventTarget<ZdThingEventMap>['removeEventListener'];
declare protected emit: TypedEmit<ZdThingEventMap>;
```

The `declare` triple is load-bearing, not decoration: `emit` narrowed to the map
is what stops the map drifting from what the component emits. Maps are
per-component rather than a global `HTMLElementEventMap` augmentation because
`day-select` and `window-change` are each emitted by two components with different
payloads, and a global map allows one entry per name.

Emit with `this.emit()`, never `dispatchEvent(new CustomEvent(...))`.

The full event table is in `AGENTS.md` under **Component Events** — read that
rather than grepping seven files.

## Invariants that look cosmetic and aren't

Changing any of these silently breaks something with no test failure at the
change site:

- **`attribute: false` on patient fields.** An attribute puts the value in the DOM
  where it lands in a screenshot, a bug report, or a page cache (PHI-001).
- **`userFacingError(error)`, never `error.message`.** Client error bodies echo the
  values the request was built from. Every `ErrorDetail` is developer-facing and is
  never rendered or logged wholesale (CLIENT-003, PHI-001).
- **`timeZone: 'UTC'` on the `Intl` formatters.** Pinned to preserve the
  *provider's* wall clock. Dropping it renders appointment times in the patient's
  local zone, which is a different appointment.
- **`Intl` formatters built at module scope.** Constructing one per render is the
  expensive part of `Intl`.
- **`NO_TIMESLOTS = Object.freeze([])`.** A stable identity, so Lit's change
  detection doesn't see a new empty array every render.
- **Only `client/http.ts` calls `fetch`** (CLIENT-001), and the only outbound host
  is the configured `baseUrl` — no analytics, no error reporting (PHI-003).

### Names `CharmElement` already owns

A component method is a subclass member of `LitElement`, which is a subclass of
`HTMLElement`, so an innocuous-looking name can collide with an inherited one.

`renderOptions` is the trap worth knowing: it's `readonly renderOptions: RenderOptions`
on `LitElement`, so a method by that name building `<option>` elements fails with
*"has no properties in common with type 'RenderOptions'"* — which reads like a bad
return type, not a name collision. `CharmElement` additionally owns `html`, `emit`,
`scope`, and the statics `baseName` and `dependencies`; `part` and `slot` are DOM
properties on every element.

When in doubt, name for the domain rather than the mechanism — `optionsFor(items,
selectedId)` over `renderOptions(...)`.

## Where to change what

| Task | File |
|---|---|
| A new endpoint | `client/<resource>.ts` + `client/http.ts` if the shape is new |
| Error wording a patient sees | `components/internal/error-message.ts` |
| Loading / empty / retry markup | `components/internal/request-state.ts` — changes all three fetching components |
| Date or time formatting | `components/internal/provider-time.ts` |
| Window paging arithmetic | `components/internal/availability-window.ts` |
| Provider name, address, photo | `components/internal/provider-summary.ts` |
| A new event | the component's own `*EventMap`, plus the table in `AGENTS.md` |
