# zd-booking-flow

Coordinates the booking funnel: search → time → details → confirmation.

It owns the flow's state and the only write call in the library, and it talks to its
children through properties down and events up — no context protocol, no reaching into a
child, no shared store (COMP-002). Each child still works on its own, which is what lets a
host page assemble its own funnel instead of using this one (COMP-004).

**The step is derived, never assigned.** `startTime` implies the patient step the way
`appointment` implies the confirmation, so there is no `step` field to fall out of sync with
the data, and a host page resuming a half-finished booking only has to set the properties it
already has. The cost is that going back has to clear what it goes back past — which is
correct anyway, since a different provider invalidates the slot picked from the old one.

**Class** `ZdBookingFlow` — **Module** `src/components/booking-flow/booking-flow.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-booking-flow></zd-booking-flow>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `insurance-plan-id` | `insurancePlanId` | `string \| undefined` | — | — |
| `page` | `page` | `number` | `0` | The zero-indexed page in hand. Bound down to both children so they cannot disagree. |
| `page-size` | `pageSize` | `unknown` | `DEFAULT_PAGE_SIZE` | Results per page, forwarded to the search that requests them and to the list that pages through them. Updated from what the API says it used, since it is free to clamp. |
| `patient-type` | `patientType` | `'new' \| 'existing'` | `'new'` | Whether the patient is new to the practice. Affects which slots are bookable. |
| `provider-location-id` | `providerLocationId` | `string \| undefined` | — | The chosen `pr_…\|lo_…`. Setting it advances the flow to the time step. |
| `specialty-id` | `specialtyId` | `string \| undefined` | — | The specialty the flow opens on. Kept in step with what the patient searched. The search endpoint requires this or a visit reason, so a flow that opens on neither cannot search until the patient chooses one. |
| `start-time` | `startTime` | `string \| undefined` | — | The chosen slot's `start_time`, verbatim from the API. Setting it advances to the form. |
| `total-count` | `totalCount` | `number \| undefined` | — | How many providers the search matched in total, which is what the results list needs to count them and to know where its pager ends. Undefined until a search returns, and left undefined by a host page handing in `providers` with no total — in which case the list renders neither the count nor the pager rather than presenting one page as the whole answer. |
| `visit-reason-id` | `visitReasonId` | `string \| undefined` | — | Narrows the search and, more importantly, is required for availability and booking. When the patient searched for "Any reason" this stays undefined, and the flow falls back to the reason the API resolved for the search, then to the chosen provider's `default_visit_reason_id` — see effectiveVisitReasonId. |
| `zip-code` | `zipCode` | `string` | `''` | The ZIP code the flow opens on. Kept in step with what the patient searched. |
| — | `addEventListener` | `TypedEventTarget<ZdBookingFlowEventMap>['addEventListener']` | — | — |
| — | `providers` | `ProviderLocation[]` | `[]` | The last search's results. Public so a host page that ran its own search can hand them in and start the flow at the list. One page of them. `totalCount` is how many the search matched. |
| — | `removeEventListener` | `TypedEventTarget<ZdBookingFlowEventMap>['removeEventListener']` | — | — |
| — | `step` | `'search' \| 'time' \| 'patient' \| 'booked'` | — | Which step the current data puts the patient on. Reading the furthest-satisfied precondition rather than tracking a cursor is what makes the two impossible to desync. (readonly) |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `availability-error` | `unknown` | Emitted with `{ error }` when the batched availability request for the results list fails. Nothing is rendered for it — the list keeps working without day counts — so this event is the only notice a host page gets. Same caution about the `error`. |
| `booking-complete` | `unknown` | Emitted with `{ appointmentId, status }` once the API has taken the appointment. `status` is `confirmed` or `pending_booking`; both are bookings, and the difference is whether the practice has accepted yet, so a host page that treats them alike is telling some patients the wrong thing. |
| `booking-error` | `unknown` | Emitted with `{ error, status }` when the booking does not happen. `status` is present when the API answered 200 with a status that is not a booking, and absent when the request itself failed. Named `booking-error` rather than `error` because `error` is a native event name that already fires on this element for failed resource loads, and a listener could not tell the two apart (COMP-003). The `error` it carries is the client's own, whose body can echo submitted values — do not log it wholesale (PHI-001). |

## Methods

| Method | Description |
| --- | --- |
| `back(): void` | Returns to the previous step by dropping what that step decided. Clearing is the point rather than a side effect. Going back past a provider has to discard the slot picked from it — the times belong to that location, and carrying one forward would book an appointment nobody chose. The visible cost is that the picker refetches on the way back in, which is worth paying for a flow whose state cannot lie. |
| `book(patient: Patient, notes?: string): Promise<void>` | Books the appointment. Public so a host page driving the form itself can still finish. Every `return` here is a refusal to send an incomplete or duplicate booking, which is the one request in this library that cannot be undone by making it again — a second POST books a second appointment. `zd-patient-form` disables its own button while `busy`, so this guard covers what that cannot: a programmatic caller, or a second submit racing the first. |

## CSS Parts

| Part | Description |
| --- | --- |
| `back` | The button returning to the previous step. |
| `confirmation` | The booking confirmation. |
| `error` | The alert shown when a booking fails. |
| `patient-form` | The patient details form. |
| `picker` | The availability picker. |
| `provider-summary` | The provider block inside the summary, shared with `zd-provider-results` — see `internal/provider-summary.ts` for its inner parts. |
| `results` | The provider results list. |
| `search` | The provider search form. |
| `status` | The live region announcing that a booking is in flight. |
| `step` | The current step's container, and the focus target on every transition. |
| `step-heading` | The current step's heading. |
| `summary` | The block restating what is about to be booked. |
| `summary-time` | The appointment time, on the patient step. |
