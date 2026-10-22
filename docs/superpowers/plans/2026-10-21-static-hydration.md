# Supplied Data and Static Hydration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every component can render from data it is handed without fetching, and the non-patient components can take that data from markup, with unhandled taps on markup-only pages handing the visitor off to Zocdoc.

**Architecture:** Each fetching component gets data properties following the `zd-availability-grid` rule (`undefined` = fetch, a value = supplied) plus request events in place of fetches. Two shared utilities do the cross-cutting work: `hydrate.ts` reads allow-listed `<script type="application/json" data-zd-prop>` children once at connect, and `handoff.ts` validates and follows Zocdoc URLs. Handoff mode is on only for components hydrated from markup.

**Tech Stack:** TypeScript, Lit 3 on Charm UX (`CharmElement`), Vitest browser project with axe-core, Astro docs.

**Spec:** `docs/superpowers/specs/2026-10-21-static-hydration-design.md`

## Global Constraints

- All paths below are relative to `packages/api-components/src/` unless they start with `packages/` or `docs/`.
- Extend `CharmElement`, write `<scoped-*>` tags, emit through `this.emit()` with `{component}-{action}` names (PBZD-002/003, COMP-003). Cancelable events pass `cancelable: true` to `emit()`; it returns the `CustomEvent`, so check `event.defaultPrevented` on the return value. `emit()` defaults are `bubbles: true, composed: true, cancelable: false`.
- Every new event type goes in the component's `*EventMap` and its detail type is exported through the barrel (`components/events.ts` conventions).
- A component in supplied mode never calls the client layer for the supplied value, including after inputs change. Tests assert the mocked endpoint was never called (TEST-002: `vi.mock(path, { spy: true })` + `vi.spyOn`).
- `[]` renders the empty state, never error (COMP-001). `loading` shows and announces the loading state and starts no request (A11Y-002).
- **PHI:** `zd-patient-form`, `zd-appointment`, `zd-booking-confirmation`, `zd-sign-in` and `zd-booking` never read markup data. No console output contains JSON content or field values, only the element tag and property name (PHI-001).
- JSON blocks: `JSON.parse(script.textContent)` only. Never `innerHTML`, never `eval`, never attributes holding JSON.
- Handoff URLs: only absolute `https:` URLs whose hostname is `zocdoc.com` or ends in `.zocdoc.com` are followed. `window.open(url, '_blank', 'noopener,noreferrer')` inside an iframe (`window.self !== window.top`), `window.location.assign(url)` otherwise.
- **Referrer params (Zocdoc standard TS-019):** append `referrerType=api_components` and `component=<baseName>` to every handoff URL with `URLSearchParams`. No click metrics or analytics (PHI-003).
- New user-facing copy, exactly: `Book now` (button), `Sponsored` (label). Text lives in DOM text nodes (I18N-001).
- Test data from the documented scenarios and the existing fixtures in `client/mock/fixtures.ts` only (TEST-003).
- Styles: CSS nesting, no BEM, logical properties (STYLE-001/002, I18N-003).
- Markup contract is public API: names in this plan (`data-zd-prop` values, attributes, slots, events) are final.
- Commands: `pnpm test:components -- <path>` for one file, `pnpm test`, `pnpm typecheck`, `pnpm lint` from the repo root. Commit message endings follow the repo's attribution reminder.

## Review Focus

1. **Supplied data arrives before the element upgrades** (property set on an undefined element, then the bundle loads). Lit's upgrade must keep the value and skip the fetch. Pinned in Task 2, 3 and 4 tests.
2. **The host drops a supplied binding** (`timeslots` back to `undefined`) on the picker. It should fetch again, as the grid does, except for `zd-appointment`, where the mode latches. Pinned in Task 2 and Task 3.
3. **A JSON block with the right name but the wrong shape** (object where an array is expected). It must be ignored, not crash the render. Pinned in Task 1.
4. **A `booking_url` or `profile_url` that is protocol-relative, `http:` or not Zocdoc's.** It must not navigate; "Book now" is not rendered for a provider without a valid URL. Pinned in Task 1 and Task 7.
5. **A JSON block whose `</script>` sequence was escaped as `<\/script>` by the server.** `JSON.parse` handles it; it must hydrate normally. Pinned in Task 1.

