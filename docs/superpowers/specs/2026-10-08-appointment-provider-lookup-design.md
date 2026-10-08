# Provider lookup for `zd-appointment` — design

**Status:** approved in conversation 2026-10-08; awaiting written-spec review.
**Follows:** `docs/superpowers/plans/2026-10-07-appointment-management.md` (Out of Scope, first bullet).

## Intent

`<zd-appointment>` shows a patient one of their appointments. The appointment lookup
returns a `provider_location_id` but no provider details. Today the only way to say who the
appointment is with is the host-supplied `provider-name` attribute, a plain string.

The component should look the provider up itself and show the same summary the booking flow
shows: photo, name with credential, specialty, and address (or "Video visit"). A host page
should not need to make an API call just to label an appointment.

**Success:** a host that sets only `appointment-id` sees the provider summary. A host that
already sets `provider-name` keeps working, and gets the richer summary when the lookup
succeeds.

### Decisions made with the user

- `provider-name` **stays, as a fallback**. The component always fetches. On success it shows
  the summary. Otherwise it shows `provider-name` when set, and no provider row when not.
- Approach **A**: `zd-appointment` fetches the provider itself. It doesn't make
  `zd-provider-summary` fetch (B), and it doesn't require the host to fetch (C).

## The endpoint

`GET /v1/provider_locations/{provider_location_id}`. It's in the published OpenAPI spec
(`https://api-docs.zocdoc.com/_bundle/apis/index.json`, v1.177) as "Get provider location
by id". It isn't yet in `docs/api-contract-notes.md`.

- Path param `provider_location_id` (required), e.g. `pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890`.
- Query param `insurance_plan_id` (optional).
- 200: `ProviderLocationResult` = `BaseResult` + `{ data: ProviderLocation }`. This is the same
  `ProviderLocation` schema search returns, so `client/types.ts` needs no new type.
- 400, 401, 403, 404 ("Provider location not found"). Every scope is accepted; there is no special
  scope.

## 1. Client function and mock

### `getProviderLocation`

Add to `packages/api-components/src/client/provider-locations.ts`:

```ts
export interface ProviderLocationParams {
  insurancePlanId?: string;
}

export async function getProviderLocation(
  providerLocationId: string,
  params: ProviderLocationParams = {}
): Promise<ProviderLocation>
```

- Calls `request<{ data: ProviderLocation }>` with the path
  `/v1/provider_locations/${encodeURIComponent(providerLocationId)}` and the query
  `{ insurance_plan_id: params.insurancePlanId }`. The ID contains `|`, which must be sent as `%7C`.
- Returns `response.data`. A 200 without `data` throws a `ZocdocError`. A provider lookup
  that "succeeds" with nothing to show is a malformed response, not an empty state.
- 404 surfaces as `ZocdocNotFoundError` through `http.ts` (CLIENT-003). There are no new
  error classes.
- **Not cached.** CLIENT-004 covers reference data (specialties, visit reasons, plans). A
  provider location is per-appointment data.
- Exported automatically: `index.ts` and `bundle.ts` both `export * from './client/provider-locations.js'`.

### Mock transport

In `client/mock/transport.ts`, route `GET /v1/provider_locations/{id}`. The match is
`path.startsWith('/v1/provider_locations/')`, placed **after** the exact
`/v1/provider_locations/availability` check, with the ID taken from
`decodeURIComponent` of the remainder. It must not match
`/v1/provider_locations/{id}/insurance_mappings`. A remainder containing `/` is left
unrouted.

- `SCENARIOS.providerLocationError` → 500.
- An ID in `PROVIDER_LOCATIONS` → that location, through `withAssetBase`.
- An ID that is a key of `BOOKINGS` (the sandbox booking/appointment scenario locations) →
  a copy of the in-person fixture location with `provider_location_id` set to the requested ID,
  through `withAssetBase`. This keeps the appointment fixtures on their documented sandbox IDs
  while giving every mock appointment a provider to show.
- Anything else → 404 `invalid_request`.

## 2. Component data flow and rendering

### State

- `@state() protected providerLocation?: ProviderLocation`.
- New public attribute `hide-photo` (`hidePhoto: boolean`), with the same name and meaning as on
  `zd-provider-card`, `zd-provider-profile` and `zd-provider-summary`.

### When the lookup runs

- `load()` clears `providerLocation` along with the rest of its reset.
- When the appointment arrives and the token still matches, `load()` sets `success` and then
  starts the provider lookup **without awaiting it**. The details render immediately.
