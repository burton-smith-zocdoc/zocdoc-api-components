# PBZD-005: Package dependency direction

Dependency direction is strictly one-way:

```
primitives ← api-components ← demo
```

- **primitives** (`@powered-by-zocdoc/primitives`) — design tokens and Charm configuration. No API awareness.
- **api-components** (`@powered-by-zocdoc/api-components`) — API client and booking components. Depends on primitives for styled Charm exports.
- **demo** (private) — Vite vanilla-TS demo site. Depends on api-components.

Primitives imports `@charm-ux/core` for configuration but exports only the configured re-exports. API components import primitives first (guaranteeing prefix ordering) then use the re-exported Charm components.

**Do:**

```ts
// api-components/src/index.ts
import '@powered-by-zocdoc/primitives';  // prefix configured
import './components/provider-search/index.js';
```

**Don't:**

```ts
// ❌ Circular: primitives importing from api-components
// packages/primitives/src/index.ts
import { ZdProviderSearch } from '@powered-by-zocdoc/api-components';
```

See also: [PBZD-001](./PBZD-001.md)