---

### Task 1: Shared hydration and handoff utilities

**Files:**
- Create: `utilities/hydrate.ts`, `utilities/handoff.ts`
- Test: `utilities/__tests__/hydrate.test.ts`, `utilities/__tests__/handoff.test.ts`

**Interfaces:**
- Produces:
  - `type HydrationShape = 'array' | 'object'`
  - `readHydratedProps(host: HTMLElement, allowed: Readonly<Record<string, HydrationShape>>): Record<string, unknown>`: reads `:scope > script[type="application/json"][data-zd-prop]`. Returns only allow-listed names whose parsed value matches the shape (`Array.isArray` for `'array'`; a non-null, non-array object for `'object'`). Malformed or mismatched blocks are skipped with one `console.warn` naming `host.localName` and the property, never content. The first block wins for a duplicate name.
  - `applyHydratedProps(host: HTMLElement, values: Record<string, unknown>): boolean`: assigns each value only where `host[name] === undefined` (a property set by script wins). Returns `true` if anything was read from markup, which is what turns handoff mode on.
  - `handoffHref(url: string | null | undefined, component: string): string | undefined`: returns the URL with the referrer params added, or `undefined` if it's not absolute `https:` on a Zocdoc host.
  - `navigateTo(href: string): void`: the iframe/new-tab rule from Global Constraints.

- [ ] **Step 1: Write the failing tests**

`hydrate.test.ts` (browser project, build fixtures with `document.createElement`):
- `reads an allow-listed array block` → `{ providers: [..] }`.
- `ignores a name not on the allow-list`.
- `ignores malformed JSON and warns without content`: spy `console.warn`; assert called once and its arguments contain neither the raw text nor any field value.
- `ignores a block whose shape does not match` (object for `'array'`).
- `ignores nested blocks` (a script inside a child element).
- `parses an escaped <\/script> sequence`.
- `applyHydratedProps keeps a property already set` and returns `false` when nothing was applied.

`handoff.test.ts` (client project):
- `https://www.zocdoc.com/doctor/x` → contains `referrerType=api_components` and `component=provider-card`, existing query kept.
- `undefined` for: `null`, `''`, `//www.zocdoc.com/x`, `http://www.zocdoc.com/x`, `https://evil.com/x`, `https://zocdoc.com.evil.com/x`, `javascript:alert(1)`.
- `navigateTo` uses `window.location.assign` at top level, `window.open(href, '_blank', 'noopener,noreferrer')` when `window.self !== window.top` (stub both).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- src/utilities/__tests__/hydrate.test.ts src/utilities/__tests__/handoff.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement both modules** with the signatures above. Model the URL check on `utilities/waiting-room.ts:18-29`.

- [ ] **Step 4: Run tests to verify they pass**

Same command. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/api-components/src/utilities
git commit -m "feat: add markup hydration and Zocdoc handoff utilities"
```

### Task 2: Supplied mode for `zd-availability-picker`

**Files:**
- Modify: `components/availability-picker/availability-picker.ts` (properties near `:166-231`, `willUpdate` `:240`, `load` `:258`, event map `:65-68`)
- Test: `components/availability-picker/availability-picker.test.ts`

**Interfaces:**
- Produces:
  - `timeslots?: readonly AvailabilitySlot[]` (`attribute: false`), `loading: boolean` (attribute `loading`), mirroring `availability-grid.ts:165-184`.
  - Event `availability-request`, detail `AvailabilityRequestDetail { providerLocationId: string; visitReasonId?: string; patientType: PatientType; startDate: string; days: number }`.

- [ ] **Step 1: Write the failing tests** (spy `getAvailability` as `availability-grid.test.ts` does):
- `renders supplied timeslots without fetching`: set `timeslots` to `buildTimeslots(TODAY, ['14:00','15:30'])`; assert two slot buttons, `getAvailability` not called.
- `renders empty for [] without fetching`: empty-state part present, no alert role.
- `emits availability-request instead of fetching when an input changes`: change `start-date`, then the patient type through the toggle; assert two `availability-request` events with the full detail and no fetch.
- `loading shows the loading state and fetches nothing`.
- `keeps supplied slots set before upgrade`: create element, set `timeslots`, then append and await; no fetch.
- `fetches again when timeslots goes back to undefined` (Review Focus 2).
- `has no axe violations` in the supplied and supplied-empty states.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:components -- src/components/availability-picker/availability-picker.test.ts`
Expected: new tests FAIL.

