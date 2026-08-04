---
globs: packages/*/src/**/*.styles.ts
---

# Style Authoring Rules (STYLE)

When writing component styles, follow these rules. For full details and examples, see the linked rule files.

- **STYLE-001** Prefer CSS nesting — nest states, inner parts, and scoped queries under their parent with `&` instead of repeating the selector chain. Declarations before nested rules; keep host conditions inside `:host()`. ([details](../../.agents/rules/styles/STYLE-001.md))
