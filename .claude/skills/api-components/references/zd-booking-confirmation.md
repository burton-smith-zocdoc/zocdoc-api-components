# zd-booking-confirmation

Renders the outcome of a booking. Presentational only — it fetches nothing, so it has no
request state and needs no token.

Everything it shows arrives as an attribute, which is what lets a host page put it on a
standalone confirmation page as plain markup rather than only at the end of a flow
(COMP-004). It emits nothing: there is nothing left to decide.

**Class** `ZdBookingConfirmation` — **Module** `src/components/booking-confirmation/booking-confirmation.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-booking-confirmation></zd-booking-confirmation>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `appointment-id` | `appointmentId` | `string \| undefined` | — | The booked appointment's id, which is the number a patient quotes to the practice. |
| `provider-name` | `providerName` | `string \| undefined` | — | Who the appointment is with. Omitted rather than guessed at when absent. |
| `start-time` | `startTime` | `string \| undefined` | — | The appointment's start, as the API returned it — offset included, unmodified. The offset is the provider's, and is what makes the displayed time theirs. |
| `status` | `status` | `'pending_booking' \| 'confirmed' \| 'booking_failed' \| 'cancelled' \| 'no_show' \| 'pending_reschedule' \| 'rescheduled' \| 'reschedule_failed'` | `'confirmed'` | The `appointment_status` from the booking response. Defaults to `confirmed` because a host page rendering this component by hand has already decided the booking worked; a flow passing the API's own value through gets the pending wording for free. |