- [ ] **Step 3: Implement.** Rendering reads `this.timeslots ?? <fetched>`, as the grid does at `availability-grid.ts:240-242`. In `willUpdate`, when `timeslots !== undefined` and any of the existing triggers changed, emit `availability-request` instead of `load()`. `changed.has('timeslots')` going to `undefined` calls `load()`. `load()` returns early when `timeslots !== undefined`.

- [ ] **Step 4: Run to verify pass.** Same command, plus the existing picker tests. Expected: PASS.

- [ ] **Step 5: Commit** `feat(availability-picker): render supplied timeslots and request instead of fetching`

### Task 3: Supplied mode for `zd-appointment`

**Files:**
- Modify: `components/appointment/appointment.ts` (state `:183-192`, `willUpdate` `:198`, cancel `:262-300`, reschedule `:360-412`, picker `:548-558`)
- Test: `components/appointment/appointment.test.ts`

**Interfaces:**
- Consumes: Task 2's `timeslots`, `availability-request` on the embedded picker.
- Produces:
  - Public `appointment?: AppointmentDetails` and `providerLocation?: ProviderLocation` (both `attribute: false`), replacing the `@state` fields.
  - Public `actionError?: string`. While supplied, the host sets it to report a failed action; the component shows its own fixed copy for the action, never the given string. *(Settles the spec's open item: a property, value ignored except for truthiness, so raw API text can't reach the screen, CLIENT-003.)*
  - Public `rescheduleTimeslots?: readonly AvailabilitySlot[]`, passed to the embedded picker as `.timeslots`. The picker's `availability-request` bubbles out unchanged for the host to answer.
  - Events `appointment-cancel-request` `{ appointmentId: string; reasonType?: CancellationReasonType }` and `appointment-reschedule-request` `{ appointmentId: string; startTime: string }`.
  - Private `supplied: boolean`, latched `true` the first time `appointment` is set and never reset.

