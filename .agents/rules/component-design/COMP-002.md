# COMP-002: Props in, events out

Composition model: attributes and properties in, events out. No context protocol, no shared state container.

`zd-booking` holds flow state and renders children with direct Lit property bindings. No child discovery, no protocol. Every child also works standalone.

**Do:**

```ts
// Parent binds properties and listens for events
render() {
  return this.html`
    <scoped-availability-picker
      .providerLocationId=${this.state.providerLocationId}
      .visitReasonId=${this.visitReasonId}
      @slot-select=${this.#onSlotSelect}
    ></scoped-availability-picker>
  `;
}

// Child is self-contained
#handleSlotClick(slot: TimeSlot) {
  this.selectedSlot = slot;
  this.emit('slot-select', { detail: { slot } });
}
```

**Don't:**

```ts
// ❌ Child reaching upward for context
connectedCallback() {
  super.connectedCallback();
  this.bookingContext = this.closest('zd-booking')?.context;
}

// ❌ Shared mutable state
import { bookingStore } from '../store.js';
this.providerLocationId = bookingStore.providerLocationId;
```

**Known limitation, accepted:** slotted custom composition does not auto-wire. Reordering steps or injecting your own markup between them means composing the children yourself and wiring the events. This is a deferral, not a dead end — adding a context provider later is purely additive.

See also: [COMP-003](./COMP-003.md), [COMP-004](./COMP-004.md)
