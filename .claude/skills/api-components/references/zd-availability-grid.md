# zd-availability-grid

A window of days with the number of appointments open on each — the shape a patient scans to
find a day worth opening, before caring what the times are.

**Two ways in.** Given `timeslots`, it counts what it was handed and fetches nothing: that is
how it sits inside a results list, where the parent makes one batched `getAvailability` call
for the whole page and hands each card its own slots (COMP-002). Given a
`provider-location-id` and a `visit-reason-id` instead, it fetches its own window, which is
what a provider profile needs. The discriminator is `timeslots`: a component that has been
given slots has no reason to ask for more.

**The window pager is reported and, when self-fetching, also performed.** Moving it always
updates `start-date` and emits `window-change`; a parent that supplied `timeslots` is expected
to fetch that range and hand back new ones. This component cannot do it for them, because
without a visit reason there is nothing the API would accept.

The day cells stay visible in the empty state rather than being replaced by the message. The
window is derived from dates, not from data, so it is still true — and it is the only way to
page to a range that does have appointments.

**Class** `ZdAvailabilityGrid` — **Module** `src/components/availability-grid/availability-grid.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-availability-grid></zd-availability-grid>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `days` | `days` | `number` | `14` | How many days the window covers, counting the first. Fourteen is two rows of seven, which is the shape the production UI uses; clamped to the 30 the API allows. |
| `hide-window` | `hideWindow` | `boolean` | `false` | Drops this component's own window control, leaving the days. What a results list sets on every card: the production search page has one range control above the list governing every provider in it, not ten of them disagreeing. The pager still works through `shiftWindow` and `start-date`, so whoever owns the shared control drives all of them by binding the same `start-date` down. Named for what it does rather than as `show-window`, which would default to true and could then never be turned off through an attribute — a boolean attribute's presence is its value. |
| `patient-type` | `patientType` | `'new' \| 'existing'` | `'new'` | — |
| `provider-location-id` | `providerLocationId` | `string \| undefined` | — | The `pr_…\|lo_…` pair the days belong to. Required to fetch, and carried on `day-select` either way, so a parent-driven grid still says which card the patient picked a day on. |
| `selected-day` | `selectedDay` | `string \| undefined` | — | The day currently open, if any. Settable so a host page can restore it (COMP-004). |
| `show-more` | `showMore` | `boolean` | `false` | Renders the "More" control. Off by default: it is only meaningful when the host page has somewhere for it to go, and a control that does nothing is worse than no control. |
| `start-date` | `startDate` | `string \| undefined` | — | The first day on show, as `YYYY-MM-DD`. Defaults to today, and moves when the range does. A day key rather than a `Date` because that is what the API takes and what the slots are grouped by, so nothing has to be converted to compare them. |
| `visit-reason-id` | `visitReasonId` | `string \| undefined` | — | Required by the API — availability is always for a specific visit reason. Setting it is also what asks this component to fetch for itself; a parent-driven grid leaves it off. |
| — | `addEventListener` | `TypedEventTarget<ZdAvailabilityGridEventMap>['addEventListener']` | — | — |
| — | `removeEventListener` | `TypedEventTarget<ZdAvailabilityGridEventMap>['removeEventListener']` | — | — |
| — | `timeslots` | `readonly AvailabilitySlot[] \| undefined` | — | The slots to count, when a parent already has them. Named for the API field it comes from, both because that is where a caller gets it and because `slots` in a web component means something else entirely. `undefined` means "not supplied", which is what allows this component to fetch its own; `[]` means "supplied, and there are none", which renders an empty window and asks for nothing. The two are deliberately different, so a parent mid-request should hand back `[]` rather than dropping the binding. `readonly` because nothing here writes to it and a parent with many cards may well hand the same empty array to all of them — which `zd-provider-results` does. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `availability-error` | `unknown` | Emitted with `{ error }` when this component's own request fails. |
| `day-select` | `unknown` | Emitted with `{ day, providerLocationId }` when a day with appointments is chosen. `day` is a `YYYY-MM-DD` key in the provider's own local time. |
| `more-select` | `unknown` | Emitted when "More" is pressed, and only rendered when `show-more` is set. Where that goes is the host page's business — a profile, a full calendar — so nothing here navigates. |
| `window-change` | `unknown` | Emitted with `{ startDate, endDate }` when the range moves. Both are `YYYY-MM-DD` and inclusive, ready to pass to `getAvailability`. |

## Methods

| Method | Description |
| --- | --- |
| `load(): Promise<void>` | Fetches the window. Safe to call repeatedly, and does nothing at all when a parent supplied `timeslots` or when there is no visit reason to fetch against. |
| `shiftWindow(direction: -1 \| 1): void` | Moves the window by its own width, so the ranges tile rather than overlap. |

## CSS Parts

| Part | Description |
| --- | --- |
| `day` | One day cell. |
| `day-count` | The appointment count line of a cell. |
| `day-date` | The month and day line of a cell. |
| `day-weekday` | The weekday line of a cell. |
| `days` | The grid of days. |
| `more` | The "More" control, when `show-more` is set. |
| `window` | The header holding the range and its controls. |
| `window-next` | The control moving the range forward. |
| `window-previous` | The control moving the range back. |
| `window-range` | The line naming the range on show. |
