# Supplied data and static hydration — design

**Status:** agreed in conversation 2026-10-21; builder check done; awaiting approval.
**Context:** "One-pager: Zocdoc in Claude" and "PRD: Zocdoc in Claude" (Care Access Network team, drafts of
2026-10-16). Both describe a verified Claude connector built on MCP Apps in which "Claude does the listening and
triage; Zocdoc owns the moments that need trust", rendered as Zocdoc UI inside the conversation.

## Intent

Today most of these components can draw from data they are handed, but three of them can only draw from data they
fetch themselves, and none of them can draw from data written into the page's HTML. That shuts them out of every
place where the data already exists before the component runs and no Zocdoc token is available to the page:

1. **MCP hosts (Claude, ChatGPT).** The Zocdoc MCP server owns the token and calls the API through composite tools.
   The UI it returns receives the tool result; it must not fetch.
2. **Server-rendered pages.** Our server or a partner's renders the HTML with the data already in it.
3. **CMS and partner embeds.** An author pastes markup into a page they don't otherwise control.
4. **Claude-written HTML artifacts.** Claude writes the markup from a tool result it already holds.

All four are real targets. The work makes every component able to render from **supplied data**, and lets the
non-patient components take that data **from markup** as well as from properties.

**Success:**

- An MCP adapter written outside this repo can render provider results, availability, a confirm step and an
  appointment card purely from tool output, and turn every user action into a tool call, without any component
  making a network request.
- A page with only HTML (our tags, attributes, slotted text and an inline JSON block) and the bundle renders
  provider results and availability correctly on first paint, with no glue script and no token.

### Decisions made with the user

- **One design, two ways in.** A shared core (supplied-data mode in every component) is fed either by script setting
  properties (MCP hosts) or by markup (pages). The two ways in feed the same property, so they cannot drift.
- **Order:** the shared core first, because it unblocks the MCP work; the markup contract second.
- **This repo knows nothing about any chat host.** No `window.openai`, no MCP Apps messages, no tool names. The host
  adapter lives with the MCP server (`zocdoc-mcp-server` or a package beside it), not here. What this repo owes it is
  a stable public contract: documented properties, events and payloads, and a self-contained bundle it can inline.
- **`zocdoc-mcp-frontend` is untouched.** Its React provider-cards widget sits alongside these components. Neither
  package depends on, imports or replaces the other. Which UI a given tool returns is the MCP side's decision.
- **Everything stays in `@zocdoc/api-components`.** No package per component. Per-widget bundles, if needed, are
  build entry points of the same package.
- **On a page, a tap can go either way, and the partner chooses.** The page can handle it and continue booking in
  place, or leave it unhandled and the visitor is handed off to Zocdoc.

### Goals

- Supplied-data mode for `zd-availability-picker`, `zd-appointment` and `zd-provider-search`, matching the
  pattern `zd-availability-grid` already uses.
- A documented markup contract for the provider, availability and reference-data components.
- A default handoff to Zocdoc for markup-hydrated components: slot taps redirect, and cards without slots show "Book now".
- Named slots on `zd-provider-card` for text written by the server or Claude.

### Non-goals

- The MCP host adapter itself, the MCP tools, auth and account linking. All live with the MCP server.
- Triage, the red-flag screen and the triage skill.
- Lit SSR or declarative shadow DOM. "Static hydration" here means *the data* is in the HTML; the component still
  renders client-side on upgrade. Revisit only if first paint before script turns out to matter.
- Replacing, wrapping or sharing code with `zocdoc-mcp-frontend`.

### Anti-goals (would be a failure even if it technically works)

- **Patient or appointment data in markup.** Attributes and inline JSON land in the DOM, page caches, screenshots and
  shared artifacts (PHI-001). The patient form, appointment and confirmation components stay property-only.
- **A component that books, cancels or reschedules without a user tap.** Supplied-data mode must not introduce any
  path that commits on load or on data arrival.
- **Host knowledge leaking into components.** If a component needs to know whether it is in Claude to behave
  correctly, the boundary is wrong.
- **A markup format we have to break.** Partners will copy it; changes after release are additive only.

## Constraints

- Project rules apply throughout: COMP-001 (the state machine, with empty distinct from error), COMP-002 (props in,
  events out), COMP-003 (`this.emit()`, `{component}-{action}` names), COMP-004 (standalone children), PHI-001/003,
  I18N-001, A11Y-002, CLIENT-001 (only `http.ts` fetches).
