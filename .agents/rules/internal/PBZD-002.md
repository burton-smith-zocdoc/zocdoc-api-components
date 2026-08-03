# PBZD-002: Extend CharmElement for API components

API components extend `CharmElement` from `@charm-ux/core`, not `LitElement` directly. This provides scope registration, the `emit()` helper, `dir` handling, `dependencies`, and the `ready` event.

Choose the appropriate base class from Charm's hierarchy:

| Base class               | Use for                                           |
| ------------------------ | ------------------------------------------------- |
| `CharmElement`           | Data display, containers (results, confirmation)  |
| `CharmFocusableElement`  | Interactive triggers (buttons in overlays)        |
| `CharmFormControlElement`| Never — composite forms use multiple form controls|

`zd-patient-form` extends `CharmElement`, not `CharmFormControlElement`. A form-control element represents a single value; the patient form is a composite of ten fields that emits one object. It composes Charm's `input` and `select` controls.

**Do:**

```ts
import { CharmElement } from '@charm-ux/core';

export class ZdProviderResults extends CharmElement {
  public static override baseName = 'provider-results';
}
```

**Don't:**

```ts
import { LitElement } from 'lit';

// Loses scope registration, emit(), dependencies
export class ZdProviderResults extends LitElement { }
```

See also: [PBZD-003](./PBZD-003.md), [COMP-003](../component-design/COMP-003.md)
