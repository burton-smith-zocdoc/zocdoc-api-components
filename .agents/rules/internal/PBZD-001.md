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

## 2. Import Charm class modules, never Charm barrels

A component folder's `index.js` **barrel** calls `registerComponent()` as an import side effect. The sibling **class module** (`button/button.js`) exports the class and registers nothing.

`packages/primitives/src/charm.ts` re-exports the class modules, and that is the only place they are imported:

```ts
export { default as button } from '@charm-ux/core/components/button/button.js';
export { default as input } from '@charm-ux/core/components/input/input.js';
```

Components declare them in `dependencies()`. The `CharmElement` constructor registers them at construction time, long after the prefix is set:

```ts
import { button, CharmElement, input } from '@powered-by-zocdoc/primitives';

export default class ProviderSearch extends CharmElement {
  public static override baseName = 'provider-search';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [input, button];
  }
}
```

No casts. The class-module exports satisfy `typeof CharmElement` directly.

**Don't:**

```ts
// ❌ A barrel — registers at import time under whatever prefix is current
import '@charm-ux/core/components/button/index.js';

// ❌ A class module imported for side effect — registers nothing, so <zd-button>
//    is never defined and the template renders an unknown element
import '@charm-ux/core/components/button/button.js';

// ❌ Mixing config and component imports — the button is already ch-button
import { project } from '@charm-ux/core';
import '@charm-ux/core/components/button/index.js';

project.updateProject({ prefix: 'zd' });
```

The one exception is a story or demo that renders a bare `zd-*` primitive with no host component to declare it. There, call `project.scope.registerComponent(button)` explicitly — safe, because importing the primitives package has already run `configure.js`.

Guarded by `packages/primitives/src/__tests__/prefix.browser.test.ts`, which asserts that a class-module import registers nothing until a host declaring it is constructed, and that nothing ever registers under `ch-`.

See also: [PBZD-004](./PBZD-004.md), [PBZD-005](./PBZD-005.md)
