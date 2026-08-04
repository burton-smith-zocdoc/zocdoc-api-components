# Zocdoc API documentation: discrepancies found during integration

Feedback from building a client library against the public API. Each item is a place where
the published documentation disagrees with the API's actual behavior, with itself, or
leaves a required field underspecified. All are small fixes; one has a failure mode serious
enough that we'd suggest prioritizing it.

Nothing here is a complaint about the API's behavior — in every case the server is doing
something reasonable and the documentation describes something else.

**Evidence basis**

- OpenAPI bundle: `https://api-docs.zocdoc.com/_bundle/apis/index.yaml`, **version 1.177**.
  Retrieved 2026-08-04 and re-checked the same day — byte-identical, so the line numbers
  below should still resolve.
- Operation summaries: `https://api-docs.zocdoc.com/apis.md`.
- Guides: `https://api-docs.zocdoc.com/guides/testing-data`.
- Runtime behavior: live responses from `GET /v1/specialties`, `GET /v1/visit_reasons`,
  and `GET /v1/insurance_plans` on 2026-08-04.

**How to read the scope caveats.** Only items 1–4 make claims about runtime behavior, and
those cover the three reference-data endpoints above. Items 5–9 are documentation-only
findings — they're verifiable by reading the published spec and need no API access, so
they hold regardless of which endpoints we exercised. Where an item concerns an endpoint we
did not call (provider search, availability, booking), we say so and confine the claim to
what the document says.

## Summary

| # | Issue | Area | Severity |
|---|---|---|---|
| 1 | `next_url` documented as `null` on the last page; API returns `""` | Paged envelope | **High** — can cause an unterminated paging loop |
| 2 | `InsuranceNetworkType` has no `enum`, and its listed names aren't the wire values | Schema | Medium |
| 3 | `InsuranceProgramType` prose describes 6 of its 9 enum values, ambiguously | Schema | Medium |
| 4 | `booking_requirements.required_fields` is an open `string` with a non-exhaustive list | Booking | Medium |
| 5 | `phone_number`'s validation rule is prose-only, with no `pattern` | Schema | Medium |
| 6 | `provider_location_id` contains a literal `\|`; no encoding guidance anywhere | Query params | Medium |
| 7 | Operation summary names a parameter (`accepted insurance`) that doesn't exist | Prose | Low |
| 8 | `pr_no_availbility` / `lo_no_availbility` misspelled in the testing guide | Guide | Low — needs a coordinated fix |
| 9 | Typo: "availaibility" in a schema description | Spec | Trivial |

Two non-defect suggestions follow at the end.

---

## 1. `next_url` is documented as `null` on the last page; the API returns `""`

**Severity: High.** This is the one we'd suggest fixing first.

**Location:** bundle line 2958, in the shared paged response envelope.

**Documented:**

> `next_url`: A link to the next page of results; null if this is the last page of results.

**Observed:** an **empty string** on the last page — consistently, on all three of
`/v1/specialties`, `/v1/visit_reasons`, and `/v1/insurance_plans`.

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

## 2. `InsuranceNetworkType` has no `enum`, and the names listed aren't the wire values

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

## 3. `InsuranceProgramType`'s prose describes 6 of its 9 enum values, ambiguously

**Location:** bundle lines 2887–2907. Same schema family as #2.

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

## 4. `booking_requirements.required_fields` is an open `string` with a non-exhaustive list

**Location:** bundle lines 2477–2488 (`BookingRequirements`), returned by
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

**Scope note:** this is a documentation observation only. We have not called
`/v1/provider_locations` live, so we can't say which values actually occur — that's
precisely the problem we're reporting.

**Suggested fix:** replace with an `enum` of the complete set of dotted paths that can be
returned. If the set genuinely is open-ended and may grow, please say so explicitly and
document the expected client behavior on encountering an unrecognized value, since
"ignore it" and "block the booking" have very different consequences.

## 5. `phone_number`'s validation rule is prose-only, with no `pattern`

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

