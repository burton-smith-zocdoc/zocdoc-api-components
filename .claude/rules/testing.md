---
globs: packages/*/src/**/__tests__/**,packages/*/src/**/*.test.ts,packages/*/src/test/**
---

# Testing Rules (TEST)

When writing tests, follow these rules. For full details and examples, see the linked rule files.

- **TEST-001** Two Vitest projects — `client` in node (mock fetch), `components` in browser (mock client layer). ([details](../../.agents/rules/testing/TEST-001.md))
- **TEST-002** Mock client layer, not network — component tests mock endpoint functions like `searchProviderLocations`, not `fetch` itself. ([details](../../.agents/rules/testing/TEST-002.md))
- **TEST-003** Documented test scenarios — use ZIP codes and patient data from `https://api-docs.zocdoc.com/guides/testing-data`. No real-looking test data. ([details](../../.agents/rules/testing/TEST-003.md))