- `CharmElement.emit(name, init?: CustomEventInit)` returns the `CustomEvent`, so cancelable events and a
  `defaultPrevented` check need no base-class change.
- MCP hosts load the UI in a sandboxed iframe. The server inlines one non-split bundle into the HTML it returns (that
  is how `zocdoc-mcp-frontend` ships today). Provider photos need the image CDN allowed by the host, or `hide-photo`.
- PRD non-functional requirements the MCP side will measure against: cards render within 2 s on mobile, WCAG 2.1 AA
  (the project already targets 2.2 AA), light and dark themes, readable at phone width.

## Part 1 — the shared core: supplied-data mode

### The rule (already established by `zd-availability-grid`)

For each fetched value, a data property with `attribute: false`:

- `undefined` — not supplied; the component fetches as it does today.
- a value, including `[]` — supplied; the component renders it and fetches nothing. `[]` is the empty state, not an
  error.

Plus a boolean `loading` that the host sets while it is replacing supplied data. It shows the loading state and
announces it, and starts no request. A component in supplied mode never calls the client layer for that value, even
when an input that would normally refetch (an ID, `start-date`) changes. Instead it emits the event the host needs to
fetch and supply the replacement.

Data shapes are the API's own types from `client/types.ts` (`ProviderLocation`, `AvailabilitySlot`,
`ProviderLocationAvailability`, `AppointmentDetails`), so a host passes tool output through without reshaping.

### `zd-availability-picker`

- **New:** `timeslots?: readonly AvailabilitySlot[]` and `loading: boolean`, mirroring
  `zd-availability-grid` (`availability-grid.ts:165-183`).
- **Supplied mode:** `willUpdate` (`availability-picker.ts:240`) skips `load()` when `timeslots !== undefined`.
  Wherever it would have refetched (the patient-type toggle, or a change to `start-date`, `days` or either ID), it
  emits **`availability-request`** with the full criteria (`providerLocationId`, `visitReasonId`, `patientType`,
  `startDate`, `days`) and sets `loading` until the host supplies new `timeslots`. *(My call: a request event,
  matching `provider-search-request`, rather than adding window navigation to the picker.)*
- `provider-location-id` stays required. `select()` emits nothing without it (`availability-picker.ts:340`), and
  that rule is part of the markup contract.
- `slot-select` is unchanged.

### `zd-appointment`

- **New:** `appointment?: AppointmentDetails` and `providerLocation?: ProviderLocation`, both `attribute: false`
  (PHI: property-only, never hydrated from markup). Today both are `@state` (`appointment.ts:185,192`).
- **Supplied mode:** when `appointment` is set, `willUpdate` (`appointment.ts:198`) doesn't call `load()`, and the
  provider lookup is skipped if `providerLocation` is set.
- **The mode latches.** Once `appointment` has been set, the element is in supplied mode for the rest of its life. A
  later `appointment-id` change emits nothing and fetches nothing, and cancel and reschedule never call the API.
  *(My call: the anti-goal is a hidden path to the cancel API, so the rule has to be impossible to fall out of.)*
- **Actions in supplied mode:** cancel and reschedule must not call the API themselves (the MCP server makes those
  calls). Instead the component emits a request event and waits:
  - `appointment-cancel-request` with `{ appointmentId, reasonType? }`
  - `appointment-reschedule-request` with `{ appointmentId, startTime }`
  The component shows its existing busy state. The host then either sets an updated `appointment` (the component
  leaves busy and shows its existing success notice, worked out from the status change) or reports a failure (see
  open items). The existing `appointment-cancel` / `appointment-reschedule` events still fire once the change is
  visible, so listeners don't care which mode produced it.
- The embedded reschedule picker gets its slots the same way: the host supplies `timeslots` to it through the
  appointment component (open item: the exact pass-through).

### `zd-provider-search`

- Search renders the form, not the list: results leave through the `provider-results` event for a
  `zd-provider-results` to show (`provider-search.ts:452-455`). So its supplied mode covers what it fetches, not
  what it displays.
- **New:** `specialties?: Specialty[]` and `insurancePlans?: InsurancePlan[]` (`attribute: false`). When both are set,
  `connectedCallback` (`provider-search.ts:177-180`) skips `loadReferenceData()`.
- **New:** `supplied: boolean` (attribute `supplied`). When set, submit (`provider-search.ts:328`) and page changes
  (`:190`) don't call `search()`. They emit **`provider-search-request`** with the criteria (`zipCode`,
  `specialtyId`, `insurancePlanId`, `visitType`, `maxDistanceToPatientMi`, `page`, `pageSize`). The host sets
  `loading` while it fetches and hands the results to its `zd-provider-results`. Field validation still runs first,
  so the host only hears valid requests.
