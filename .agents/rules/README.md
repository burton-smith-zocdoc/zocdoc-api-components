# Powered by Zocdoc — Agent Rules

Authoring standards for the Powered by Zocdoc web-component library. Built on Charm UX and the Zocdoc public API.

Each rule is a single Markdown file so it can be referenced by ID in reviews and loaded selectively by agents.

## Rule ID Format

`{CODE}-{NNN}` — a category code plus a zero-padded three-digit number (e.g. `PBZD-001`, `PHI-001`). One rule per file; the filename is the rule ID. Files live in a directory named for the category.

## Categories

| Code     | Directory           | Scope                                                                  |
| -------- | ------------------- | ---------------------------------------------------------------------- |
| `PBZD`   | `internal/`         | Internal architecture: prefix config, component registration, base classes |
| `CLIENT` | `client/`           | API client patterns: fetch, tokens, errors, caching                    |
| `PHI`    | `phi/`              | Protected health information handling                                  |
| `A11Y`   | `accessibility/`    | WCAG 2.2 AA, state announcements, focus management, form accessibility |
| `I18N`   | `i18n/`             | Browser translation, Intl APIs, RTL support                            |
| `COMP`   | `component-design/` | Component design: state machines, composition, events                  |
| `STYLE`  | `styles/`           | CSS authoring conventions for component style sheets                   |
| `TEST`   | `testing/`          | Vitest browser mode, mock strategies, test data                        |
| `ADR`    | `adr/`              | Architecture decision records                                          |

## Delivery Model

Rules are delivered to agents in two tiers:

- **Always loaded** — foundational rules injected for every task: `PBZD-*`, `PHI-*`, `CLIENT-*`, `A11Y-*`, `I18N-*`.
- **Path-gated** — activated when files being edited match a glob: `COMP-*`, `STYLE-*`, `TEST-*`.
- **Reference** — consulted on demand: `ADR-*`.

## Rule Index

### PBZD — Internal Architecture (always loaded)

| ID                             | Rule                                          |
| ------------------------------ | --------------------------------------------- |
| [PBZD-001](internal/PBZD-001.md) | Configure prefix before importing components  |
| [PBZD-002](internal/PBZD-002.md) | Extend CharmElement for API components        |
| [PBZD-003](internal/PBZD-003.md) | Use scope.tag() for tag names in templates    |
| [PBZD-004](internal/PBZD-004.md) | Register components through project scope     |
| [PBZD-005](internal/PBZD-005.md) | Package dependency direction                  |

### CLIENT — API Client Patterns (always loaded)

| ID                             | Rule                                          |
| ------------------------------ | --------------------------------------------- |
| [CLIENT-001](client/CLIENT-001.md) | Centralize fetch in http.ts                  |
| [CLIENT-002](client/CLIENT-002.md) | Token handling via getToken function         |
| [CLIENT-003](client/CLIENT-003.md) | Typed error hierarchy                        |
| [CLIENT-004](client/CLIENT-004.md) | Cache reference data at module level         |

### PHI — Protected Health Information (always loaded)

| ID                         | Rule                                          |
| -------------------------- | --------------------------------------------- |
| [PHI-001](phi/PHI-001.md)   | No PHI in logs, errors, or messages           |
| [PHI-002](phi/PHI-002.md)   | Test data from documented scenarios only      |
| [PHI-003](phi/PHI-003.md)   | No analytics or third-party network calls     |

### A11Y — Accessibility (always loaded)

| ID                                   | Rule                                          |
| ------------------------------------ | --------------------------------------------- |
| [A11Y-001](accessibility/A11Y-001.md) | WCAG 2.2 AA conformance target                |
| [A11Y-002](accessibility/A11Y-002.md) | Announce state changes to screen readers      |
| [A11Y-003](accessibility/A11Y-003.md) | Manage focus in multi-step flows              |
| [A11Y-004](accessibility/A11Y-004.md) | Form accessibility in patient-form            |
| [A11Y-005](accessibility/A11Y-005.md) | Test every component with axe-core            |

### I18N — Internationalization (always loaded)

| ID                         | Rule                                          |
| -------------------------- | --------------------------------------------- |
| [I18N-001](i18n/I18N-001.md) | Keep text in DOM for browser translation      |
| [I18N-002](i18n/I18N-002.md) | Use Intl APIs for dates, times, and numbers   |
| [I18N-003](i18n/I18N-003.md) | Use CSS logical properties for RTL            |
| [I18N-004](i18n/I18N-004.md) | Don't split translatable text across elements |

### COMP — Component Design (path-gated)

| ID                                     | Rule                                          |
| -------------------------------------- | --------------------------------------------- |
| [COMP-001](component-design/COMP-001.md) | State machine for async components            |
| [COMP-002](component-design/COMP-002.md) | Props in, events out                          |
| [COMP-003](component-design/COMP-003.md) | Emit events through base emit() helper        |
| [COMP-004](component-design/COMP-004.md) | Standalone-capable children                   |

### STYLE — Style Authoring (path-gated)

| ID                             | Rule                                          |
| ------------------------------ | --------------------------------------------- |
| [STYLE-001](styles/STYLE-001.md) | Prefer CSS nesting over repeated selectors    |

### TEST — Testing (path-gated)

| ID                             | Rule                                          |
| ------------------------------ | --------------------------------------------- |
| [TEST-001](testing/TEST-001.md) | Two Vitest projects: node and browser         |
| [TEST-002](testing/TEST-002.md) | Mock client layer, not network                |
| [TEST-003](testing/TEST-003.md) | Use documented test scenarios                 |

### ADR — Architecture Decision Records (reference)

| ID                       | Rule                  |
| ------------------------ | --------------------- |
| [ADR-001](adr/ADR-001.md) | When to write an ADR  |
| [ADR-002](adr/ADR-002.md) | ADR format and content |

## Adding a New Rule

1. Create the rule file `{CODE}-{NNN}.md` in the category directory, following the existing format.
2. Add it to the **Rule Index** above.
3. If always-loaded (`PBZD`, `PHI`, `CLIENT`, `A11Y`, `I18N`), ensure it is referenced in `AGENTS.md`.
4. If path-gated (`COMP`, `STYLE`, `TEST`), ensure the glob pattern in the Claude rules file covers it.

## How to Use These Rules

- **Agents** read always-loaded categories on every task and path-gated categories when touching matching files. Cite rule IDs in code review (e.g. "PHI-001: no patient data in error messages").
- **Humans** browse the index above or navigate by category directory.
