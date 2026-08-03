---
globs: packages/primitives/src/**,packages/api-components/src/index.ts
---

# Internal Architecture Rules (PBZD)

When working on package setup or component registration, follow these rules. For full details and examples, see the linked rule files.

- **PBZD-001** Configure the prefix first, and never import a Charm barrel — `configure.ts` runs before anything else, and Charm primitives are imported as classes from `@powered-by-zocdoc/primitives` and registered via `dependencies()`. ([details](../../.agents/rules/internal/PBZD-001.md))
- **PBZD-002** Extend CharmElement — API components extend `CharmElement`, not `LitElement` directly. Use `CharmFocusableElement` only for interactive triggers. ([details](../../.agents/rules/internal/PBZD-002.md))
- **PBZD-003** Use scope.tag() for tag names — templates use `this.scope.tag('button')`, never hardcoded tag names like `zd-button`. ([details](../../.agents/rules/internal/PBZD-003.md))
- **PBZD-004** Register through project scope — declare `static override baseName` and register via `project.scope.registerComponent()`. ([details](../../.agents/rules/internal/PBZD-004.md))
- **PBZD-005** Package dependency direction — strictly `primitives` ← `api-components` ← `demo`. No reverse dependencies. ([details](../../.agents/rules/internal/PBZD-005.md))