- [ ] **Step 1: Write the failing tests** (spy every appointment and provider-location client function):
- `renders a supplied appointment without fetching`, including after `appointment-id` changes.
- `skips the provider lookup when providerLocation is supplied`.
- `cancel emits appointment-cancel-request and calls no API`: busy state shown; then set `appointment` with status `cancelled`; assert the existing cancelled notice and that `appointment-cancel` fired once.
- `reschedule emits appointment-reschedule-request with the chosen startTime and calls no API`; then set the updated `appointment`; assert `appointment-reschedule` fired.
- `actionError shows the component's own copy, not the string given`: set `actionError = 'raw api text'`; assert the rendered alert text does not contain it.
- `stays supplied after appointment is set to undefined` (the latch): cancel still emits a request and calls nothing.
- `ignores JSON blocks`: a child `<script type="application/json" data-zd-prop="appointment">` is not read (anti-goal).
- axe on supplied view, cancel-busy and action-error states.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:components -- src/components/appointment/appointment.test.ts`

- [ ] **Step 3: Implement.** Branch at the top of the cancel and reschedule handlers on `this.supplied`: emit the request, set `busy`, return. On a later `appointment` change while `busy`, clear `busy`, set the notice from the status change, and emit the existing `appointment-cancel`/`appointment-reschedule` with the same detail shapes as today.

- [ ] **Step 4: Run to verify pass** (new and existing tests).

- [ ] **Step 5: Commit** `feat(appointment): render supplied appointments and request actions from the host`

### Task 4: Supplied mode for `zd-provider-search`

**Files:**
- Modify: `components/provider-search/provider-search.ts` (fields `:154-157`, `connectedCallback` `:177-180`, `willUpdate` `:189`, `handleSubmit` `:328`)
- Test: `components/provider-search/provider-search.test.ts`

**Interfaces:**
- Produces:
  - Public `specialties?: Specialty[]`, `insurancePlans?: InsurancePlan[]` (`attribute: false`). Rendering reads them, falling back to the fetched lists. `loadReferenceData()` is skipped when both are set.
  - `supplied: boolean` (attribute `supplied`), `loading: boolean` (attribute `loading`).
  - Event `provider-search-request` with `ProviderSearchRequestDetail { zipCode: string; specialtyId?: string; insurancePlanId?: string; visitType?: VisitType; maxDistanceToPatientMi?: number; page: number; pageSize?: number }`.

- [ ] **Step 1: Write the failing tests** (spy `getSpecialties`, `getInsurancePlans`, `searchProviderLocations`):
- `uses supplied reference data without fetching it`: options rendered from the given lists, both getters not called.
- `fetches only the list not supplied`.
- `supplied submit emits provider-search-request and does not search`: valid ZIP from the testing scenarios, submit; assert detail with `page: 0` and no search call.
- `supplied submit with an invalid ZIP shows the field error and emits nothing`.
- `supplied page change emits provider-search-request with the new page`.
- `loading shows the loading state`.
- axe on the supplied form and the loading state.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:components -- src/components/provider-search/provider-search.test.ts`

- [ ] **Step 3: Implement.** In `search()`, when `supplied`, build the detail from the current fields (reusing the existing criteria builder), emit, and return before any client call. Keep the `searchedPage` bookkeeping so `willUpdate` doesn't loop (`provider-search.ts:250-257`).

- [ ] **Step 4: Run to verify pass.**

- [ ] **Step 5: Commit** `feat(provider-search): accept supplied reference data and request searches from the host`

### Task 5: Markup hydration in the display components

**Files:**
- Modify: `components/provider-results/provider-results.ts`, `components/provider-card/provider-card.ts`, `components/provider-summary/provider-summary.ts`, `components/provider-profile/provider-profile.ts`, `components/availability-grid/availability-grid.ts`, `components/availability-picker/availability-picker.ts`, `components/provider-search/provider-search.ts`
- Test: one `describe('markup hydration')` block in each component's existing test file, plus `components/__tests__/hydration-boundary.test.ts`

**Interfaces:**
- Consumes: Task 1 `readHydratedProps`, `applyHydratedProps`; Task 2 and 4 properties.
- Produces: on each component, `static hydratable: Readonly<Record<string, HydrationShape>>` and a protected `hydrated: boolean` (true when `applyHydratedProps` returned `true`), set in `connectedCallback` before `super.connectedCallback()`. Allow-lists, exactly:
  - results: `{ providers: 'array', availability: 'array', annotations: 'object' }` (`annotations` is defined in Task 6)
  - card, summary, profile: `{ provider: 'object' }`
  - grid: `{ timeslots: 'array' }`
  - picker: `{ timeslots: 'array', provider: 'object' }` (`provider` is defined in Task 7)
  - search: `{ specialties: 'array', insurancePlans: 'array' }`

`zd-provider-results.providers` defaults to `[]` today, so `applyHydratedProps`'s "only where undefined" rule would skip it. Change the default to `undefined` and read `this.providers ?? []` in rendering. *(My call: it keeps one precedence rule for every component.)*

