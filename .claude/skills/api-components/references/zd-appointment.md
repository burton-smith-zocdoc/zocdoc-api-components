# zd-appointment

Looks up a booked appointment by ID and lets the patient cancel it or move it to a new
time.

It fetches its own appointment, the way the availability picker fetches its own times, so
it can be the whole of a "manage your appointment" page (COMP-004). Reschedule embeds the
picker locked to the appointment's location, visit reason and patient type, because the
API moves only the time. Times for anything else would be rejected.

Neither action retries by itself. The API doesn't document either as idempotent, so each
one sends at most one request at a time.

**Supplied mode.** A host page that already has the appointment, such as an MCP server
answering a tool call, sets `appointment` instead. From then on the component never calls the
API: cancel and reschedule emit a request event, show their busy state, and wait for the host
to set an updated `appointment` or `actionError`. The mode latches, so there is no way back to
the API calls. The appointment is property-only and never read from markup (PHI-001).

**Class** `ZdAppointment` — **Package** `@zocdoc/api-components`

```html
<zd-appointment></zd-appointment>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `appointment-id` | `appointmentId` | `string` | — | The appointment to load. Changing it reloads. |
| `hide-photo` | `hidePhoto` | `boolean` | `false` | Leaves the provider's photo out, as on `zd-provider-card`. |
| `provider-name` | `providerName` | `string` | — | Who the appointment is with, shown until the provider lookup succeeds and kept if it fails. The component looks the provider up itself, so this is optional. |
| — | `actionError` | `string` | — | Set by the host page in supplied mode when the requested cancel or reschedule failed. Every time it's set to a value, the pending action fails, even with the same text as last time, so the host never has to clear it. The component never writes it. It shows its own copy for the action and emits `appointment-error`, never this string, because a host's error text can be developer-facing or echo request data (CLIENT-003, PHI-001). |
| — | `appointment` | `AppointmentDetails` | — | The appointment to show, when the host page already has it. Setting it puts the component in supplied mode for the rest of its life: it never calls the API again, and cancel and reschedule emit request events for the host page to answer. The host answers an action by setting this to the updated appointment. The component works out the outcome from the status, as it does from the API's answer. |
| — | `providerLocation` | `ProviderLocation` | — | The appointment's provider, when the host page has it. Skips the provider lookup. |
| — | `rescheduleTimeslots` | `readonly AvailabilitySlot[]` | — | Times for the reschedule picker in supplied mode. Until it's set the picker shows its loading state. The picker's `availability-request` event reaches the host page, which answers by setting this. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `appointment-cancel` | `CustomEvent<AppointmentCancelDetail>` | Emitted with `{ appointmentId, status }` once cancelled. |
| `appointment-cancel-request` | `CustomEvent<AppointmentCancelRequestDetail>` | Emitted with `{ appointmentId, reasonType? }` in supplied mode when the patient confirms a cancel. The host page cancels it and sets the updated `appointment`, or sets `actionError`. |
| `appointment-error` | `CustomEvent<AppointmentErrorDetail>` | Emitted with `{ error, action, status? }` when a lookup, cancel or reschedule fails. |
| `appointment-reschedule` | `CustomEvent<AppointmentRescheduleDetail>` | Emitted with `{ appointmentId, status, startTime }` once moved. |
| `appointment-reschedule-request` | `CustomEvent<AppointmentRescheduleRequestDetail>` | Emitted with `{ appointmentId, startTime }` in supplied mode when the patient confirms a new time. The host page moves it and sets the updated `appointment`, or sets `actionError`. |
| `availability-request` | `CustomEvent<AvailabilityRequestDetail>` | Emitted with `{ providerLocationId, visitReasonId, patientType, startDate, days }` in supplied mode when the patient opens reschedule and no `rescheduleTimeslots` are set. The host page answers by setting them. The embedded picker emits the same event when the patient moves its window. |

## Methods

| Method | Description |
| --- | --- |
| `cancel(reasonType?: 'patient_no_longer_needs_appointment' \| 'patient_no_longer_available' \| 'other_patient_reason' \| 'missing_needed_patient_information' \| 'payment_or_insurance_issue' \| 'patient_or_visit_type_not_accepted' \| 'provider_not_available' \| 'rescheduling_patient' \| 'other_provider_reason' \| undefined): Promise<void>` | Cancels the loaded appointment. Public so a host page can drive it. Returns without a request while another action is in flight. |
| `load(): Promise<void>` | Fetches the appointment. Safe to call repeatedly. Stays idle without an ID. |
| `reschedule(startTime: string): Promise<void>` | Moves the loaded appointment to `startTime`, which must be a slot from its own location, visit reason and patient type. Returns without a request while another action is in flight. |

## CSS Parts

| Part | Description |
| --- | --- |
| `action-error` | The alert shown when an action fails. |
| `actions` | The row of action buttons. |
| `appointment-status` | The status, in patient words. |
| `back` | The button that backs out of rescheduling. |
| `cancel` | The "Cancel appointment" button. |
| `cancel-form` | The cancel confirmation form. |
| `confirm-cancel` | The button that sends the cancel. |
| `confirm-reschedule` | The button that sends the new time. |
| `details` | The list of appointment details. |
| `heading` | The panel heading. |
| `keep` | The button that backs out of cancelling. |
| `notice` | The polite live region announcing a completed action. |
| `panel` | The container for every mode, and the focus target on each mode change. |
| `phone` | The practice's phone number, as a `tel:` link. |
| `picker` | The embedded availability picker. |
| `provider` | The provider row's value: the looked-up summary, or `provider-name` as a fallback. |
| `provider-detail` | The text column beside the photo. |
| `provider-location` | The address, or "Video visit". |
| `provider-name` | The provider's name and credential. |
| `provider-photo` | The provider's photo, unless `hide-photo` is set. |
| `provider-specialty` | The provider's first specialty. |
| `provider-summary` | The looked-up provider block. |
| `reason` | The cancellation reason select. |
| `reference` | The confirmation number. |
| `reschedule` | The "Change time" button. |
| `waiting-room` | The link to a video visit's waiting room. |
| `when` | The appointment's date and time, in the provider's zone. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
