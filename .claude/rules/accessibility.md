---
globs: packages/api-components/src/components/**
---

# Accessibility Rules (A11Y)

When building API components, follow these accessibility rules. For full details and examples, see the linked rule files.

- **A11Y-001** WCAG 2.2 AA conformance target — all components must pass axe-core with no violations. ([details](../../.agents/rules/accessibility/A11Y-001.md))
- **A11Y-002** Announce state changes — loading, error, and empty states need `aria-live` regions; errors use `role="alert"`. ([details](../../.agents/rules/accessibility/A11Y-002.md))
- **A11Y-003** Manage focus in multi-step flows — move focus to heading or first interactive element on step change. ([details](../../.agents/rules/accessibility/A11Y-003.md))
- **A11Y-004** Form accessibility in patient-form — visible labels, `aria-describedby` for errors, fieldsets for related fields. ([details](../../.agents/rules/accessibility/A11Y-004.md))
- **A11Y-005** Test every component with axe-core — test multiple states, not just default. ([details](../../.agents/rules/accessibility/A11Y-005.md))