- [ ] **Step 1: Write the failing tests.** For each component:
- `renders the same from a JSON block as from the property`: mount once with a block and once setting the property, using the same fixture; compare `shadow(el).textContent` (normalized whitespace).
- `a property set before upgrade wins over the block`.
- `fetches nothing when hydrated` (grid, picker, search).
- results only: `hides the pager and window control when hydrated` is in Task 7; not here.
- `hydration-boundary.test.ts`: for `zd-patient-form`, `zd-appointment`, `zd-booking-confirmation`, `zd-sign-in` and `zd-booking`, a child block naming each of their data properties leaves those properties `undefined` and logs nothing.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:components`

- [ ] **Step 3: Implement** the static allow-list and the `connectedCallback` call in each listed component. No other component changes.

- [ ] **Step 4: Run to verify pass**, then `pnpm typecheck`.

- [ ] **Step 5: Commit** `feat: hydrate display components from inline JSON blocks`

### Task 6: Content slots on cards and annotations on results

**Files:**
- Modify: `components/provider-card/provider-card.ts` (render `:164-203`), `components/provider-card/provider-card.styles.ts`, `components/provider-results/provider-results.ts` (`renderResults` `:444-474`)
- Test: `components/provider-card/provider-card.test.ts`, `components/provider-results/provider-results.test.ts`

**Interfaces:**
- Produces:
  - Card slots `reason`, `review`, `sponsored`, rendered in that order after the specialty and before `badges`. Each is wrapped in an element that is hidden when its slot is empty (use the slot's `slotchange` and `assignedNodes`), with parts `reason`, `review`, `sponsored`.
  - `type ProviderAnnotation = { reason?: string; review?: string; sponsored?: boolean }`, exported through the barrel.
  - Results property `annotations?: Readonly<Record<string, ProviderAnnotation>>` (`attribute: false`), keyed by `provider_location_id`. For each card it renders `<span slot="reason">`, `<span slot="review">` as text, and for `sponsored: true` `<span slot="sponsored">Sponsored</span>`. Callers never supply the label's words.

- [ ] **Step 1: Write the failing tests:**
- card: `renders slotted reason, review and sponsored text`; `renders no wrapper for an empty slot`; axe with all three filled.
- results: `renders annotations per provider`; `renders the Sponsored label from the component, not caller text` (annotation `{ sponsored: true }` → label text exactly `Sponsored`); `escapes annotation text` (a `<b>` in `reason` renders as literal text); `ignores annotations for providers not in the list`.

- [ ] **Step 2: Run to verify failure.**

Run: `pnpm test:components -- src/components/provider-card src/components/provider-results`

- [ ] **Step 3: Implement.** Annotation text goes through Lit text bindings only.

- [ ] **Step 4: Run to verify pass.**

- [ ] **Step 5: Commit** `feat(provider-card): add reason, review and sponsored slots; results annotations`

### Task 7: Handoff to Zocdoc on markup-only pages

**Files:**
- Modify: `components/availability-picker/availability-picker.ts` (`select` `:340-344`, patient-type toggle), `components/provider-card/provider-card.ts`, `components/provider-results/provider-results.ts` (`renderAvailability` `:336-358`, `renderPager`, window control), `components/availability-grid/availability-grid.ts` (only to forward `handoff` to day cells)
- Test: the three components' test files

**Interfaces:**
- Consumes: Task 1 `handoffHref`, `navigateTo`; Task 5 `hydrated`.
- Produces:
  - On picker, card and results: `disableHandoff: boolean` (attribute `disable-handoff`) and `interactive: boolean` (attribute `interactive`). Handoff mode = `hydrated && !disableHandoff`. Results passes its handoff mode to its cards via a `handoff` boolean property on the card (`attribute: false`) so cards rendered from a hydrated list behave as hydrated.
  - Picker: `provider?: ProviderLocation` (`attribute: false`, hydratable). `slot-select` emitted with `cancelable: true`; in handoff mode, if not prevented, `navigateTo(handoffHref(slot.booking_url, 'availability-picker') ?? handoffHref(provider?.profile_url, 'availability-picker'))` when one resolves.
  - Card: event `book-select` `{ provider: ProviderLocation }`, cancelable. In handoff mode, when the card has no slotted availability of its own and `handoffHref(provider.profile_url, 'provider-card')` resolves, render a link `<a part="book" href=…>Book now</a>`, styled as a primary button. Its click emits `book-select`; prevented → `preventDefault()` on the click; otherwise `navigateTo(href)` (and prevent the default anchor navigation so the iframe rule applies).
  - Results: in handoff mode every card gets "Book now" (results show day counts, never slots). Day-cell `day-select` in handoff mode does the same as "Book now" for that card: emit `book-select`, cancelable, then navigate.
  - Hidden in handoff mode unless `interactive`: results pager and shared window control, picker patient-type toggle.

- [ ] **Step 1: Write the failing tests** (stub `navigateTo` with `vi.mock('../../utilities/handoff.js', { spy: true })`):
- picker: `hydrated slot tap navigates to booking_url with referrer params`; `falls back to provider.profile_url when booking_url is null`; `does nothing beyond the event without either`; `preventDefault on slot-select stops navigation`; `disable-handoff stops navigation`; `a property-driven picker never navigates`; `hides the patient-type toggle when hydrated, shows it with interactive`.
- card: `shows Book now when handoff and profile_url are present`; `hides Book now without a valid https Zocdoc profile_url` (Review Focus 4: `//…`, `http:`, other host); `Book now emits book-select then navigates`; `preventDefault stops it`; `no Book now for a property-driven card`; `Book now is reachable and activatable by keyboard`.
- results: `hydrated results show Book now on every card`; `day cell tap in handoff mode navigates for that provider`; `pager and window control hidden when hydrated, shown with interactive`; `property-driven results unchanged` (existing snapshot tests still pass).
- axe on hydrated card, hydrated results and hydrated picker.

