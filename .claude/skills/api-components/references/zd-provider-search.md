# zd-provider-search

Collects search criteria and queries `GET /v1/provider_locations`.

Emits results rather than rendering them, so it composes with `zd-provider-results` or
with a host page that wants to lay results out itself (COMP-002).

A ZIP alone is not a search. The endpoint requires a 5-digit `zip_code` **and** a
`specialty_id`, and answers a request missing either with a 400 whose body is
developer-facing — so both are checked here and reported on the field that caused them,
rather than surfacing as a failed search (CLIENT-003, A11Y-004). This component does not
collect a visit reason; the API defaults to "any" for the chosen specialty.

**Class** `ZdProviderSearch` — **Module** `src/components/provider-search/provider-search.ts` — **Package** `@powered-by-zocdoc/api-components`

```html
<zd-provider-search></zd-provider-search>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `insurance-plan-id` | `insurancePlanId` | `string \| undefined` | — | — |
| `max-distance-to-patient-mi` | `maxDistanceToPatientMi` | `number \| undefined` | — | Search radius in miles. The API defaults to 50 when unset. |
| `page` | `page` | `number` | `0` | Zero-indexed, as the API counts pages. Reset to 0 whenever the form is submitted. |
| `page-size` | `pageSize` | `number \| undefined` | — | Results per page. The API defaults to 10 when unset. |
| `specialty-id` | `specialtyId` | `string \| undefined` | — | The specialty to search within, and the field that makes a search possible at all. `GET /v1/provider_locations` requires a `specialty_id` and rejects a request without one with a 400 — see validate. |
| `visit-type` | `visitType` | `'all' \| 'in_person' \| 'video_visit' \| undefined` | — | Which visit formats to include. Left unset the **API defaults to `in_person`**, so video visits are absent from results until this is set to `all` or `video_visit`. The default is the API's rather than ours so that the component reports what the endpoint does. |
| `zip-code` | `zipCode` | `string` | `''` | The ZIP code to search. Required by the API — there is no search-everywhere mode. |
| — | `addEventListener` | `TypedEventTarget<ZdProviderSearchEventMap>['addEventListener']` | — | — |
| — | `removeEventListener` | `TypedEventTarget<ZdProviderSearchEventMap>['removeEventListener']` | — | — |

## Events

| Event | Type | Description |
| --- | --- | --- |
| `provider-results` | `unknown` | Emitted with `{ providers, totalCount, searchParameters, zipCode, specialtyId, insurancePlanId, visitType, page, pageSize }` on a successful search, including a search that matched nothing, so a listener can clear a stale list. The criteria are the ones actually used, which is how a parent learns what the patient changed in these fields. `totalCount` and `pageSize` are what a pager needs, and only the envelope has them — `providers` holds one page. |
| `provider-search-error` | `unknown` | Emitted with `{ error }` when the request fails. |

## Methods

| Method | Description |
| --- | --- |
| `search(): Promise<void>` | Runs the search. Public so a host page or a coordinating parent can trigger it. Validation runs on this path rather than only on submit, so a programmatic call cannot issue a request the API is certain to reject either. |
