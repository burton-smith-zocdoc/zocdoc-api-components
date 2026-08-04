# API Contract Notes

Source of truth for Tasks 5–8. Records the observed Zocdoc sandbox contract.

**Evidence basis:** the machine-generated OpenAPI operation tables published at
`https://api-docs.zocdoc.com/apis/**.md`, **API version 1.177**, retrieved 2026-08-04.
These are generated from the spec, not hand-written prose, and they carry per-parameter
types, requiredness, enums, and full response field paths.

**Live verification: partial as of 2026-08-04 — reference data only, against
production.** Authentication is solved; the credentials were production credentials all
along, which is why the sandbox token endpoint rejected them. See
[Auth status](#auth-status). `/v1/specialties` and `/v1/insurance_plans` have been called
and recorded; see [Verified against production](#verified-against-production-2026-08-04).
Everything else below is still spec-derived, and items the spec leaves genuinely
underspecified are flagged **[NEEDS LIVE CHECK]** rather than guessed.

Provider search, availability, and booking remain unverified **by choice, not by
blocker** — the documented test scenarios exist only in sandbox, and booking against
production would create real appointments.

Where this file records a place the published docs are *wrong* rather than merely
underspecified, that discrepancy is also written up in
[`api-doc-issues.md`](./api-doc-issues.md).

**That file is written to be shared with the team that maintains the API docs.** Keep it
self-contained — no internal paths, no notes about our own code or plan. Findings about
our own mistakes belong here or in the plan doc, not there.

---

## The parameter-name conflict is resolved: `_id` spellings win

The spec's open question — `specialty_id`/`visit_reason_id`/`insurance_plan_id` versus
`specialty`/`visit_reason`/`accepted_insurance` — was not a real API discrepancy. It came
from reading an English sentence as an identifier list.

The OpenAPI summary at `/apis.md` describes the endpoint as:

> "This endpoint accepts parameters such as zip code, specialty, visit reason and accepted
> insurance to return a filtered set of providers within the developer's directory."

That is prose. "zip code" and "visit reason" have spaces; they are not parameter names.
The operation's actual `## Query parameters:` table lists only `_id`-suffixed names, and
the string `accepted_insurance` does not appear anywhere in the spec as a parameter.

**Use `specialty_id`, `visit_reason_id`, `insurance_plan_id`.** `page` and `page_size` are
real and accepted.

Settled against the running server on 2026-08-04, not just by reading: sending `specialty`
in place of `specialty_id` returns

```
400 { error_type: 'invalid_request',
      errors: [{ field: 'specialty_id',
                 message: 'One of SpecialtyId or VisitReasonId is required.' }] }
```

The unknown parameter is dropped silently and the request then fails the required-filter
check — which is the strongest available proof that `specialty` is not recognized, since a
200 with plausible-looking results would not have distinguished "accepted" from "ignored".

This is also corroborated by the booking guide's verbatim curl example:

```
GET /v1/provider_locations?zip_code=36925&specialty_id=sp_153
    &visit_reason_id=pc_FRO-18leckytNKtruw5dLR&page=0&page_size=0
    &insurance_plan_id=ip_2224&visit_type=all&max_distance_to_patient_mi=0
```

## Reference-data paths

Confirmed as the spec predicted — the hyphenated forms in the guide are doc slugs, not
routes. Real paths: `/v1/specialties`, `/v1/visit_reasons`, `/v1/insurance_plans`.

---

## Two response envelopes, not one

This matters for `http.ts`: **paged and unpaged responses differ**, and `data` is not
consistently an array. Do not write a single generic `{ data: T[] }` type.

**Paged envelope** — `/v1/specialties`, `/v1/visit_reasons`, `/v1/insurance_plans`,
`/v1/provider_locations`:

```ts
{
  request_id: string;   // required, tracing id — present on every response
  page: number;         // zero-based index of current page
  page_size: number;
  total_count: number;
  next_url: string;     // '' on the last page — NOT null; see Verified against production
  data: ...;            // shape varies — see below
}
```

**Unpaged envelope** — `/v1/provider_locations/availability`, `POST /v1/appointments`:

```ts
{ request_id: string; data: ... }
```

### `data` is an array *except* on provider_locations

| Endpoint | `data` shape |
|---|---|
| `/v1/specialties` | array of specialty |
| `/v1/visit_reasons` | array of visit reason |
| `/v1/insurance_plans` | array of insurance plan |
| **`/v1/provider_locations`** | **object** — `{ search_parameters, provider_locations[] }` |
| `/v1/provider_locations/availability` | array of per-location availability |
| `POST /v1/appointments` | object |

The provider-locations case is the trap: results are nested at
`data.provider_locations`, not `data`. `data.search_parameters` echoes back the resolved
`specialty_id` and `visit_reason_id` — useful, since the API fills in defaults when you
supply only one of the two.

Every row above is confirmed against live production responses (2026-08-04), including the
error envelope, which we triggered deliberately. Two specifics worth keeping:

- The `visit_reason_id` the API fills in is the specialty's own `default_visit_reason_id`,
  which `/v1/specialties` already returns on each item — so it is predictable, not opaque.
- `search_parameters` also carries `available_from_in_provider_local_time` and
  `available_to_in_provider_local_time`, both `null` when not requested. They are not in the
  documented parameter list for this endpoint.

### Error envelope

Identical across endpoints (documented on 400):

```ts
{
  request_id: string;
  error_type: 'api_error' | 'invalid_request';
  errors: Array<{ field?: string; message: string }>;
}
```

401 and 403 are documented with **no response body fields**. 404 is documented on the
reference-data endpoints. Per CLIENT-003, `errors[].message` is an upstream string and
must not be surfaced to users verbatim.

---

## Endpoints

### `GET /v1/specialties`

| Param | Type | Notes |
|---|---|---|
| `page` | integer | default 0, max 200 |
| `page_size` | integer | default 100, max 500 |
| `care_category` | string | `health` \| `dental` \| `vision` |

Item fields: `id`, `name`, `care_category`, `default_visit_reason_id`,
`default_visit_reason_name` — all required.

### `GET /v1/visit_reasons`

| Param | Type | Notes |
|---|---|---|
| `page` | integer | default 0, max 200 |
| `page_size` | integer | default 100, max 500 |
| `specialty_id` | string | filter by primary specialty |

Item fields: `id`, `name`, `specialty_id` — all required.

### `GET /v1/insurance_plans`

Params: `page`, `page_size`, `status`, `state`, `network_type`, `program_type`,
`care_category`.

Item fields: `id`, `name`, `carrier: { id, name }`, `network_type`, `program_type`,
`status`, `care_categories[]`, `coverage_area: { is_national, states[] }`,
`ref_metadata: { created_timestamp_utc, last_updated_timestamp_utc }`.

### `GET /v1/provider_locations`

| Param | Type | Notes |
|---|---|---|
| `zip_code` | string | **required**, 5 digits |
| `specialty_id` | string | **one of `specialty_id` or `visit_reason_id` is required** |
| `visit_reason_id` | string | if both are sent, the specialty must be the visit reason's own specialty |
| `page` | integer | zero-indexed |
| `page_size` | integer | **defaults to 10** (measured; the spec documents no default or bounds here) |
| `insurance_plan_id` | string | |
| `visit_type` | string | `all` \| `in_person` \| `video_visit`; defaults to `in_person` |
| `max_distance_to_patient_mi` | integer | default 50 |

`visit_type` defaulting to `in_person` is worth noting — a search that should include
virtual providers must pass `all` explicitly.

Provider-location object fields:

- `provider_location_id` — e.g. `pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890`.
  **Contains a literal `|`.** Percent-encoding it as `%7C` is correct and what
  `URLSearchParams` does for us anyway, so `http.ts` needs no special handling. Verified
  2026-08-04: the server accepts the raw `|` and `%7C` identically (both 200), so this is
  not a trap — an earlier version of this note implied encoding was mandatory.
- `provider_location_type` — `in_person_provider` | `virtual_provider`
- `accepts_patient_insurance` — `accepted` | `not_accepted` | `insurance_not_specified`
- `first_availability_date_in_provider_local_time` — `YYYY-MM-DD`, up to 90 days out
- `provider` — `provider_id`, `npi`, `first_name`, `last_name`, `title`, `full_name`,
  `gender_identity`, `specialties[]`, `specialty_ids[]`, `default_visit_reason_id`,
  `visit_reason_ids[]`, `statement`, `provider_photo_url`, `languages[]`, `profile_url`,
  `credentials: { certifications[], education: { institutions[] } }`
- `location` — `address1`, `address2`, `city`, `state`, `zip_code`, `latitude`,
  `longitude`, `location_name`, `phone_number`, `phone_extension`, `time_zone`
  (IANA, e.g. `America/New_York`), `distance_to_patient_mi`
- `virtual_location` — `state`, `location_name`, `time_zone`
- `practice` — `practice_id`, `practice_name`
- `booking_requirements` — `required_fields[]`,
  `accepts_booking_requests_from[]` (`in_network` | `out_of_network` | `self_pay`)

`provider_photo_url` is **protocol-relative** (`//d2uur...`), so it needs an `https:`
prefix before use in an `<img src>` in some contexts.

`booking_requirements.required_fields` drives which fields `zd-patient-form` must
require (Task 13). Its values are not enumerated in the spec.

*Live check done 2026-08-04, and it did not settle the question.* Across 13 provider
locations from production searches, **every one returned `required_fields: []`** — so
sampling gives us no vocabulary to build against. `accepts_booking_requests_from` was
populated on all 13 (`in_network` and `self_pay` observed; `out_of_network` is in the enum
but did not appear).

Consequence for Task 13: treat the two documented paths
(`data.patient.insurance.insurance_plan_id`, `data.patient.insurance.insurance_member_id`)
as the known set, and make an unrecognized value **fail loudly in development and be
ignored in production** rather than silently dropped — we cannot enumerate what else may
arrive, and a requirement we skip becomes a booking that fails after the patient has filled
in the form.

### `GET /v1/provider_locations/availability`

| Param | Type | Notes |
|---|---|---|
| `provider_location_ids` | string | **required**, comma-delimited, max 50 |
| `visit_reason_id` | string | **required** |
| `patient_type` | string | **required**, `new` \| `existing` |
| `start_date_in_provider_local_time` | string | `YYYY-MM-DD`, defaults to today US Eastern, max 150 days out |
| `end_date_in_provider_local_time` | string | defaults to start+7; **must be ≤31 days after start** |
| `published_context` | string | `direct_listing` \| `condition_driven_search` |
| `insurance_plan_id` | string | used only to construct `booking_url` |
| `insurance_carrier_id` | string | used only to construct `booking_url` |

**The window is ≤30, not ≤31 — settled live on 2026-08-04.** The OpenAPI description
(bundle lines 367–372) says "Must be **31** days or less after the start date", and the API's own
rejection says the same thing:

```
400 { "field": "availability_range_in_days",
      "message": "The EndDateInProviderLocalTime must be between 0 and 31 days
                  after the StartDateInProviderLocalTime." }
```

That 400 is what a **31-day** span gets. A 30-day span succeeds. So the endpoint rejects the
exact value both its documentation and its own error message say is allowed — the check is
`< 31` while everything describing it says `<= 31`.

This supersedes an earlier version of this note, which guessed at a contradiction between
the spec and a guide that "says 30 days or less". That guide text was never located and the
guess was wrong about the *mechanism*, though right that 30 is the safe clamp. Clamping to
30 is what we do, and now there is a reason on file rather than caution.

`data` is an array; each item:

- `provider_location_id`
- `first_availability: { start_time, visit_reason_id, booking_url }` —
  `start_time` is ISO-8601 **with a timezone offset in the provider's local zone**
  (`2022-04-27T09:00:00-04:00`). Per I18N-002, render via `Intl.DateTimeFormat`.
- `timeslots` — array of the **same `Timeslot` schema as `first_availability`**
  (`items: $ref: '#/components/schemas/Timeslot'`, bundle line 2294). So the item fields are
  `start_time` (required), `visit_reason_id`, and `booking_url`.

  *Corrected 2026-08-04.* An earlier version of this line said the spec does not document
  the item fields and flagged it **[NEEDS LIVE CHECK]** before Task 12 could proceed. That
  was wrong — `Availability.timeslots` is a typed `$ref`, not an untyped array. Task 12
  (`zd-availability-picker`) is not blocked and does not need a live capture for this.

Empty availability returns an **empty array for that provider location**, not an error —
which maps cleanly onto the `empty` state required by COMP-001. Confirmed live: a batch of
10 ids returned 10 entries, 9 of them with `timeslots: []` and `first_availability: null`.

`booking_url` is documented as a **non-PHI** deep link; UTM params are appended
automatically.

**Verified live 2026-08-04.** One response with 164 timeslots confirms the item shape
exactly as the spec's `Timeslot` describes it — keys are `start_time`, `visit_reason_id`,
`booking_url` and nothing else. Three things the capture adds that the spec does not say:

- **This envelope is not paged.** It is `{ request_id, data }` only — no `next_url`, `page`,
  `page_size`, or `total_count`. That matches `AvailabilityResult` (bundle 2298), which
  composes `BaseResult` rather than the paged envelope, so `fetchAllPages` must not be
  pointed at this endpoint. See "Two response envelopes, not one".
- **`booking_url` was `null` in all 165 timeslots observed**, despite being typed as a
  non-nullable `string` with a URL example. Presumably populated only for syndication
  clients. Treat it as `string | null` and never render a link without a null check.
- **`first_availability` can be `null`** even though it `$ref`s `Timeslot`, whose
  `required` list contains `start_time`. Same treatment: `Timeslot | null`.

**Availability is sparse in this directory, which matters for fixtures.** Sampling four ZIP
codes (11201, 10003, 60601, 90012) across two specialties, only **2 of 41** provider
locations reported a non-null `first_availability_date_in_provider_local_time`. Every
`Dentist` result in every market had none; `Dermatologist` in 11201 and 10003 had one each.
So a script that grabs the first search result and asks for its availability will almost
always record an empty fixture and look like a broken integration. Filter on a non-null
first-availability date before probing — `scripts/verify-production-reference-data.ts` now
does.

### `POST /v1/appointments`

Request body:

```ts
{
  appointment_type: 'providers';           // required, only value in the enum
  data: {
    start_time: string;                    // required, must come from the availability endpoint
    visit_reason_id: string;               // required
    provider_location_id: string;          // required
    patient_type: 'new' | 'existing';      // required
    patient: { ... };                      // required
    notes?: string;                        // 100 char max
  };
}
```

`patient` required fields: `first_name`, `last_name`, `date_of_birth` (`YYYY-MM-DD`),
`sex_at_birth` (`male` | `female`), `phone_number` (unformatted 10 digits; 1st and 4th
digit cannot be 0 or 1), `email_address`, `patient_address`.

`patient_address` required: `address1`, `city`, `state` (2-letter), `zip_code`.
Optional: `address2`.

Optional on `patient`: `patient_id`, `developer_patient_id`,
`insurance: { insurance_plan_id, insurance_group_number, insurance_member_id, is_self_pay }`,
`gender[]`.

`gender` is an array of 11 enum values (`female_at_birth`, `male_at_birth`, `cisgender`,
`genderfluid`, `genderqueer`, `intersex`, `non_binary`, `transgender_man`,
`transgender_woman`, `prefer_not_to_say`, `none_apply`). `none_apply` and
`prefer_not_to_say` must be used alone; the others may combine. Note this is distinct
from `sex_at_birth`, which is a separate required binary field.

Response `data` — **live-verified 2026-08-04**, all ten fields documented:
`appointment_id`, `appointment_status`, `developer_patient_id`, `is_provider_resource`,
`location_phone_number`, `location_phone_extension`, `waiting_room_path`,
`confirmation_type`, `visit_type`, `notes`. An earlier version of this note listed only
eight — it omitted `visit_type` and `notes`, which are documented and returned; the docs
were right and the note was incomplete.

`GET /v1/appointments/{id}` returns those minus `visit_type`/`notes` ordering, plus
`cancellation_reason`, `created_time_utc`, `last_modified_time_utc`, `patient_type`,
`practice_id`, `provider_location_id`, `source`, `start_time`, `visit_reason_id`.

**Six of these are `type: string` in the spec and came back `null`:**
`developer_patient_id`, `location_phone_extension`, `waiting_room_path`, `notes`,
`cancellation_reason`, `source`. Same systemic gap as everywhere else — see the nullability
policy in `client/types.ts`. `source` is the surprising one: it documents "the channel where
the appointment was booked", yet it is null on an appointment that was definitely booked
through a channel.

A first booking status is `pending_booking`, not `confirmed` — the state machine in
COMP-001 must treat a 200 from `POST /v1/appointments` as *submitted*, not *booked*.

**Every field on `patient` is PHI.** Per PHI-001 none of these values may appear in
`console.log`, thrown error messages, or committed fixtures. No appointment fixture
should be recorded with realistic patient data.

### `GET /v1/reference/npi`

Params `page`, `page_size`. Returns the active provider NPIs in the developer's
directory — the documented entry point when NPIs aren't known in advance.

---

## Test scenario data

From `/guides/testing-data`. Use only these values (TEST-003, PHI-002).

| ZIP | Behavior |
|---|---|
| `11201` | returns results, including booking requirements |
| `99734` | no results — drives the `empty` state |
| `10112` | 500 error — drives the `error` state |

Insurance plans: `ip_0` (404/400 errors), `ip_5432` (national), `ip_2345` (CA state),
`ip_2052` (Medicare), `ip_8281` (Medicaid), `ip_9111` (active), `ip_2667` (inactive),
`ip_5292` (deleted), `ip_2600` (health), `ip_6501` (dental), `ip_5907` (vision).

Visit reasons: `pc_FRO-18leckytNKtruw5dLR`, `pc_TlZW-r06U0W3pCsIGtSI5B`,
`pc_zZWhkaURvEGlZpSimNILaB`, `pc_p1KdCTTzuU6A04ZjEt837x`, `pc_T1T3MOA0kUuE201i1ZfIWR`,
`pc_peZqujk5w0jL8SblyLoIoz`, `pc_PS_BTW9rmkuIfaIH_Hxdwg`. Specialty: `sp_153`.

Sentinel NPIs exist for edge cases: `npi_error`, `npi_missing`, `npi_multipleproviders`,
`npi_multiplelocations`, `npi_allvirtual`, `npi_hasvirtual`, `npi_insuranceIdRequired`.

### Correction to the plan's Task 2 probes

The plan probes `/v1/provider_locations?zip_code=11201` with no other filter. Per the
spec, **one of `specialty_id` or `visit_reason_id` is required**, so that request should
return 400, not results. Any live re-run must add `&specialty_id=sp_153`. The plan's
paired "both spellings" probes also differed only in paging and never sent the disputed
parameters, so they could not have resolved the conflict in any case.

---

## Verified against production (2026-08-04)

Live responses, recorded by `scripts/verify-production-reference-data.ts` into
`client/__fixtures__/`. Every fixture is scanned for patient-shaped field names before it is
written, and the script refuses to write on a hit; all five came back clean.

Two runs are recorded here: reference data first, then provider search and availability once
production reads were authorized. The second run is under **"Search and availability"**
below.

**The paged envelope is confirmed exactly as typed:**
`{ request_id, next_url, page, page_size, total_count, data }`. Two details that were
guesses and are now measured:

- **`page` is zero-indexed.** `page: 0` came back on a request that omitted it, and
  `next_url` pointed at `page=1`. `fetchAllPages` starts at 0, so it was already right.
- **`next_url` is a fully-qualified URL on a non-final page, and `''` on the last one.**
  The spec says *"null if this is the last page of results"* and that is **wrong** — a
  one-item response came back with `next_url: ""`. So `next_url === null` is not a valid
  end-of-pages test; it would loop until `MAX_PAGES`. Prefer falsiness, or page by
  `total_count` as `fetchAllPages` does. `client/mock/transport.ts` emits `''` to match,
  since imitating the spec there would hide the discrepancy from anything built on the
  mock.

**`Specialty`, `VisitReason`, and `InsurancePlan` types needed no changes.** Worth stating
plainly since it is the reason for the exercise: the shapes derived from the spec matched
production field for field. The specialty object names its own key `id` — `specialty_id`
is what *other* endpoints call it when referring to one, and it is what `VisitReason`
carries.

**Volumes, which are a design input and not a footnote:**

| Endpoint | `total_count` |
|---|---|
| `/v1/specialties` | 310 |
| `/v1/visit_reasons?specialty_id=sp_271` (Abdominal Radiologist) | 1 |
| `/v1/visit_reasons?specialty_id=sp_98` (Dentist) | 71 |
| `/v1/insurance_plans` | 10,677 |
| `/v1/provider_locations?zip_code=11201&specialty_id=sp_98` | 27 |

Visit reasons are narrow once scoped, but **how** narrow varies by two orders of magnitude —
one for Abdominal Radiologist, 71 for Dentist. Either way scoping is worth it; unscoped, the
list spans every specialty. Don't size a UI off a single specialty's count.

10,677 plans is 22 sequential round-trips at the maximum page size of 500, and roughly
6 MB of JSON, paid on the client to populate one select. `getInsurancePlans()` therefore
takes documented filters (`state`, `care_category`, `network_type`, `program_type`,
`status`), each cached separately. `state` is the natural one for a booking flow. The
argument stays optional for compatibility, not as an endorsement of the unfiltered call.

**One place production contradicts the spec.** `network_type` has no enum in the spec, only
a prose list of **eleven** display names — HMO, PPO, POS, EPO, Indemnity, ASO, ACO, ACP,
Medicare, Medicaid, Other. A 100-plan sample returned `epo`, `hmo`, `hmo_pos`, `indemnity`,
`medicaid`, `other`, `pos`, `ppo`, `uncategorized`: lowercase, and **two** of them
(`hmo_pos`, `uncategorized`) appear nowhere in that list. So the field is typed `string`.

*Corrected 2026-08-04.* An earlier version said the list held eight names and that four
observed values were absent. Both counts were wrong — `Medicare`, `Medicaid`, and `Other`
are in the list, which is why only two values are genuinely undocumented. `program_type` and `status` do carry spec enums and every observed value
fell inside them, so those are closed unions.

`status` returned only `active`, because the endpoint defaults to it rather than because
the other values are unused.

### Search and availability

Second run, after production reads were authorized. Four questions were open going in; three
are now closed.

**Closed — `specialty` is not a real parameter.** See "The parameter-name conflict is
resolved" above for the 400 body. This was our misreading of a prose sentence, not an API
defect.

**Closed — the live `timeslots` item shape.** 164 real timeslots in one response, keys
exactly `start_time`, `visit_reason_id`, `booking_url` and nothing more. The spec's
`Timeslot` `$ref` was right. Task 12 needs no further discovery.

**Closed — the `|` in `provider_location_id` does not require encoding.** Raw and `%7C`
both return 200. We send the encoded form regardless because `URLSearchParams` does it for
free, but no special handling is needed and nothing breaks if a caller hand-builds a URL.

**Still open — `booking_requirements.required_fields`.** All 13 sampled locations returned
`[]`, so production gave us no vocabulary. See that endpoint's section for what Task 13
should do about it.

**New, and the most consequential thing this run turned up: the spec never marks anything
nullable, and null is everywhere.** `nullable` appears **zero times** in the OpenAPI 3.0.0
document, which is the only mechanism 3.0 has for expressing it. Eight distinct field paths
came back null across five responses — seven distinct fields, since `booking_url` showed up
null in two positions:

| Path | Declared as |
|---|---|
| `Availability.first_availability` | `$ref: Timeslot`, whose `required` lists `start_time` |
| `Timeslot.booking_url` | `type: string` with a URL example — null in all 165 observed |
| `ProviderLocation.first_availability_date_in_provider_local_time` | `type: string` |
| `ProviderLocation.virtual_location` | `$ref: VirtualLocation` |
| `Location.phone_extension` | `type: string` |
| `search_parameters.available_from_in_provider_local_time` | `type: string` |
| `search_parameters.available_to_in_provider_local_time` | `type: string` |

None of the values are surprising — an in-person provider has no `virtual_location`. The
point is that **our hand-written types must add `| null` wherever the spec says `string` or
`$ref`**, and that a generated client would be wrong at every row above. Treat spec
non-nullability as unreliable throughout, not just at the fields listed here.

`booking_url` deserves its own line: documented as a bookable deep link, `null` in every
timeslot we saw. Presumably syndication-only. Never render a link from it without a check.

## Auth status

Token minting is unresolved and is **not a code problem**.

- Token endpoint: `POST https://auth-api-developer-sandbox.zocdoc.com/oauth/token`
- Grant: `client_credentials`, credentials in the JSON body, no scope
- Audience: `https://api-developer-sandbox.zocdoc.com/` — **trailing slash is significant**
- Lifetime: 60 minutes

The Auth0 tenant behind the vanity host is `production-api-developer-sandbox.us.auth0.com`
(identical JWKS `kid`s confirm they are one tenant). Current credentials
(`client_id tpfGZTg3…`) produce:

| Host | Result | Meaning |
|---|---|---|
| vanity | `400 invalid_request` — `Invalid domain … for client_id` | secret is valid; client not enabled for the custom domain |
| canonical | `403 access_denied` — `Unauthorized` | secret is valid; client denied at the token endpoint |

The 401-vs-403 distinction is the discriminator, and it is the **only** one: a wrong
secret on a known client_id gives 401, a correct secret gives 403.

**Correction (2026-08-04).** An earlier version of this section claimed the 403 meant
"secret and audience valid, only the client grant missing." That was wrong. Probing the
canonical tenant returned an identical 403 for the documented audience, the same audience
without its trailing slash, the production audience, a nonsense audience, an omitted
audience, the tenant's own management audience, and even a bogus `grant_type`. So the
denial lands after credential validation but *before* Auth0 parses the grant type or
resolves the audience — which also rules out a Client Credentials Exchange Action, since
a bogus grant type would never reach one.

Consequences: **never cite the 403 as evidence the audience or scopes are correct.**
Three distinct client_ids (`tpfGZTg3…`, `nvnuFoLxjD…`, `V05AEQjJGN…`) behave identically,
so more pairs from the same spreadsheet will not help — that is measured, not assumed.
The reading that survives is that these are clients of this tenant with valid secrets
that are not provisioned to issue machine-to-machine tokens at all. Fixing it needs
Zocdoc-side provisioning; `https://api-docs.zocdoc.com/guides/authentication.md` confirms
credentials are issued rather than self-served, so there is no local workaround to find.

`scripts/find-sandbox-credentials.ts` tests every `ZOCDOC_CLIENT_ID_n` /
`ZOCDOC_CLIENT_SECRET_n` pair in `.env.local` against both hosts and reports which, if
any, is provisioned. It never prints secrets.

### Addendum (2026-08-04): the credentials are probably production credentials

Do not escalate for sandbox provisioning yet. Burton relayed that these credentials are
for **production**, not sandbox. That fits every measurement above without contradicting
any of them: a client of one Auth0 tenant presenting itself to a different tenant's token
endpoint is denied after secret validation and before grant parsing, which is exactly the
403 recorded here. `https://api-docs.zocdoc.com/guides/authentication.md` confirms the
environments are separately credentialed — *"You'll receive unique credentials … for each
of Zocdoc's environments (sandbox and production)"* and *"Use separate credentials for
sandbox and production."*

So the conclusion above — "not provisioned to issue machine-to-machine tokens at all …
fixing it needs Zocdoc-side provisioning" — is **probably wrong**. It is a host and
audience mismatch, which is fixable locally. Production values, from the docs and the
OpenAPI `servers` block rather than inferred:

| | Value |
|---|---|
| Token endpoint | `POST https://auth.zocdoc.com/oauth/token` |
| Audience | `https://api-developer.zocdoc.com/` (trailing slash significant) |
| API base | `https://api-developer.zocdoc.com` |

**Unverified, and it is the load-bearing claim:** that these production credentials are
themselves scoped to test data. Nothing in the docs supports it, and the docs say the
opposite about handling — *"Sandbox credentials can be securely distributed to developers
for use. Production secrets should be used only by secure backend services."* Until
someone at Zocdoc confirms the scoping, treat production responses as real.

Consequences for testing, which are not symmetric between reads and writes:

- Every sentinel in `client/mock/fixtures.ts` is **sandbox-only**. The testing-data guide
  opens with *"The sandbox environment includes special-case inputs and predefined
  provider test data."* On production, `11201` is a real Brooklyn ZIP returning real
  practices, and `pr_no_availbility` and the eight booking-status ids do not exist.
- Reference data (specialties, visit reasons, insurance plans) is catalog data with no
  patient fields, so it is safe to record from production.
- **`POST /v1/appointments` against production is authorized** as of 2026-08-04, and
  `scripts/verify-production-booking.ts` implements it. Two things an earlier version of
  this note got wrong, both of which mattered:
  - It called a booking **irreversible**. It isn't: `POST /v1/appointments/cancel` takes an
    `appointment_id` and a `cancellation_reason_type`, and a machine-to-machine credential
    can cancel anything it booked. The booking script cancels in a `finally`, so the
    appointment comes off the calendar even if the run fails midway.
  - It claimed there is **no compliant way** to submit patient data, because PHI-002 sources
    test data from scenarios that are sandbox-only. The rule's purpose is that no test datum
    correspond to a real person, and standards-reserved ranges satisfy that better than the
    sandbox sentinels do: phone `212-555-0123` (NANP reserves 555-0100–0199 as unassignable)
    and `@example.com` (RFC 2606). The email choice is the load-bearing one — booking sends
    a confirmation, so a plausible address would have mailed a stranger an appointment
    confirmation for care they never asked for.

Authorized scope is now reads **and** the booking round-trip.
`scripts/verify-production-reference-data.ts` keeps its GET-only guarantee and stays read-only;
booking lives in a separate file so that guarantee is not weakened by adding a method
parameter to it.

### The booking round-trip, verified 2026-08-04

Two appointments were booked and cancelled against production. Both returned
`200 pending_booking` on create and `200 cancelled` on cancel, so nothing is left on any
calendar. Findings are folded into `POST /v1/appointments` above; the response *shape* (keys
and types, no values) is in `__fixtures__/appointment-response-shape.json`.

Two appointments rather than one because the first run tripped the script's own method
allowlist on the status read — a `GET /v1/appointments` this file had never declared. That
run is the best evidence the safety design works: the allowlist refused an undeclared call,
and the `finally` still cancelled the appointment before the error propagated. The bug was a
missing allowlist entry, not a missing cancel.

### The sandbox initially blocked the booking POST

Before Burton widened the rule, the script ran end-to-end up to the POST and got
`567 Access to this URL is blocked by network policy`. The agentic sandbox's HTTP allow-list
is verb-scoped, and the production host shipped read-only:

| Host | Path | Verbs |
|---|---|---|
| `api-developer.zocdoc.com` | `/v1/*` | `GET` |
| `api-developer-sandbox.zocdoc.com` | `/v1/*` | `GET`, `POST` |

The sandbox *environment* permitted booking while *production* did not — the reverse of what
the naming suggests. `sbx` is not runnable from inside the sandbox, so Burton ran this
outside it on 2026-08-04, after which the POST succeeded:

```
sbx proxy rules add api-developer.zocdoc.com --path "/v1/*" --verbs "GET|POST"
```

Worth knowing for anyone hitting a 567 here: it comes from the local proxy, so the request
never reaches Zocdoc — a blocked booking attempt cannot have booked anything.

Nothing was booked while this was blocked; the 567 arrives before the request reaches Zocdoc.

## Fixtures

*Updated 2026-08-04 — this section previously said the directory was empty and that
recording was blocked on a token. Both are now out of date.*

`packages/api-components/src/client/__fixtures__/` holds five recorded responses:
`specialties.json`, `visit-reasons.json`, `insurance_plans.json`,
`provider-locations.json`, and `availability.json`. See that directory's `README.md` for
sources, dates, and why each capture was parameterized the way it was.

**The JSON files are gitignored** (`.gitignore` ignores `__fixtures__`); only the README in
that directory is tracked. They are local reconnaissance artifacts — regenerate them by
re-running the recording script. Nothing in the test suite reads them; component and
client tests run off the hand-written `client/mock/` fixtures instead. Anything a test
needs to assert has to be carried over into `mock/` deliberately, which is what the
`booking_url: null` and `first_availability: null` changes there do.

Recording is unblocked for **reads**, following authorization to test against production on
2026-08-04. That covers reference data, provider search, and availability. **Booking
fixtures stay hand-written** from the documented sandbox scenarios — a production
`POST /v1/appointments` is a real appointment at a real provider's office, and the
recording script has no way to issue one.

**No PHI has been recorded.** Catalogs contain no patient fields, and neither search nor
availability responses have a patient in them at all. This is enforced, not assumed: the
recording script scans every response for patient-shaped keys and refuses to write the
fixture on a hit. All five files were scanned clean.
