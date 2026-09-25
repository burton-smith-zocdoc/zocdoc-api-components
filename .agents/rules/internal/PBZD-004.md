# PBZD-004: Register components through project scope

Every component declares `static override baseName` and registers via `project.scope.registerComponent()` in its `index.ts`. This matches Charm's CHARM-002 convention.

**Do:**

```ts
// provider-search/provider-search.ts
import { CharmElement } from '@zocdoc/api-primitive-components';

export class ZdProviderSearch extends CharmElement {
  public static override baseName = 'provider-search';
}
```

```ts
// provider-search/index.ts
import { project } from '@zocdoc/api-primitive-components';
import { ZdProviderSearch } from './provider-search.js';

project.scope.registerComponent(ZdProviderSearch);

export { ZdProviderSearch };
```

**Don't:**

```ts
// ❌ Direct customElements.define bypasses scope prefix
customElements.define('zd-provider-search', ZdProviderSearch);

// ❌ Missing baseName — scope can't compute the tag
export class ZdProviderSearch extends CharmElement { }
```

See also: [PBZD-001](./PBZD-001.md), [PBZD-002](./PBZD-002.md)
