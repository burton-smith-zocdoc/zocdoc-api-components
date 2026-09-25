# zd-booking-confirmation

Renders the outcome of a booking. Presentational only — it fetches nothing, so it has no
request state and needs no token.

Everything it shows arrives as an attribute, which is what lets a host page put it on a
standalone confirmation page as plain markup rather than only at the end of a flow
(COMP-004). It emits nothing: there is nothing left to decide.

**Class** `ZdBookingConfirmation` — **Package** `@zocdoc/api-components`

```html
<zd-booking-confirmation></zd-booking-confirmation>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `appointment-id` | `appointmentId` | `string` | — | The booked appointment's id, which is the number a patient quotes to the practice. |
| `provider-name` | `providerName` | `string` | — | Who the appointment is with. Omitted rather than guessed at when absent. |
| `start-time` | `startTime` | `string` | — | The appointment's start, as the API returned it — offset included, unmodified. The offset is the provider's, and is what makes the displayed time theirs. |
| `status` | `status` | `'pending_booking' \| 'confirmed' \| 'booking_failed' \| 'cancelled' \| 'no_show' \| 'pending_reschedule' \| 'rescheduled' \| 'reschedule_failed'` | — | The `appointment_status` from the booking response. Defaults to `confirmed` because a host page rendering this component by hand has already decided the booking worked; a flow passing the API's own value through gets the pending wording for free. |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-confirmation` | The alert wrapping the whole confirmation. |
| `zd-detail` | The line qualifying a pending request. |
| `zd-provider` | The line naming the provider. |
| `zd-reference` | The line carrying the confirmation number. |
| `zd-when` | The appointment's date and time. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
