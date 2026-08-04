# Recorded API responses (Task 2 Step 3)

Real responses, recorded so tests assert against observed reality rather than
documentation. Verbatim bodies — do not hand-edit them; re-record instead.

| File | Source | Recorded |
| --- | --- | --- |
| `specialties.json` | `GET /v1/specialties` | 2026-08-04 |
| `visit-reasons.json` | `GET /v1/visit_reasons?specialty_id=sp_98` | 2026-08-04 |
| `insurance_plans.json` | `GET /v1/insurance_plans` | 2026-08-04 |
| `provider-locations.json` | `GET /v1/provider_locations?zip_code=11201&specialty_id=sp_101&visit_type=all` | 2026-08-04 |
| `availability.json` | `GET /v1/provider_locations/availability` — 3 ids, 30-day window, `published_context=direct_listing` | 2026-08-04 |
| `appointment-response-shape.json` | `POST /v1/appointments` + `GET /v1/appointments/{id}` — **key → type only, no values** | 2026-08-04 |

The first five are recorded by `scripts/verify-production-reference-data.ts`, which is
restricted to an allowlist of those paths and **issues GETs only** — the HTTP method is not a
parameter anywhere in that file. The shape file comes from
`scripts/verify-production-booking.ts`, a separate script precisely so that guarantee stays
intact; it books and cancels, and its cancel runs in a `finally`.

**These came from production, not sandbox**, with explicit authorization to read production
on 2026-08-04 and to write to it later the same day.

## Why this is not PHI

Reference data is catalog data: specialties, carriers, plan names, coverage states.
Provider search and availability return *provider* data — names, NPIs, practice addresses —
and *timeslot* data, which is the same directory information zocdoc.com serves publicly.
There is no patient in a search or an availability response, so there are no patient fields
to leak.

That is enforced rather than asserted: the recording script walks every response for
patient-shaped keys (`patient*`, `date_of_birth`, `insurance_member_id`, and similar) and
**refuses to write the fixture** if it finds any. `provider.first_name` / `last_name` are
the one deliberate exception — a provider is not a patient — and the exception is scoped to
keys nested under a `provider` object, so a `first_name` anywhere else is still a failure.
All five recorded responses were scanned clean.

The shape file is exempt from that scan because it cannot fail it: it contains no values at
all, only `typeof` strings. The booking response it describes *is* patient-shaped — that is
why only its shape is here.

## These files are not in git

`.gitignore` ignores `__fixtures__`, so the JSON is local-only — this README is the only
tracked file in the directory. Re-run the recording script to reproduce them; a fresh clone
starts empty and nothing breaks, because no test reads from here. The test suites run off
`client/mock/`, which is hand-written. When a capture reveals something tests should assert
— production sending `booking_url: null`, for instance — that finding gets carried into
`client/mock/fixtures.ts` by hand. Recording it here is not enough.

## Two things this directory must not accumulate

- **No appointment response bodies from production, ever.** Booking against production is
  now authorized and `appointment-response-shape.json` came from it — but that file holds
  **key → type pairs with every value discarded**, not a response. The recorder emits
  `typeof` and nothing else, so there is no redaction step that could be got wrong. A real
  appointment body, even one built from fabricated patient data, does not belong here:
  booking-path *fixtures* stay hand-written from the documented sandbox scenarios
  (PHI-002, TEST-003), because those sentinels are what the tests need anyway.
- **No recorded response containing patient fields**, from any environment.

An earlier revision of this file prohibited provider-search and availability captures from
production, and prohibited the booking path outright. The search/availability half was lifted
on 2026-08-04 and the booking half was narrowed the same day — from "never call it" to "never
store its body". The narrowing is deliberate: the risk was never the call, it was what a
response body would leave on disk.

## Notes on the captures

- `visit-reasons.json` is scoped to one specialty because the endpoint requires scoping to
  be useful. `sp_98` is Dentist.
- `provider-locations.json` uses `sp_101` (Dermatologist) rather than a more obvious
  specialty because availability in this directory is sparse: across four ZIP codes, only
  2 of 41 sampled locations reported any availability at all, and every `Dentist` result had
  none. Dermatologist in 11201 is one of the two that does.
- `availability.json` therefore contains one entry with 164 real timeslots and two with
  `timeslots: []` — both states in one fixture, which is what the `success`/`empty` split in
  COMP-001 needs to be tested against.
- `booking_url` is `null` in every recorded timeslot despite being documented as a
  non-nullable string. Do not "fix" that in the fixture; it is what the API returned.

See `docs/api-contract-notes.md#verified-against-production-2026-08-04`.
