# COMP-003: Emit events through base emit() helper

Components communicate outward with `CustomEvent`s dispatched through the base class `emit()` helper. Never `new CustomEvent(...)` + `dispatchEvent` by hand.

`emit()` applies Charm's defaults (`bubbles: true`, `cancelable: false`, `composed: true`), all overridable per call. `composed: true` lets the event cross the shadow boundary to reach consumers.

Event naming: use `{component}-{action}` pattern (`provider-select`, `slot-select`, `booking-complete`).

**Do:**

```ts
// Typed event wrapper
protected emitSlotSelect(slot: TimeSlot) {
  this.emit('slot-select', { detail: { slot } });
}

// Error event for observability
this.emit('error', { 
  detail: { 
    message: 'Failed to load availability',
    code: 'AVAILABILITY_ERROR' 
  }
});
```

**Don't:**

```ts
// ❌ Bypasses Charm defaults; non-composed event never escapes shadow root
this.dispatchEvent(new CustomEvent('slot-select', { detail: { slot } }));

// ❌ Prefixed event name
this.emit('zd-slot-select');
```

Events emitted by these components:

| Component               | Event             | Detail                           |
| ----------------------- | ----------------- | -------------------------------- |
| `zd-provider-search`    | `provider-results`| `{ providers: ProviderLocation[] }` |
| `zd-provider-results`   | `provider-select` | `{ provider: ProviderLocation }` |
| `zd-availability-picker`| `slot-select`     | `{ slot: TimeSlot }`             |
| `zd-patient-form`       | `patient-submit`  | `{ patient: Patient }`           |
| `zd-booking-flow`       | `booking-complete`| `{ appointmentId: string }`      |
| (any)                   | `error`           | `{ message: string, code: string }` |

See also: [PBZD-002](../internal/PBZD-002.md), [COMP-002](./COMP-002.md)
