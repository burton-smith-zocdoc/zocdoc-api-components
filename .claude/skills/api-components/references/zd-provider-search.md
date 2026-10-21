# zd-provider-search

Collects search criteria and queries `GET /v1/provider_locations`.

Emits results rather than rendering them, so it composes with `zd-provider-results` or
with a host page that wants to lay results out itself (COMP-002).

A ZIP alone is not a search. The endpoint requires a 5-digit `zip_code` **and** a
`specialty_id`, and answers a request missing either with a 400 whose body is
developer-facing — so both are checked here and reported on the field that caused them,
rather than surfacing as a failed search (CLIENT-003, A11Y-004). This component does not
collect a visit reason; the API defaults to "any" for the chosen specialty.

**Class** `ZdProviderSearch` — **Package** `@zocdoc/api-components`

```html
<zd-provider-search></zd-provider-search>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `insurance-plan-id` | `insurancePlanId` | `string` | — | The insurance plan to filter by. Optional: without it the search spans every network. |
| `max-distance-to-patient-mi` | `maxDistanceToPatientMi` | `number` | — | Search radius in miles. The API defaults to 50 when unset. |
| `page` | `page` | `number` | `0` | Zero-indexed, as the API counts pages. Reset to 0 whenever the form is submitted. |
| `page-size` | `pageSize` | `number` | — | Results per page. The API defaults to 10 when unset. |
| `specialty-id` | `specialtyId` | `string` | — | The specialty to search within, and the field that makes a search possible at all. `GET /v1/provider_locations` requires a `specialty_id` and rejects a request without one with a 400 — see {@link validate}. |
| `visit-type` | `visitType` | `'all' \| 'in_person' \| 'video_visit' \| undefined` | — | Which visit formats to include. Left unset the **API defaults to `in_person`**, so video visits are absent from results until this is set to `all` or `video_visit`. The default is the API's rather than ours so that the component reports what the endpoint does. |
| `zip-code` | `zipCode` | `string` | `''` | The ZIP code to search. Required by the API — there is no search-everywhere mode. |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `provider-results` | `CustomEvent<ProviderResultsDetail>` | Emitted with `{ providers, totalCount, searchParameters, zipCode, specialtyId, insurancePlanId, visitType, page, pageSize }` on a successful search, including a search that matched nothing, so a listener can clear a stale list. The criteria are the ones actually used, which is how a parent learns what the patient changed in these fields. `totalCount` and `pageSize` are what a pager needs, and only the envelope has them — `providers` holds one page. |
| `provider-search-error` | `CustomEvent<ErrorDetail>` | Emitted with `{ error }` when the request fails. |

## Methods

| Method | Description |
| --- | --- |
| `search(): Promise<void>` | Runs the search. Public so a host page or a coordinating parent can trigger it. Validation runs on this path rather than only on submit, so a programmatic call cannot issue a request the API is certain to reject either. |

## CSS Parts

| Part | Description |
| --- | --- |
| `field-error` | The alert listing what to fix before the search can run. |
| `form` | The search form. |
| `insurance` | The insurance plan select. |
| `insurance-field` | The insurance plan select with its label. |
| `loading-results` | The placeholder cards shown while a search is in flight. |
| `location-field` | The ZIP code field with its label. |
| `specialty` | The specialty select. |
| `specialty-field` | The specialty select with its label. |
| `submit` | The submit button. |
| `zip` | The ZIP code field. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `"" \| "ltr" \| "rtl" \| "auto"` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
