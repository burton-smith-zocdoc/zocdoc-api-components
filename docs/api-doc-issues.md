# Zocdoc API documentation: discrepancies found during integration

Feedback from building a client library against the public API. Each item is a place where
the published documentation disagrees with the API's actual behavior, with itself, or
leaves a required field underspecified. Most are small fixes; three have failure modes
serious enough that we'd suggest prioritizing them.

Nothing here is a complaint about the API's behavior — in every case the server is doing
something reasonable and the documentation describes something else.

**Evidence basis**

- OpenAPI bundle: `https://api-docs.zocdoc.com/_bundle/apis/index.yaml`, **version 1.177**.
  Retrieved 2026-08-04 and re-fetched the same day at identical size, so the line numbers
  below should still resolve.
- Operation summaries: `https://api-docs.zocdoc.com/apis.md`.
- Guides: `https://api-docs.zocdoc.com/guides/testing-data`.
- Runtime behavior: live responses on 2026-08-04 from `GET /v1/specialties`,
  `GET /v1/visit_reasons`, `GET /v1/insurance_plans`, `GET /v1/provider_locations`,
  `GET /v1/provider_locations/availability`, `POST /v1/appointments`,
  `GET /v1/appointments/{id}`, and `POST /v1/appointments/cancel` against
  `api-developer.zocdoc.com`. The
  provider-search and availability samples cover 41 provider locations across four ZIP
  codes and one availability response containing 164 timeslots. The availability window
  boundary in issue 3 was tested directly, at both 30 and 31 days.

**How to read the scope caveats.** Items making claims about runtime behavior say what was
called and how large the sample was. The remaining items are documentation-only findings —
verifiable by reading the published spec, needing no API access. The booking path **was**
exercised — see "Scope of the booking test" at the end — so the null-value evidence in
issue 2 now covers it; the one place we still confine a claim to what the document says is
issue 6, `required_fields`, which we explain there.

## Summary

| # | Issue | Area | Severity |
|---|---|---|---|
| 1 | `next_url` documented as `null` on the last page; API returns `""` | Paged envelope | **High** — can cause an unterminated paging loop |
| 2 | The spec never marks any field nullable, but many fields return `null` | Whole spec | **High** — every generated client is mistyped |
| 3 | Availability window rejects 31 days, which the docs and its own error message allow | Availability | **High** — documented boundary returns 400 |
| 4 | `InsuranceNetworkType` has no `enum`, and its listed names aren't the wire values | Schema | Medium |
| 5 | `InsuranceProgramType` prose describes 6 of its 9 enum values, ambiguously | Schema | Medium |
| 6 | `booking_requirements.required_fields` is an open `string` with a non-exhaustive list | Booking | Medium |
| 7 | `phone_number`'s validation rule is prose-only, with no `pattern` | Schema | Medium |
| 8 | `/v1/provider_locations` documents no default or bounds for `page_size` | Paging | Low |
| 9 | Operation summary names a parameter (`accepted insurance`) that doesn't exist | Prose | Low |
| 10 | `pr_no_availbility` / `lo_no_availbility` misspelled in the testing guide | Guide | Low — needs a coordinated fix |
| 11 | Typos: "availaibility", and "mimimum" six times | Spec | Trivial |

Three non-defect suggestions follow at the end.

---

## 1. `next_url` is documented as `null` on the last page; the API returns `""`

**Severity: High.** This is the one we'd suggest fixing first.

**Location:** bundle line 2958, in the shared paged response envelope.

**Documented:**

> `next_url`: A link to the next page of results; null if this is the last page of results.

**Observed:** an **empty string** on the last page — consistently, on all of
`/v1/specialties`, `/v1/visit_reasons`, `/v1/insurance_plans`, and `/v1/provider_locations`.

**To reproduce:** `GET /v1/specialties?page=0&page_size=500` and inspect `next_url` on the
final page.

**Why this one matters more than the others.** The documented sentence naturally leads to
`while (next_url !== null)`. Because `""` is not `null`, that loop never terminates: a
client written faithfully from the docs re-requests the last page indefinitely. The failure
is an unbounded request loop against production rather than a parse error or an exception,
so it tends to survive code review and show up as traffic.