- The lookup captures the same `loadToken`. A response whose token is stale is discarded,
  success or failure.
- `refresh()` (the 409 path) and a successful reschedule keep `providerLocation`. They only
  start a new lookup if the appointment's `provider_location_id` differs from the loaded
  location's. Reschedule can't change the location, so in practice they never refetch.
- The lookup never touches `busy`, `requestState`, `mode`, focus, `notice` or `actionError`.

### The "Provider" row

In `renderDetails`, in order of preference:

1. `providerLocation` is set → `<div><dt>Provider</dt><dd part="provider">${renderProviderSummary(location, { hidePhoto })}</dd></div>`.
2. Else `provider-name` is set → the existing text row, unchanged.
3. Else → no row.

The row uses rule 2 or 3 while the lookup is in flight, so a host passing `provider-name`
sees no placeholder and no flicker. No insurance plan is passed, so the summary's insurance
line doesn't render. Insurance acceptance doesn't belong on a manage view.

`provider-summary.styles.js` is spread into the component's `styles`. The summary's parts
(`provider-summary`, `provider-photo`, `provider-detail`, `provider-name`,
`provider-specialty`, `provider-location`) are in the component's own shadow root, so they
are added to its `@csspart` JSDoc. The `provider` part's description becomes "The provider row's
value: the looked-up summary, or `provider-name` as a fallback."

## 3. Error handling

A failed provider lookup is secondary and quiet:

- The component stays in `success`. The row falls back per section 2.
- No alert, no live-region announcement, **no `appointment-error` event**. A host reacting to
  that event would show a failure while the appointment displays correctly. A real auth or
  network fault already fails the appointment load, which reports it.
  `AppointmentErrorDetail['action']` stays `'load' | 'cancel' | 'reschedule'`.
- Nothing about the failure is logged (PHI-001; there's nothing useful to log without the ID).

The summary appearing is not announced either. It's supplementary, and announcing it would
interrupt the status the patient is reading (A11Y-002 covers loading, error and empty, which
are all still the appointment's own). Focus is untouched (A11Y-003).

## 4. Tests and docs

### Client project (node)

`client/__tests__/provider-locations.test.ts` (existing file):

- Requests `/v1/provider_locations/pr_x%7Clo_x`, and sends `insurance_plan_id` only when given.
- Returns `data`.
- 404 → `ZocdocNotFoundError`.
- 200 without `data` → `ZocdocError`.

Mock transport tests (`client/__tests__/mock-transport.test.ts`):

- A `PROVIDER_LOCATIONS` ID returns that location.
- A `BOOKINGS` scenario ID returns a location carrying that ID.
- `providerLocationError` returns 500.
- An unknown ID returns 404.
- `/v1/provider_locations/availability` is still routed to availability.

### Components project (browser)

These mock `getProviderLocation` alongside `getAppointment` (TEST-002):

- The summary renders in the provider row with name and photo. `hide-photo` removes the photo.
- The lookup rejects with `provider-name` set → text row, `requestState` stays `success`, no
  `appointment-error`.
- The lookup rejects without `provider-name` → no provider row, no event.
- `provider-name` shows while the lookup is pending, then is replaced by the summary.
- Changing `appointment-id` while the first lookup is pending → the stale result is never shown.
- The 409 cancel path calls `getProviderLocation` once in total.
- axe-core passes with the summary rendered (A11Y-005).

All IDs come from `SCENARIOS` and the existing fixtures (TEST-003).

### Docs and generated files

- `docs/api-contract-notes.md`: add a `GET /v1/provider_locations/{provider_location_id}`
  section.
- `packages/docs/src/content/docs/client/endpoints.mdx`: document `getProviderLocation`.
- `packages/docs/src/content/docs/components/appointment.mdx`:
  - `provider-name` is now the fallback.
  - The lookup is quiet on failure.
  - Document `hide-photo` and the new parts.
- `.claude/skills/api-components/SKILL.md`: `appointment` also calls `getProviderLocation`.
- `appointment.stories.ts`: the default story shows the summary through the mock. Add a story
  where the provider lookup fails and `provider-name` shows.
- Regenerate with `pnpm run cem` (manifest and `references/zd-appointment.md`).

## Out of scope

- Making `zd-provider-summary` fetch by ID (approach B). Revisit if a second component needs it.
- Passing an insurance plan through to the lookup from `zd-appointment`.
- The deferred appointment polish items (pending-reschedule time, reschedule 400 copy,
  free-text cancel reason).