- *(My call: no `results` property. Search would only pass it straight on, and on a markup page there is nothing to
  pass it to. This keeps search from embedding the list, which would break COMP-002 and COMP-004.)*

### Components that already accept supplied data

`zd-provider-card`, `-summary`, `-profile`, `-results`, `zd-availability-grid`, `zd-availability-window`,
`zd-booking-confirmation` and `zd-patient-form` already render from properties. They need documentation of their
data properties as public contract, and nothing else for Part 1.

`zd-booking` and `zd-sign-in` are out of scope. `zd-booking` is the whole fetched funnel; an MCP host composes the
parts instead. `zd-sign-in` is replaced by connector OAuth in MCP hosts.

## Part 2 — the markup contract (static hydration)

### Three channels, by kind of data

| Kind | Channel | Example |
| --- | --- | --- |
| Scalars: IDs, dates, flags, counts | Attributes (most already exist) | `provider-location-id`, `start-date`, `hide-photo`, `total-count` |
| Text for people to read | Named slots, light-DOM text | the "why this provider" line, a review snippet, the sponsored label |
| Lists and objects | One inline JSON block per property | providers, availability, timeslots |

### Inline JSON blocks

```html
<zd-provider-results total-count="42" page-size="10">
  <script type="application/json" data-zd-prop="providers">[ … ProviderLocation[] … ]</script>
  <script type="application/json" data-zd-prop="availability">[ … ProviderLocationAvailability[] … ]</script>
</zd-provider-results>
```

- A child `<script type="application/json">` never executes and is inert in every browser, which is why it beats a
  JSON attribute: no escaping, no attribute size concerns, no observed-attribute churn.
- `data-zd-prop` names the **property** (camelCase) it fills. The value is exactly what the property takes, so
  `el.providers = data` and the block produce the same render.
- Read **once**, in `connectedCallback`, from direct children only (`:scope > script[type="application/json"][data-zd-prop]`).
  Blocks added later are ignored; a host that wants live updates sets properties.
- **Precedence:** a property already set by script wins over the block. That way the same markup can be
  server-rendered and then updated live.
- **Allow-list per component.** A static list of hydratable property names; a block naming anything else is ignored.
  Implemented once in a shared helper the components call, not per component. Initial list:
  - `zd-provider-results`: `providers`, `availability`, `annotations`
  - `zd-provider-card`, `-summary`, `-profile`: `provider`
  - `zd-availability-grid`, `zd-availability-picker`: `timeslots`
  - `zd-provider-search`: `specialties`, `insurancePlans`. *(My call: hydratable for consistency, but a markup-only
    search still needs a host or a token to run, because submitting is a request.)*
  - **Never:** `zd-patient-form`, `zd-appointment`, `zd-booking-confirmation`, `zd-sign-in`, `zd-booking`.
- **Malformed JSON** is ignored and the component behaves as if the block were absent (fetches if it can, otherwise
  renders its empty or idle state). A dev-mode console warning names the element and the property, never the content
  (PHI-001).

### Text slots for server- or Claude-written content

- `zd-provider-card` gains three named slots: `reason` (one line on why this provider fits), `review` (a verified
  review snippet) and `sponsored` (the label for a paid placement). Its existing `badges` and `availability` slots
  stay. Slotted text stays in the light DOM, so browser translation works on it (I18N-001).
- `zd-provider-results` renders its cards inside its shadow root, so it can't forward per-card slots. It takes the
  same three fields through an `annotations` property instead: `Record<provider_location_id, { reason?: string;
  review?: string; sponsored?: boolean }>`, hydratable from a JSON block. The sponsored label's text is the
  component's own, not the caller's, so it is always present and worded the same way when `sponsored` is true.
- The PRD requires that sponsored results are labeled and never given as the reason for fit. The component guarantees
  the label; the "never the reason" half is the caller's content and the MCP side's responsibility.

### Contract stability

The markup format (tag names, attributes, slot names, `data-zd-prop` names and their JSON shapes) is public API.
It is documented in the docs package alongside the properties, and changes after release are additive only. No
version attribute in v1 (my call: additive-only makes one unnecessary until there is a breaking change to signal).

## Part 3 — what a tap does on a page

### Decided with the user

- **Tapping a time slot redirects the visitor to Zocdoc** to finish booking.
- **If no time slots are provided, the card shows a "Book now" button** that redirects to the Zocdoc site.
- **Paging and window controls are hidden** on a markup-only page that nobody is handling, because with no host to
  supply the next batch they would leave stale data on screen.

