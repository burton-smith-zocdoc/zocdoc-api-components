---
globs: packages/api-components/src/components/**
---

# Component Design Rules (COMP)

When building API components, follow these rules. For full details and examples, see the linked rule files.

- **COMP-001** State machine for async components — every fetching component runs `idle | loading | success | empty | error`. Empty is distinct from error. ([details](../../.agents/rules/component-design/COMP-001.md))
- **COMP-002** Props in, events out — no context protocol, no shared state container. Children render from properties and emit events upward. ([details](../../.agents/rules/component-design/COMP-002.md))
- **COMP-003** Emit through base emit() helper — use `this.emit()`, never `dispatchEvent(new CustomEvent(...))`. Events use `{component}-{action}` naming. ([details](../../.agents/rules/component-design/COMP-003.md))
- **COMP-004** Standalone-capable children — every child works without its parent; no reaching upward for context. ([details](../../.agents/rules/component-design/COMP-004.md))
