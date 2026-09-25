# PBZD-001: Configure prefix before importing components, and never import a Charm barrel

Charm's `CharmScope.registerComponent()` computes tag names from `this.prefix` at call time and immediately calls `customElements.define()`. Custom elements cannot be unregistered, and `project.updateProject()` does not re-register anything already defined.

Any Charm component **barrel** imported before the prefix is set is permanently `ch-`-prefixed, and setting the prefix afterward will not correct it. The result would be a silently half-prefixed library.

Two rules follow, and the second is what actually removes the hazard.

## 1. Configuration lives in its own module that imports no component modules

```ts
// packages/primitives/src/configure.ts — side effect only, NO component imports
import { project } from '@charm-ux/core';

project.updateProject({ prefix: 'zd', tokenPrefix: 'zd' });
```

```ts
// packages/primitives/src/index.ts — the configure import must stay first
import './configure.js';

export * from './tokens.js';
export * from './charm.js';
export { project, CharmElement } from '@charm-ux/core';
```

Importing `@charm-ux/core`'s root entry is safe: it exports base, controller, internal, theme, and utilities — no components.

## 2. Import `Zd*` classes from the primitives package, never a Charm barrel

Each primitive is a `Zd*` subclass of a Charm `Core*` class, defined in
`packages/primitives/src/components/<name>/<name>.ts`, which registers itself at
the bottom of its own module:

```ts
// packages/primitives/src/components/button/button.ts
export class ZdButton extends CoreButton { … }

project.scope.registerComponent(ZdButton);
```

`components/index.ts` re-exports them all, so importing the package registers
every primitive eagerly under `zd-`. That is safe **only** because `index.ts`
imports `./configure.js` first — which is what makes rule 1 load-bearing rather
than a nicety.

Consumers import the class and declare it in `dependencies()`:

```ts
import { CharmElement, ZdButton, ZdInput } from '@zocdoc/api-primitive-components';

export class ZdProviderSearch extends CharmElement {
  public static override baseName = 'provider-search';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdInput, ZdButton];
  }
}
```

No casts. The `Zd*` classes satisfy `typeof CharmElement` directly.

`dependencies()` is still required even though the package registered the class
already: it is the declaration `<scoped-*>` tag rewriting is checked against
(PBZD-003), and registration is idempotent, so the overlap costs nothing.

**Don't:**

```ts
// ❌ A Charm barrel — registers ch-button at import time, and a ch-* component
//    can never be re-registered as zd-*
import '@charm-ux/core/components/button/index.js';

// ❌ Reaching past the primitives package for the Core class — you get Charm's
//    button without the Zocdoc stylesheet
import CoreButton from '@charm-ux/core/components/button/button.js';

// ❌ Mixing config and component imports — the button is already ch-button
import { project } from '@charm-ux/core';
import '@charm-ux/core/components/button/index.js';

project.updateProject({ prefix: 'zd' });
```

Guarded by `packages/primitives/src/__tests__/prefix.test.ts`, which asserts that importing a primitive's module registers it under `zd-`, that a class named only in `dependencies()` registers when the host is constructed, and that nothing ever registers under `ch-`.

See also: [PBZD-004](./PBZD-004.md), [PBZD-005](./PBZD-005.md)