### How it works

- **The event comes first.** `slot-select` (`zd-availability-picker`) and the new `book-select` (below) are
  cancelable. A host that handles the tap itself, for example to continue booking in place with a token, calls
  `preventDefault()` and nothing redirects.
- **Handoff mode** is on for a component that took its data from a JSON block, and for the cards and grids that
  component renders. Property-driven hosts, including every MCP adapter, never enter it, so their behavior doesn't
  change. `disable-handoff` (boolean attribute) turns it off for a page that wants taps to do nothing.
- **Slot tap (picker):** emit `slot-select`; if not prevented, go to the slot's `booking_url`, falling back to the
  provider's `profile_url`. With neither, nothing happens beyond the event. The picker has no `provider` today, so
  it gains an optional `provider?: ProviderLocation` (hydratable) to supply the fallback.
- **"Book now" (cards in `zd-provider-card` and `zd-provider-results`):** shown in handoff mode when the card has no
  time slots of its own to tap. Results cards only ever show day counts, never slots, so in handoff mode every
  results card gets the button. Tapping emits `book-select` with `{ provider }`; if not prevented, go to
  `profile_url`. Without a `profile_url` the button isn't rendered. The label is component text in the DOM
  (I18N-001), and the button is a real link so it works with the keyboard and screen readers.
- **Day cells in handoff mode** behave like "Book now" for that card *(my call: a day count you can't act on would
  read as broken)*.
- **Hidden in handoff mode** unless a listener is attached: `zd-provider-results` paging and the shared window
  control, and the picker's patient-type toggle. *(My call on how to detect it: hidden in handoff mode, and shown
  again when the page sets `interactive` (boolean attribute) to say it will handle `page-change` /
  `window-change` / `availability-request` itself. Detecting listeners isn't possible from the DOM.)*
- Navigation happens in the same tab, or in a new tab when the component is inside an iframe. *(My call: a sandboxed
  frame usually can't navigate the top window.)*

### URLs, unconfirmed

`AvailabilitySlot.booking_url` is documented as a non-PHI deep link, but `client/types.ts:243-249` records it was
`null` in all 165 production timeslots sampled, presumably populated only for syndication clients.
`ProviderLocation.profile_url` exists on the type. Confirming which credentials populate each, and that both are
absolute `https:` Zocdoc URLs, is the **first task**; only absolute `https:` URLs are followed, the same check
`zd-booking-confirmation` applies to `waitingRoomUrl`. If `booking_url` stays null for partners, a slot tap still
redirects, but to the profile rather than straight into the booking flow for that time.

## Packaging

- One package, `@zocdoc/api-components`. The existing IIFE/ESM bundles (`zocdoc.js`, `zocdoc.esm.js`) and the theme
  CSS are what an MCP server inlines and a page loads.
- Start with one bundle. Split into per-widget entry points of the same package only if the inlined size measurably
  hurts the 2 s mobile render target.
- The bundle must work with no `configureZocdoc` call and no token when every component on the page is supplied.

## Testing

- Per TEST-001/002: component tests in the browser project, client layer mocked.
- For each supplied-mode component: renders supplied data; makes **no** client call (assert the mocked endpoint is
  never invoked, including after inputs change); `[]` renders empty, not error; `loading` shows and announces the
  loading state; the request events carry the right detail.
- For hydration: a JSON block renders the same as setting the property (screenshot or DOM equality); property set
  before upgrade wins; a non-allow-listed `data-zd-prop` is ignored; malformed JSON falls back without logging
  content; patient and appointment components ignore blocks entirely.
- Handoff: an unhandled slot tap and "Book now" navigate (stub navigation); `preventDefault()` and `disable-handoff`
  stop it; property-driven components never navigate or show "Book now"; paging and window controls are hidden in
  handoff mode and shown with `interactive`; non-`https:` URLs are never followed.
- axe-core on supplied and hydrated states (A11Y-005). Test data from the documented testing scenarios only
  (TEST-003).
- Perf benchmarks (TEST-004) gain a supplied-data case per changed component.

## Left to the builder

- How the host reports a failed cancel or reschedule in `zd-appointment`'s supplied mode (an `actionError` property
  the host sets, or a method). Either is fine if the user-facing message stays the component's own, not raw API text
  (CLIENT-003).
- How the reschedule picker inside `zd-appointment` receives supplied timeslots.
- The name and location of the shared hydration helper.
