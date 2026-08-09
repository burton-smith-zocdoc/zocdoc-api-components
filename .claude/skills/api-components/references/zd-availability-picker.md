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

**Class** `ZdAvailabilityPicker` — **Module** `src/components/availability-picker/availability-picker.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-availability-picker></zd-availability-picker>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `days` | `days` | `number` | `7` | Size of the availability window in days, counting the first. Clamped to the API's 30. |
| `hide-patient-type` | `hidePatientType` | `boolean` | `false` | Drops the New/Existing patient control, leaving the times. What a host page sets when it asks the question itself — the production booking modal has one control governing the whole panel, not one per section — and it then binds `patient-type` down. Named for what it does rather than as `show-patient-type`, which would default to true and could then never be turned off through an attribute: a boolean attribute's presence is its value. |
| `layout` | `layout` | `'strip' \| 'stacked'` | `'strip'` | How the days are laid out. `strip` shows one day at a time behind a row of day buttons; `stacked` shows every day of the window at once, each with its own heading. |
| `patient-type` | `patientType` | `'new' \| 'existing'` | `'new'` | Which patient the times are for. Also the value of the rendered control, so setting it is both how a host page pre-selects an answer and what the control writes back. |
| `provider-location-id` | `providerLocationId` | `string \| undefined` | — | The `pr_…\|lo_…` pair to fetch availability for. Nothing is fetched without it. |
| `selected-start-time` | `selectedStartTime` | `string \| undefined` | — | The chosen slot's `start_time`. Settable so a host page that already knows the selection can restore it, which is what makes going back a step work (COMP-004). |
| `start-date` | `startDate` | `string \| undefined` | — | The first day to ask for, as `YYYY-MM-DD`. Defaults to today, and falls back to today for anything unparseable. A day key rather than an offset from today, because that is what the API takes and what the slots are grouped by — nothing has to be converted to compare them. A host page that wants the window to open tomorrow, as the production detail panel does, sets tomorrow's key. |
| `visit-reason-id` | `visitReasonId` | `string \| undefined` | — | Required by the API — availability is always for a specific visit reason. |
| — | `addEventListener` | `TypedEventTarget<ZdAvailabilityPickerEventMap>['addEventListener']` | — | — |
| — | `removeEventListener` | `TypedEventTarget<ZdAvailabilityPickerEventMap>['removeEventListener']` | — | — |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `availability-error` | `unknown` | Emitted with `{ error }` when the request fails. |
| `patient-type-change` | `unknown` | Emitted with `{ patientType }` when the New/Existing control is used. A host page that books through its own step should follow it, since the same value has to go to `POST /v1/appointments`. |
| `slot-select` | `unknown` | Emitted with `{ startTime, providerLocationId }` when a time is chosen. `startTime` is the API's own string, offset included, so it can be handed back to `POST /v1/appointments` unmodified. |

## Methods

| Method | Description |
| --- | --- |
| `load(): Promise<void>` | Fetches availability. Safe to call repeatedly; stays idle without both ids. |
