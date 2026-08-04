# Recorded API responses (Task 2 Step 3)

Real responses, recorded so tests assert against observed reality rather than
documentation. Verbatim bodies — do not hand-edit them; re-record instead.

| File | Source | Recorded |
| --- | --- | --- |
| `specialties.json` | `GET /v1/specialties` | 2026-08-04 |
| `visit-reasons.json` | `GET /v1/visit_reasons?specialty_id=sp_271` | 2026-08-04 |
| `insurance_plans.json` | `GET /v1/insurance_plans` | 2026-08-04 |

Recorded by `scripts/verify-production-reference-data.ts`, which is scoped to those
reference-data paths and GETs only.

**These came from production, not sandbox** — the credentials turned out to be production
credentials. That is safe here because reference data is catalog data: specialties,
carriers, plan names, coverage states. No patient fields, so no PHI. Both files were
scanned for patient-shaped keys before staging.

Two things this directory must not accumulate:

- **No provider-search, availability, or appointment responses from production.** The
  documented test scenarios in the testing-data guide exist only in sandbox, and a
  production booking is a real appointment at a real provider's office.
- **No recorded response containing patient fields**, from any environment. Fixtures for
  the booking path stay hand-written from the documented scenarios (PHI-002, TEST-003).

`visit-reasons.json` is scoped to one specialty because the endpoint requires scoping to
be useful; `sp_271` is simply the first specialty the unscoped list returns.

See `docs/api-contract-notes.md#verified-against-production-2026-08-04`.
