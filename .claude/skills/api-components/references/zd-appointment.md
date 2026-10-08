# zd-appointment

Looks up a booked appointment by ID and lets the patient cancel it or move it to a new
time.

It fetches its own appointment, the way the availability picker fetches its own times, so
it can be the whole of a "manage your appointment" page (COMP-004). Reschedule embeds the
picker locked to the appointment's location, visit reason and patient type, because the
API moves only the time. Times for anything else would be rejected.

Neither action retries by itself. The API doesn't document either as idempotent, so each
one sends at most one request at a time.

**Class** `ZdAppointment` — **Package** `@zocdoc/api-components`

```html
<zd-appointment></zd-appointment>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `appointment-id` | `appointmentId` | `string` | — | The appointment to load. Changing it reloads. |
| `provider-name` | `providerName` | `string` | — | Who the appointment is with. The lookup doesn't return a name, so the host passes it. |
| — | `addEventListener` | `TypedEventTarget<ZdAppointmentEventMap>['addEventListener']` | — | — |
| — | `removeEventListener` | `TypedEventTarget<ZdAppointmentEventMap>['removeEventListener']` | — | — |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `appointment-cancel` | `Event` | Emitted with `{ appointmentId, status }` once cancelled. |
| `appointment-error` | `Event` | Emitted with `{ error, action, status? }` when a lookup, cancel or reschedule fails. |
| `appointment-reschedule` | `Event` | Emitted with `{ appointmentId, status, startTime }` once moved. |

## Methods

| Method | Description |
| --- | --- |
| `cancel(reasonType?: 'patient_no_longer_needs_appointment' \| 'patient_no_longer_available' \| 'other_patient_reason' \| 'missing_needed_patient_information' \| 'payment_or_insurance_issue' \| 'patient_or_visit_type_not_accepted' \| 'provider_not_available' \| 'rescheduling_patient' \| 'other_provider_reason' \| undefined): Promise<void>` | Cancels the loaded appointment. Public so a host page can drive it. Returns without a request while another action is in flight. |
| `load(): Promise<void>` | Fetches the appointment. Safe to call repeatedly. Stays idle without an ID. |
| `reschedule(startTime: string): Promise<void>` | Moves the loaded appointment to `startTime`, which must be a slot from its own location, visit reason and patient type. Returns without a request while another action is in flight. |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-action-error` | The alert shown when an action fails. |
| `zd-actions` | The row of action buttons. |
| `zd-appointment-status` | The status, in patient words. |
| `zd-back` | The button that backs out of rescheduling. |
| `zd-cancel` | The "Cancel appointment" button. |
| `zd-cancel-form` | The cancel confirmation form. |
| `zd-confirm-cancel` | The button that sends the cancel. |
| `zd-confirm-reschedule` | The button that sends the new time. |
| `zd-details` | The list of appointment details. |
| `zd-heading` | The panel heading. |
| `zd-keep` | The button that backs out of cancelling. |
| `zd-notice` | The polite live region announcing a completed action. |
| `zd-panel` | The container for every mode, and the focus target on each mode change. |
| `zd-picker` | The embedded availability picker. |
| `zd-provider` | The provider name, when `provider-name` is set. |
| `zd-reason` | The cancellation reason select. |
| `zd-reference` | The confirmation number. |
| `zd-reschedule` | The "Change time" button. |
| `zd-when` | The appointment's date and time, in the provider's zone. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
