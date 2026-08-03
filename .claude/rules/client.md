---
globs: packages/api-components/src/client/**
---

# API Client Rules (CLIENT)

When working on the API client layer, follow these rules. For full details and examples, see the linked rule files.

- **CLIENT-001** Centralize fetch in http.ts — only `client/http.ts` calls `fetch`. Endpoint modules are thin typed wrappers. ([details](../../.agents/rules/client/CLIENT-001.md))
- **CLIENT-002** Token via getToken function — `getToken` is a function (or string) called per request. The library never mints tokens itself. ([details](../../.agents/rules/client/CLIENT-002.md))
- **CLIENT-003** Typed error hierarchy — `ZocdocAuthError` for 401, `ZocdocNotFoundError` for 404. Never expose raw API error messages to users. ([details](../../.agents/rules/client/CLIENT-003.md))
- **CLIENT-004** Cache reference data — specialties, visit reasons, insurance plans cached in module-level map. Cache the Promise, not the resolved value. ([details](../../.agents/rules/client/CLIENT-004.md))