**The spec also contradicts itself here**, independent of runtime behavior. `next_url`
appears in the envelope's `required` list (line 2947) and is typed `type: string` with no
`nullable: true`. So the schema promises "always present, always a string" while its own
description says the value can be null. A generated client follows the schema, a human
follows the prose, and the two produce different code — only one of which matches the
server.

**One more inconsistency to fold into the same fix:** there is a second, separate
`next_url` definition at line 3923 (calendar integration), described as "Complete URL for
fetching the next page (convenience field)" with no nullability claim at all. Whichever
behavior is authoritative, it would help if the two definitions agreed.

**Suggested fix:** document that `next_url` is an empty string on the last page and drop
the "null" language. If some endpoints genuinely do return `null`, please name them and add
`nullable: true` to those, so the schema and the prose stop disagreeing.

## 2. The spec never marks any field nullable, but many fields return `null`

**Severity: High.** Broader than #1, which is one instance of it.

**Location:** the whole bundle. The spec declares `openapi: 3.0.0`, in which `nullable:
true` is the only way to express that a value may be null. The string `nullable` appears
**zero times** in the document.

Yet null values are routine. Across recorded production responses from the search,
availability, and booking paths, **fourteen** distinct field paths came back `null`:

| Field path | Occurrences | Declared as |
|---|---|---|
| `Availability.first_availability` | 2 | `$ref: Timeslot` (an object) |
| `Timeslot.booking_url` (inside `timeslots`) | 164 | `type: string` |
| `Timeslot.booking_url` (inside `first_availability`) | 1 | `type: string` |
| `ProviderLocation.first_availability_date_in_provider_local_time` | 2 | `type: string` |
| `ProviderLocation.virtual_location` | 3 | `$ref: VirtualLocation` |
| `Location.phone_extension` | 3 | `type: string` |
| `search_parameters.available_from_in_provider_local_time` | 1 | `type: string` |
| `search_parameters.available_to_in_provider_local_time` | 1 | `type: string` |
| `Appointment.developer_patient_id` | 2 | `type: string` |
| `Appointment.location_phone_extension` | 2 | `type: string` |
| `Appointment.waiting_room_path` | 2 | `type: string` |
| `Appointment.notes` | 2 | `type: string` |
| `Appointment.cancellation_reason` | 1 | `type: string` |
| `Appointment.source` | 1 | `type: string` |

The last six are from `POST /v1/appointments` and `GET /v1/appointments/{id}`. Every one is
declared `type: string`, and every one arrived as an explicit `null` rather than being
omitted — which is the distinction that matters, since in OpenAPI 3.0 "optional" and
"nullable" are different claims and only the first is expressible here.

