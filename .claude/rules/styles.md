---
globs: packages/*/src/**/*.styles.ts
---

# Style Authoring Rules (STYLE)

When writing component styles, follow these rules. For full details and examples, see the linked rule files.

- **STYLE-001** Use CSS nesting everywhere — always nest states, inner parts, and scoped queries under their parent with `&`. Never repeat the selector chain. Declarations before nested rules; keep host conditions inside `:host()`. ([details](../../.agents/rules/styles/STYLE-001.md))
- **STYLE-002** No BEM or naming conventions — don't use BEM, OOCSS, or SMACSS. Shadow DOM provides encapsulation; use plain semantic class names and nest variants with `&`. ([details](../../.agents/rules/styles/STYLE-002.md))
