# API Contract Notes

Source of truth for Tasks 5–8. Records the observed Zocdoc sandbox contract.

**Evidence basis:** the machine-generated OpenAPI operation tables published at
`https://api-docs.zocdoc.com/apis/**.md`, **API version 1.177**, retrieved 2026-08-04.
These are generated from the spec, not hand-written prose, and they carry per-parameter
types, requiredness, enums, and full response field paths.

**Live verification: not yet performed.** The sandbox credentials we hold authenticate
but have no client grant for the sandbox API audience, so no request has been issued
against a live endpoint. See [Auth status](#auth-status). Everything below is
spec-derived; items that the spec leaves genuinely underspecified are flagged
**[NEEDS LIVE CHECK]** rather than guessed.

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
real and accepted. This is corroborated by the booking guide's verbatim curl example:

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
  next_url: string;     // null on the last page (typed string, nullable in practice)
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
| `page_size` | integer | |
| `insurance_plan_id` | string | |
| `visit_type` | string | `all` \| `in_person` \| `video_visit`; defaults to `in_person` |
| `max_distance_to_patient_mi` | integer | default 50 |

`visit_type` defaulting to `in_person` is worth noting — a search that should include
virtual providers must pass `all` explicitly.

Provider-location object fields:

- `provider_location_id` — e.g. `pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890`.
  **Contains a literal `|`**, so it must be percent-encoded in query strings and paths.
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
require (Task 13). Its enum values are not enumerated in the spec.
**[NEEDS LIVE CHECK]** — capture a real response before hardcoding form logic.

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

Note the guide says "30 days or less" while the OpenAPI table says "31 days or less".
Treat **31** as the limit only if live-confirmed; clamping to 30 is safe either way.

`data` is an array; each item:

- `provider_location_id`
- `first_availability: { start_time, visit_reason_id, booking_url }` —
  `start_time` is ISO-8601 **with a timezone offset in the provider's local zone**
  (`2022-04-27T09:00:00-04:00`). Per I18N-002, render via `Intl.DateTimeFormat`.
- `timeslots` — array. **[NEEDS LIVE CHECK]** the spec does not document the item
  fields. Presumably the same shape as `first_availability`, but Task 12
  (`zd-availability-picker`) depends on this and must not be written against a guess.

Empty availability returns an **empty array for that provider location**, not an error —
which maps cleanly onto the `empty` state required by COMP-001.

`booking_url` is documented as a **non-PHI** deep link; UTM params are appended
automatically.

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

Response `data`: `appointment_id`, `appointment_status`, `developer_patient_id`,
`is_provider_resource`, `location_phone_number`, `location_phone_extension`,
`waiting_room_path`, `confirmation_type`.

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

## Fixtures

`packages/api-components/src/client/__fixtures__/` is **empty**. Recording real responses
requires a working token, so Task 2 Step 3 and Step 5 remain open. Tasks 5–8 can proceed
against the contract above; their tests should use hand-written fixtures matching these
documented shapes, replaced with recorded responses once a token exists.

No PHI has been recorded anywhere, since no live response has been captured.
