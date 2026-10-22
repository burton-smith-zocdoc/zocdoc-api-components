# zd-availability-picker

Fetches bookable timeslots for one provider location and renders them for the patient to
choose from. No calendar primitive is involved — the booking flow needs a list of times, and
that is a list of buttons.

**Two layouts.** `strip` is a row of days with the selected day's times beneath it, which is
what fits in a step of a flow. `stacked` is every day of the window in order, each with its own
heading and its times under it, which is the shape of the production booking modal: nothing is
hidden behind a day that has to be pressed first. Closed days appear in `stacked` too, as one
span apiece — "Sat, Aug 8 – Tue, Aug 11 / No available appointments" — because a day quietly
missing from the list is indistinguishable from a window that ends early.

**Patient type is a control, not just a property.** It changes which slots the API returns, so
a patient who sees nothing bookable needs it within reach — often switching it is the fix. It
stays rendered in the empty and error states for exactly that reason, and setting it refetches.

Emits the chosen slot rather than booking it, so it composes with `zd-patient-form` or
with a host page that owns its own booking step (COMP-002).

**Handoff.** A picker whose slots came from a JSON block has nobody listening to book with, so
a tap goes to Zocdoc: the slot's `booking_url`, or the provider's `profile_url` when the slot
has none (`booking_url` is often null). `disable-handoff` turns that off. The patient-type
control is hidden in that mode too, since nobody would answer its `availability-request`;
`interactive` shows it again for a page that will.

**Class** `ZdAvailabilityPicker` — **Package** `@zocdoc/api-components`

```html
<zd-availability-picker></zd-availability-picker>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `days` | `days` | `number` | `7` | Size of the availability window in days, counting the first. Clamped to the API's 30. |
| `disable-handoff` | `disableHandoff` | `boolean` | `false` | Stops a picker hydrated from markup from sending a slot tap to Zocdoc. |
| `hide-patient-type` | `hidePatientType` | `boolean` | `false` | Drops the New/Existing patient control, leaving the times. What a host page sets when it asks the question itself — the production booking modal has one control governing the whole panel, not one per section — and it then binds `patient-type` down. Named for what it does rather than as `show-patient-type`, which would default to true and could then never be turned off through an attribute: a boolean attribute's presence is its value. |
| `interactive` | `interactive` | `boolean` | `false` | Says the page will answer `availability-request` itself, so a picker hydrated from markup keeps its patient-type control. |
| `layout` | `layout` | `'strip' \| 'stacked'` | `'strip'` | How the days are laid out. `strip` shows one day at a time behind a row of day buttons; `stacked` shows every day of the window at once, each with its own heading. |
| `loading` | `loading` | `boolean` | `false` | Whether the host is loading availability it supplies through `timeslots`. Set this while replacing supplied slots to keep stale times out of view and announce loading. It does not start a request. |
| `patient-type` | `patientType` | `'new' \| 'existing'` | `'new'` | Which patient the times are for. Also the value of the rendered control, so setting it is both how a host page pre-selects an answer and what the control writes back. |
| `provider-location-id` | `providerLocationId` | `string` | — | The `pr_…\|lo_…` pair to fetch availability for. Nothing is fetched without it. |
| `selected-start-time` | `selectedStartTime` | `string` | — | The chosen slot's `start_time`. Settable so a host page that already knows the selection can restore it, which is what makes going back a step work (COMP-004). |
| `start-date` | `startDate` | `string` | — | The first day to ask for, as `YYYY-MM-DD`. Defaults to today, and falls back to today for anything unparseable. A day key rather than an offset from today, because that is what the API takes and what the slots are grouped by — nothing has to be converted to compare them. A host page that wants the window to open tomorrow, as the production detail panel does, sets tomorrow's key. |
| `visit-reason-id` | `visitReasonId` | `string` | — | Required by the API — availability is always for a specific visit reason. |
| — | `provider` | `ProviderLocation` | — | The provider the slots belong to. Only read for its `profile_url`, where a slot tap goes in handoff mode when the slot has no `booking_url`. |
| — | `timeslots` | `readonly AvailabilitySlot[]` | — | The slots to show, when the host page already has them. `undefined` means "not supplied", which lets this component fetch its own; `[]` means "supplied, and there are none", which renders the empty state and asks for nothing. While supplied, a change to the window or the patient type emits `availability-request` instead of fetching. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `availability-error` | `CustomEvent<ErrorDetail>` | Emitted with `{ error }` when the request fails. |
| `availability-request` | `CustomEvent<AvailabilityRequestDetail>` | Emitted with `{ providerLocationId, visitReasonId, patientType, startDate, days }` instead of a fetch when `timeslots` is supplied and one of those inputs changes. The host page answers by setting `timeslots` again. |
| `patient-type-change` | `CustomEvent<PatientTypeChangeDetail>` | Emitted with `{ patientType }` when the New/Existing control is used. A host page that books through its own step should follow it, since the same value has to go to `POST /v1/appointments`. |
| `slot-select` | `CustomEvent<SlotSelectDetail>` | Emitted with `{ startTime, providerLocationId }` when a time is chosen. `startTime` is the API's own string, offset included, so it can be handed back to `POST /v1/appointments` unmodified. Cancelable: `preventDefault()` stops the handoff to Zocdoc. |

## Methods

| Method | Description |
| --- | --- |
| `load(): Promise<void>` | Fetches availability. Safe to call repeatedly; stays idle without both ids. |

## CSS Parts

| Part | Description |
| --- | --- |
| `day` | One day button. `strip` layout only. |
| `day-empty` | The line shown for a span with nothing open. `stacked` layout only. |
| `day-group` | One day, or one span of closed days. `stacked` layout only. |
| `day-groups` | The list of day groups. `stacked` layout only. |
| `day-heading` | The line naming a group's day or span. `stacked` layout only. |
| `days` | The strip of days with availability. `strip` layout only. |
| `loading-days` | The placeholder days shown while availability loads. |
| `patient-type` | The New/Existing patient control. |
| `patient-type-option` | One option of that control. |
| `skeleton` | One placeholder heading or time inside them. |
| `slot` | One timeslot button. |
| `slots` | A list of times. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