- [ ] **Step 2: Run to verify failure.**

Run: `pnpm test:components -- src/components/availability-picker src/components/provider-card src/components/provider-results`

- [ ] **Step 3: Implement** per the Interfaces block.

- [ ] **Step 4: Run to verify pass**, then the full `pnpm test`, `pnpm typecheck`, `pnpm lint`.

- [ ] **Step 5: Commit** `feat: hand off to Zocdoc from markup-hydrated components`

### Task 8: Documentation of the public contract

**Files:**
- Create: `packages/docs/src/content/docs/guides/markup-and-supplied-data.mdx`
- Modify: `packages/docs/src/content/docs/components/{availability-picker,appointment,provider-search,provider-results,provider-card,availability-grid,provider-summary,provider-profile}.mdx`; JSDoc `@event`, `@slot`, `@csspart` tags on every changed component
- Regenerate: `pnpm --filter @zocdoc/api-components cem` (do not read the generated manifest)

**Interfaces:**
- Consumes: every name produced in Tasks 1–7.

- [ ] **Step 1: Write the guide** with these sections: supplied data (the `undefined` vs value rule, `loading`, request events per component); markup (attributes, the three slots, JSON blocks with one complete `zd-provider-results` example using fixture data, precedence, allow-list table, components that never read markup and why); taps (cancelable events, handoff, `disable-handoff`, `interactive`, referrer params); a stability note that the contract is additive-only. State that `booking_url` may be null, so a slot tap may go to the profile instead.

- [ ] **Step 2: Update each component page** with its new properties, events, slots and a markup example where hydratable.

- [ ] **Step 3: Regenerate the manifest and agent docs**

Run: `pnpm --filter @zocdoc/api-components cem`
Expected: exits 0; `git diff --stat` shows `.claude/skills/api-components/references/` updated.

- [ ] **Step 4: Build the docs**

Run: `pnpm --filter docs build`
Expected: exits 0.

- [ ] **Step 5: Commit** `docs: document supplied data, markup hydration and handoff`

## Before Task 7 ships

Confirm with the API owners which credentials populate `AvailabilitySlot.booking_url` and `ProviderLocation.profile_url`, and that both are absolute `https://www.zocdoc.com` URLs. The code handles either being missing; this only decides whether a slot tap lands in booking or on the profile.