`source` deserves a mention of its own: it's described as "The channel where the appointment
was booked (e.g. \"Zocdoc Marketplace\", \"Your website\")", which reads like a value that
always exists, and it was `null` on an appointment that had definitively just been booked
through a channel.

None of these are surprising values — an in-person provider has no `virtual_location`, a
provider with no open slots has no `first_availability`. The issue is purely that the
schema has no way to say so, so every code generator emits a non-nullable type and every
consumer built from it is wrong at exactly these points.

`first_availability` is the sharpest case: it `$ref`s `Timeslot`, and `Timeslot` declares
`required: [start_time]`. A null there isn't merely unmarked, it's unrepresentable under the
schema as written — a strict validator should reject the server's own response.

**(b) A specific instance worth its own sentence: `booking_url` was null in all 165
timeslots we observed.** It is documented (line 3385) as a `type: string` with a full URL
example and this description:

> Non-PHI deep link URL that allows developers to book this specific timeslot on
> zocdoc.com.

We'd guess it's populated only for syndication clients, which would be entirely reasonable
— but nothing in the spec says that, so from the documentation alone the field reads as
always available. An integrator planning to link out to Zocdoc for booking would design
around a field that, for their client, is never there.

**Suggested fix:** add `nullable: true` to the fields that can be null. If that's a large
sweep, the availability and provider-location schemas are where it pays off first, since
those are the null-heavy ones. Separately, document the condition under which `booking_url`
is populated.

## 3. The availability window rejects the exact value the docs and the API's own error message allow

**Severity: High.** A caller who follows the documented bound gets a 400.

**Location:** bundle lines 367–372 — `end_date_in_provider_local_time` on
`GET /v1/provider_locations/availability`.

> The last inclusive date to retrieve availability for, as YYYY-MM-DD. Defaults to 7 days
> after the current date. **Must be 31 days or less after the start date.**

**Observed 2026-08-04.** A 31-day span is rejected:

```
GET /v1/provider_locations/availability
  ?start_date_in_provider_local_time=2026-08-04
  &end_date_in_provider_local_time=2026-09-04     # exactly 31 days

400 { "error_type": "invalid_request",
      "errors": [ { "field": "availability_range_in_days",
                    "message": "The EndDateInProviderLocalTime must be between 0 and 31
                                days after the StartDateInProviderLocalTime." } ] }
```

The same request with `2026-09-03` — 30 days — returns `200`.

So the bound is enforced as `< 31`, while **two** independent descriptions of it say `<= 31`:
the parameter description, and the API's own rejection message. The error message is the
part we'd flag hardest, because it makes the failure self-contradicting: it rejects 31 days
while stating that 31 days is permitted, which reads as a server bug rather than a caller
error and sends you looking in the wrong place. We assumed our date arithmetic was off and
checked it twice before concluding the bound was simply one lower than advertised.

This is a boundary that integrators will hit deliberately, not by accident — asking for the
largest window the docs allow is the natural way to minimize round-trips.

**Suggested fix:** whichever is intended. If the limit is 30, correct the description and
the error message to say 30. If it's 31, the comparison is off by one. Either way the two
messages should agree with each other and with the behavior.

## 4. `InsuranceNetworkType` has no `enum`, and the names listed aren't the wire values

**Location:** bundle lines 2734–2748.

The schema is a bare `type: string`. Its description lists eleven display names as markdown
bullets: `HMO`, `PPO`, `POS`, `EPO`, `Indemnity`, `ASO`, `ACO`, `ACP`, `Medicare`,
`Medicaid`, `Other`.

There are two separable problems.

**(a) It's the only one of four sibling reference schemas without an `enum` list.**
`InsuranceProgramType` (line 2887), `InsuranceStatus` (2920), and `CareCategory` (2551) all
carry proper `enum` arrays. `InsuranceNetworkType` does not, so it generates as an open
`string` in every typed client while its three siblings generate as closed unions. Inside a
single schema family, that asymmetry reads more like an oversight than a deliberate choice
— which is why we're raising it rather than working around it silently.

**(b) The bullet names are display labels, not the values sent on the wire.** Responses use
lowercase snake_case. Distinct values observed across `/v1/insurance_plans`:

```
epo, hmo, hmo_pos, indemnity, medicaid, other, pos, ppo, uncategorized
```

Compared against the documented bullets, **`hmo_pos` and `uncategorized` appear nowhere in
the list under any casing.**

Conversely, `ASO`, `ACO`, `ACP`, and `Medicare` are documented but did not appear in our
sample. That may simply mean our sample didn't reach them, so please treat it as
unconfirmed rather than as a second finding.

**Suggested fix:** add an `enum` containing the actual wire values, and keep the friendly
names as a description mapping alongside it rather than in place of it.

**Impact if left as-is:** integrators can't safely type this field, and can't discover the
valid filter values for the `network_type` query parameter (line 1578) without sampling
production data.

## 5. `InsuranceProgramType`'s prose describes 6 of its 9 enum values, ambiguously

**Location:** bundle lines 2887–2907. Same schema family as #4.

The `enum` itself is correct and complete as far as we can tell — every value we observed in
production appears in it. The problem is the description below it, which bullets only six
categories: Commercial, ACA Marketplace, Medicare, Medicaid, Worker's Compensation,
Uncategorized. That leaves **`medicare_advantage`, `medicaid_managed_care`, and `federal`
undescribed**.

The naming then crosses over in a way that makes the gap actively misleading:

- The bullet labelled **Medicare** describes "Medicare advantage plans" — but `medicare` and
  `medicare_advantage` are *both* separate enum values.
- The bullet labelled **Medicaid** describes "Medicaid Managed Care plans" — but `medicaid`
  and `medicaid_managed_care` are likewise both separate values.

So for either pair, the documentation gives no way to determine which value to send. As a
`program_type` filter, guessing wrong returns a different set of plans rather than an error,
so the mistake is silent.

**Suggested fix:** one bullet per enum value, and an explicit note on how `medicare` differs
from `medicare_advantage` and `medicaid` from `medicaid_managed_care`.

## 6. `booking_requirements.required_fields` is an open `string` with a non-exhaustive list

**Location:** bundle lines 2476–2493 (`BookingRequirements`), returned by
`GET /v1/provider_locations`.

```yaml
required_fields:
  type: array
  items:
    type: string
    description: >-
      Options include `data.patient.insurance.insurance_plan_id` and
      `data.patient.insurance.insurance_member_id`
```

Two things make this hard to build against. There is no `enum`, and the description says
"**Options include**" — explicitly non-exhaustive. So the documented set is open-ended by
its own wording, and a client has no way to enumerate what it might receive.

**Why this is more than a typing nit.** This field is the API telling the integrator which
patient fields to collect before booking. A patient form has to be built from it. If an
unlisted value can appear, then either the form silently ignores a requirement — and the
booking fails at submit, after the patient has filled everything in — or the integrator
hardcodes the two documented values and hopes. Note the sibling field
`accepts_booking_requests_from` in the same schema *does* `$ref` a proper enum
(`BookingRequestInsuranceSource`), so the inconsistency is visible within one object.

**We tried to settle this empirically and could not**, which we think strengthens the case
rather than weakening it. Across 13 provider locations returned by live searches, every
single one came back `required_fields: []`. The sibling `accepts_booking_requests_from` was
populated on all of them (values observed: `in_network`, `self_pay`). So sampling production
does not reveal the possible values either — the documentation is genuinely the only
available source, and it declines to be exhaustive.

**Suggested fix:** replace with an `enum` of the complete set of dotted paths that can be
returned. If the set genuinely is open-ended and may grow, please say so explicitly and
document the expected client behavior on encountering an unrecognized value, since
"ignore it" and "block the booking" have very different consequences.

## 7. `phone_number`'s validation rule is prose-only, with no `pattern`

**Location:** bundle lines 2992–2997 (the `Patient` schema).

**Documented:**

> The patient's unformatted 10 digit phone number. The first and fourth digits cannot be a 0
> or 1.

The rule is real and enforced server-side. But it exists only in the description — there is
no `pattern`, and no `minLength`/`maxLength`. Generated clients therefore accept any string,
and the constraint is discovered when the API rejects the request.

**Why it's worth fixing:** this field is on the booking path. Without a machine-readable
constraint, a client can't validate at the form boundary, so what should be an inline
field-level message becomes a failed booking submission after the patient hits submit.

**Suggested fix:** add `pattern: '^[2-9][0-9]{2}[2-9][0-9]{6}$'` — or whatever precisely
matches the server rule — plus `minLength: 10` / `maxLength: 10`, and keep the prose as the
human-readable explanation.

**Worth an explicit callout in the guides, too.** The North American convention for
fictional numbers is `555-xxx-xxxx`, which yields `5551234567` — whose fourth digit is `1`.
The most idiomatic placeholder available is therefore invalid under this rule, and the
resulting rejection looks like a bug in the integration rather than a bad example. A
one-line "note that `555-123-4567` is not a valid test value; use e.g. `9999999999`" would
save people the detour. (The bundle's own `example: '9999999999'` is correct.)

## 8. `/v1/provider_locations` documents no default or bounds for `page_size`

**Location:** bundle lines 190–197 — the `page` and `page_size` parameters on
`GET /v1/provider_locations`.

Both descriptions are bare:

> `page`: The zero indexed page of results.
> `page_size`: The number of results to return per page.

No default, no minimum, no maximum. Sibling endpoints document all three —
`GET /v1/appointments` says "A mimimum value of 1 and a maximum of 60000 will be accepted"
(line 716), and `GET /v1/schedulable_entities` says "The default value is 5000. A mimimum
value of 1 and a maximum of 10000 will be accepted" (line 1301), the latter also carrying
`minimum` / `maximum` keywords in the schema so the bound is machine-readable.

**Observed:** omitting `page_size` yields **10** results per page. A search returning
`total_count: 27` therefore needs three round-trips by default, which is easy to
under-anticipate when the documentation is silent and the neighbouring endpoints default to
thousands.

**Suggested fix:** state the default (10) and the accepted range, matching how the sibling
endpoints already document theirs.

## 9. An operation summary names a parameter that doesn't exist

**Location:** `https://api-docs.zocdoc.com/apis.md`, line 98 — the summary for
`GET /v1/provider_locations`.

> "This endpoint accepts parameters such as zip code, specialty, visit reason and accepted
> insurance to return a filtered set of providers within the developer's directory."

Read as prose this is fine. Read as a parameter list — which is how it scans, since it says
"accepts parameters such as" and then lists four things — it's misleading in three ways:

- The real parameter names are `zip_code`, `specialty_id`, `visit_reason_id`.
- The insurance filter is `insurance_plan_id`.
- The string `accepted_insurance` **does not appear anywhere in the spec** (0 occurrences in
  the bundle), so there is no parameter matching that phrase under any spelling.

This cost us a genuine detour: we spent time trying to reconcile "specialty" and "accepted
insurance" against the `_id`-suffixed names in the operation's own parameter table before
concluding the sentence was descriptive prose rather than a list of identifiers. For the
record, we confirmed live that `specialty` is not accepted — sending it in place of
`specialty_id` returns `400 invalid_request` with "One of SpecialtyId or VisitReasonId is
required", i.e. the parameter is simply unrecognized.

**Suggested fix:** either use the actual parameter names in backticks, or rephrase so the
sentence doesn't read as an enumeration — e.g. "filter by ZIP code, specialty, visit reason
and insurance plan" reads as categories rather than identifiers.

## 10. Testing guide: `pr_no_availbility` / `lo_no_availbility` are misspelled

**Location:** `https://api-docs.zocdoc.com/guides/testing-data`, scenario table (line 65 of
the markdown rendering). Still present as of 2026-08-04.

> `pr_no_availbility` / `lo_no_availbility` — Returns no availability.

"availbility" is missing its second `a`. The correctly spelled form appears **nowhere** in
the guide, which suggests these are the real identifiers in the sandbox data rather than a
rendering typo.

**Please don't fix this as a documentation-only edit.** If the spelling is corrected in the
guide while the sandbox still serves the misspelled ids, every integrator who trusts the
docs gets a 404 — strictly worse than the current state. Two safe options:

1. Change the sandbox identifiers and the guide together, ideally with the old ids kept as
   aliases for a deprecation window; or
2. Leave the spelling as-is and add a short note that it's a known misspelling preserved for
   compatibility.

Either is fine from our side. We've preserved the misspelling verbatim so that nobody
"corrects" it later.

## 11. Typos in schema descriptions

Unlike #10, these are in human-readable descriptions rather than identifiers, so they're safe
to fix outright with no compatibility concern.

- **"availaibility"** — bundle line 2307, `AvailabilityResult.data`:
  `description: Response containing the availaibility information.`
- **"mimimum"** — six occurrences, in the `page` and `page_size` descriptions of
  `/v1/appointments` (lines 708, 716), `/v1/reference/npi` (1231, 1238), and
  `/v1/schedulable_entities` (1292, 1301). The word is spelled correctly elsewhere in the
  document, so these are isolated slips rather than a house style.

---

## Three suggestions (not defects)

These are judgement calls rather than errors, separated out so the list above stays strictly
factual.

**Note that `provider_location_id` contains a `|`, and that it's safe unencoded.** The ids
look like `pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890`, and they're passed as a
required query parameter — `GET /v1/provider_locations/availability` takes
`provider_location_ids` as a comma-delimited list of up to 50. A vertical bar is not a legal
unescaped character in a URI query string, and the spec never mentions encoding: searching
for "percent-encode", "URL-encode", or any equivalent returns nothing, and every example
shows the bar raw.

We initially expected this to be a defect and tested both forms. **It isn't** — the server
returns `200` whether the bar is sent raw or as `%7C`, so the examples as printed do work.
We're keeping it as a suggestion only because the reader can't tell that from the docs, and
the safe-looking assumption (that it must be encoded, or that it must not be) is a coin
flip. One sentence confirming that either form is accepted would settle it.

**`/v1/insurance_plans` is impractical to enumerate, and nothing signals that.** The
endpoint reports `total_count: 10677`. At the maximum `page_size` of 500, retrieving all of
it is 22 sequential round-trips and several megabytes of JSON — typically to populate a
single dropdown. The filter parameters (`state`, `care_category`, `network_type`,
`program_type`, `status`) are all documented, but nothing indicates that unfiltered use
doesn't scale. A short note recommending `state` as a first filter would likely prevent a
lot of slow initial integrations.

**Zero-indexed paging is worth emphasizing.** The spec does state this clearly at line 2950
("The zero based index of the current page"), so this is not an inaccuracy. We mention it
only because it's the opposite of most paginated APIs, and the cost of assuming otherwise is
a silently skipped first page rather than an error. Worth a callout in the pagination guide.

---

## Scope of the booking test

We booked and cancelled two real appointments on 2026-08-04 to verify the booking path,
rather than reasoning from the spec alone. Both were cancelled via
`POST /v1/appointments/cancel`, which returned `appointment_status: "cancelled"` both times.
Flagging it here in case it shows up in your metrics: the provider location was a
Dermatologist in 11201 and the slot was ~30 days out, chosen to be the least disruptive one
available.

The test patient was fabricated from ranges reserved by standard to be unusable — phone in
the NANP's `555-0100`–`555-0199` fictional block, email on RFC 2606's `example.com` — rather
than realistic-looking placeholders, specifically so no confirmation could reach a real
person. We mention it because the sandbox test scenarios (`pr_pending`, `pr_confirmed`,
`pr_bookingfailed`) have no production equivalent, which is worth knowing if you ever want
integrators to be able to verify the booking path against production without inventing
patient data. A documented production test provider would solve it.

One side note that made verification harder than it needed to be: the `.md` twin convention
works for `apis`, `guides/testing-data`, and `apis/appointments/createappointment`, but
`guides/booking` and `apis/appointments/getappointmentbyid` both return the HTML app shell
instead. We fell back to the OpenAPI bundle for those. Consistent `.md` availability would
make the docs much easier to verify programmatically.

---

## Summary of what we'd ask for

1. Fix the `next_url` description and reconcile it with the schema's `required` +
   non-nullable `string` typing. *(High)*
2. Add `nullable: true` to the fourteen fields that return null — availability,
   provider-location, and appointment schemas — and document when `booking_url` and `source`
   are populated. *(High)*
3. Reconcile the availability window: make the description, the error message, and the
   enforced comparison agree on 30 or 31. *(High)*
4. Add an `enum` to `InsuranceNetworkType` with the real wire values. *(Medium)*
5. Complete and disambiguate the `InsuranceProgramType` description. *(Medium)*
6. Enumerate `booking_requirements.required_fields`, or document the contract for
   unrecognized values. *(Medium)*
7. Add a machine-readable `pattern` to `phone_number`. *(Medium)*
8. Document `page_size`'s default and bounds on `/v1/provider_locations`. *(Low)*
9. Reword the `provider_locations` summary so it doesn't read as a parameter list. *(Low)*
10. Decide on the `availbility` spelling — coordinated with the sandbox data, not docs-only.
   *(Low)*
11. Fix the "availaibility" and "mimimum" typos. *(Trivial)*

Happy to re-verify any of these, or to check behavior on endpoints outside the ones we
exercised, if that would help.
