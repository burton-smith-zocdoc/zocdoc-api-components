# COMP-004: Standalone-capable children

Every child component works standalone — set its properties, listen for its event — because no child reaches upward for anything.

This enables:
- Independent testing without the parent
- Consumer composition (wire the five components yourself)
- Future extension without breaking existing integrations

**Do:**

```ts
// Works inside zd-booking
<zd-booking></zd-booking>

// Also works standalone
<zd-provider-search
  zip-code="10011"
  specialty-id="123"
  @provider-results="${handleResults}"
></zd-provider-search>

<zd-availability-picker
  provider-location-id="456"
  visit-reason-id="789"
  @slot-select="${handleSlot}"
></zd-availability-picker>
```

```ts
// Child validates its own required props, doesn't assume parent provides them
willUpdate(changedProperties: PropertyValues) {
  if (changedProperties.has('providerLocationId') && !this.providerLocationId) {
    this.state = 'idle';
    return;
  }
  this.fetchAvailability();
}
```

**Don't:**

```ts
// ❌ Child assumes parent context
connectedCallback() {
  const flow = this.closest('zd-booking');
  if (!flow) throw new Error('Must be inside zd-booking');
}

// ❌ Child reads from sibling
const search = this.parentElement?.querySelector('zd-provider-search');
this.zipCode = search?.zipCode;
```

See also: [COMP-002](./COMP-002.md)