## 6. `provider_location_id` contains a literal `|`, with no encoding guidance anywhere

**Location:** the id format appears throughout; e.g. bundle line 2291
(`Availability.provider_location_id`) and line 2477's neighbours.

**Documented example:**

```
pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890
```

The identifier contains a literal vertical bar. `|` is not a legal character in a URI query
string unescaped and must be percent-encoded as `%7C`.

This matters because the id is used **as a required query parameter**:
`GET /v1/provider_locations/availability` takes `provider_location_ids` as a
comma-delimited list of up to 50 of these. So every integrator calling the availability
endpoint has to encode them — but a search of the spec for "percent-encode", "URL-encode",
or any equivalent phrasing returns **nothing**, and the examples show the bar unescaped.

Whether an unencoded bar is accepted in practice is exactly the sort of thing that varies
by client library and intermediary, which is why explicit guidance is worth more here than
usual. Some HTTP clients encode it silently, some pass it through, and some reject it.

**Scope note:** documentation observation only — we have not called this endpoint live, so
we are not claiming the server rejects unencoded input.

**Suggested fix:** one sentence on the `provider_location_ids` parameter noting that ids
contain a `|` that must be percent-encoded, ideally with a fully-encoded example alongside
the readable one.

## 7. An operation summary names a parameter that doesn't exist

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
concluding the sentence was descriptive prose rather than a list of identifiers.

**Suggested fix:** either use the actual parameter names in backticks, or rephrase so the
sentence doesn't read as an enumeration — e.g. "filter by ZIP code, specialty, visit reason
and insurance plan" reads as categories rather than identifiers.

## 8. Testing guide: `pr_no_availbility` / `lo_no_availbility` are misspelled

**Location:** `https://api-docs.zocdoc.com/guides/testing-data`, scenario table (line 65 of
the markdown rendering).

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

## 9. Typo: "availaibility" in a schema description

**Location:** bundle line 2307, `AvailabilityResult.data`.

> `description: Response containing the availaibility information.`

Unlike #8, this one is in a human-readable description rather than an identifier, so it's
safe to fix outright with no compatibility concern.

---

## Two suggestions (not defects)

These are judgement calls rather than errors, separated out so the list above stays strictly
factual.

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

## One thing we couldn't check

Our notes recorded that a guide gives the availability date range as "30 days or less" while
the OpenAPI description (bundle line 371) says "**31** days or less". We could not verify
the guide side: `https://api-docs.zocdoc.com/guides/booking.md` returns the HTML app shell
rather than markdown, unlike `guides/testing-data.md` which does serve markdown. So we
can't confirm the contradiction and are **not** filing it as a finding — but if a guide does
say 30 somewhere, it's worth reconciling with the spec's 31, since the boundary case is a
silent 400.

Two side notes from that attempt, in case they're useful: the `.md` twin convention appears
to work for `guides/testing-data` and `apis` but not `guides/booking`, and inconsistent
availability of those twins makes the docs harder to verify programmatically.

---

## Summary of what we'd ask for

1. Fix the `next_url` description and reconcile it with the schema's `required` +
   non-nullable `string` typing. *(High)*
2. Add an `enum` to `InsuranceNetworkType` with the real wire values. *(Medium)*
3. Complete and disambiguate the `InsuranceProgramType` description. *(Medium)*
4. Enumerate `booking_requirements.required_fields`, or document the contract for
   unrecognized values. *(Medium)*
5. Add a machine-readable `pattern` to `phone_number`. *(Medium)*
6. Note the `|` in `provider_location_id` and that it needs percent-encoding. *(Medium)*
7. Reword the `provider_locations` summary so it doesn't read as a parameter list. *(Low)*
8. Decide on the `availbility` spelling — coordinated with the sandbox data, not docs-only.
   *(Low)*
9. Fix the "availaibility" typo. *(Trivial)*

Happy to re-verify any of these, or to check behavior on endpoints outside the three we
exercised, if that would help.
