---
globs: packages/api-components/src/components/patient-form/**,packages/api-components/src/components/booking/**
---

# PHI Handling Rules (PHI)

When working with patient data forms or booking flows, these rules are critical. For full details and examples, see the linked rule files.

- **PHI-001** No PHI in logs, errors, or messages — patient field values never appear in `console.log`, error messages, or debug output. Log actions, not data. ([details](../../.agents/rules/phi/PHI-001.md))
- **PHI-002** Test data from documented scenarios only — use data from `https://api-docs.zocdoc.com/guides/testing-data`. No real-looking names or phone numbers. ([details](../../.agents/rules/phi/PHI-002.md))
- **PHI-003** No analytics or third-party calls — the only outbound destination is the configured Zocdoc `baseUrl`. No tracking, no error reporting services. ([details](../../.agents/rules/phi/PHI-003.md))
