# Provider Lookup for `zd-appointment` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `<zd-appointment>` looks up its provider by `provider_location_id` and shows the shared provider summary, falling back to `provider-name`.

**Architecture:** A thin `getProviderLocation` wrapper in `client/provider-locations.ts` calls `GET /v1/provider_locations/{id}`. The mock transport serves it. `zd-appointment` starts the lookup, without awaiting it, after the appointment loads, under the existing `loadToken` race guard. It renders `renderProviderSummary` in the Provider row when the lookup succeeds. A failed lookup is quiet: the component stays in `success`, emits no event, and falls back to the `provider-name` text.

**Tech Stack:** TypeScript, Lit on Charm UX (`CharmElement`, `this.html`), Vitest (`client` node project, `components` browser project), Storybook, Astro Starlight docs.

**Spec:** `docs/superpowers/specs/2026-10-08-appointment-provider-lookup-design.md`

## Global Constraints

- Only `client/http.ts` calls `fetch`. The endpoint wrapper goes through `request<T>()` (CLIENT-001).
- 404 surfaces as `ZocdocNotFoundError`. Never render `error.message`; there is no user-facing copy for provider failures at all (CLIENT-003).
- `getProviderLocation` is **not cached** (CLIENT-004 covers reference data only).
- The provider lookup emits **no** `appointment-error`. `AppointmentErrorDetail['action']` stays `'load' | 'cancel' | 'reschedule'`.
- The provider lookup never touches `busy`, `requestState`, `mode`, focus, `notice` or `actionError`.
- No logging of IDs or provider data (PHI-001). Test data only from `SCENARIOS` and the existing fixtures (PHI-002/TEST-003).
- Component tests mock `getProviderLocation` with `vi.spyOn` on the module (`vi.mock(..., { spy: true })`), not `fetch` (TEST-002).
- The new attribute is exactly `hide-photo` / `hidePhoto: boolean`, matching `zd-provider-card`.
- Templates use `this.html` and `<scoped-*>` tags. `renderProviderSummary` uses plain lit `html`, so it adds no dependencies (PBZD-003).
- Baselines: typecheck has 21 pre-existing errors (`pnpm typecheck`). The full suite was 852 passed, 6 skipped before this work.
- Commit messages end with:
  ```
  Generated with AI

  Co-Authored-By: Claude Code
  ```

## Review Focus

1. **A provider response arriving after `appointment-id` changed** must never paint the old provider onto the new appointment. Pinned in Task 2 ("ignores a provider lookup that finishes after the id changed").
2. **The provider lookup failing while the appointment loads fine** must leave the component fully usable: actions present, no alert, no event. Pinned in Task 2 ("a failed provider lookup is quiet").
3. **The 409 refresh and a successful reschedule must not refetch or blank the provider.** Pinned in Task 2 ("keeps the provider through a 409 refresh and a reschedule").
4. **The `|` in the ID must reach the API encoded, and the mock must decode it.** Pinned in Task 1 (client path test, and the mock round-trip through the real wrapper).
5. **`/v1/provider_locations/availability` and `/v1/provider_locations/{id}/insurance_mappings` must not be swallowed by the new route.** Pinned in Task 1 (mock routing tests).

---

### Task 1: `getProviderLocation` client function and mock route

**Files:**
- Modify: `packages/api-components/src/client/provider-locations.ts` (append)
- Modify: `packages/api-components/src/client/mock/transport.ts` (new handler near `handleProviderLocations`; new route in `createMockTransport`)
- Test: `packages/api-components/src/client/__tests__/provider-locations.test.ts` (append a `describe`)
- Test: `packages/api-components/src/client/__tests__/mock-transport.test.ts` (append a `describe` inside `createMockTransport`)
- Modify: `docs/api-contract-notes.md` (new section after `### GET /v1/provider_locations`, before `### GET /v1/provider_locations/availability`)
- Modify: `packages/docs/src/content/docs/client/endpoints.mdx` (new `### getProviderLocation` under `## Provider Search`, after the `searchProviderLocations` section)

**Interfaces:**
- Produces: `export interface ProviderLocationParams { insurancePlanId?: string }` and `export async function getProviderLocation(providerLocationId: string, params?: ProviderLocationParams): Promise<ProviderLocation>`. These are exported from the package root and bundle automatically via the existing `export * from './client/provider-locations.js'`.

- [ ] **Step 1: Write the failing client tests**

Append to `provider-locations.test.ts`. Update the imports at the top: add `getProviderLocation` to the `../provider-locations.js` import, and add `import { ZocdocError, ZocdocNotFoundError } from '../errors.js';`.

```ts
describe('getProviderLocation', () => {
  const ID = 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';

  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('requests the location by its encoded id and returns data', async () => {
    mockSearch(JSON.stringify({ request_id: 'req_test', data: LOCATION }));

    const location = await getProviderLocation(ID);

    const raw = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(raw).toContain('/v1/provider_locations/pr_abc123-def456_wxyz7890%7Clo_abc123-def456_wxyz7890');
    expect(firstUrl().searchParams.has('insurance_plan_id')).toBe(false);
    expect(location).toEqual(LOCATION);
  });

  it('sends insurance_plan_id only when given', async () => {
    mockSearch(JSON.stringify({ request_id: 'req_test', data: LOCATION }));

    await getProviderLocation(ID, { insurancePlanId: 'ip_9111' });

    expect(firstUrl().searchParams.get('insurance_plan_id')).toBe('ip_9111');
  });

  it('throws ZocdocNotFoundError on 404', async () => {
    mockSearch(
      JSON.stringify({ request_id: 'req_test', error_type: 'invalid_request', errors: [] }),
      404
    );

    await expect(getProviderLocation(ID)).rejects.toBeInstanceOf(ZocdocNotFoundError);
  });

  it('throws on a 200 that carries no location', async () => {
    mockSearch(JSON.stringify({ request_id: 'req_test' }));

    await expect(getProviderLocation(ID)).rejects.toBeInstanceOf(ZocdocError);
  });

  it('rejects a blank id without a request', async () => {
    mockSearch(JSON.stringify({ request_id: 'req_test', data: LOCATION }));

    await expect(getProviderLocation('  ')).rejects.toThrow('providerLocationId is required.');
    expect(fetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project client packages/api-components/src/client/__tests__/provider-locations.test.ts`
Expected: FAIL. `getProviderLocation` is not exported.

- [ ] **Step 3: Implement**

Append to `provider-locations.ts`. Extend the existing `./types.js` import to include `ZocdocResponse`, and add `import { ZocdocError } from './errors.js';`.

```ts
export interface ProviderLocationParams {
  /** Answers `accepts_patient_insurance` for this plan, as on search. */
  insurancePlanId?: string;
}

/**
 * One provider location by id — `GET /v1/provider_locations/{provider_location_id}`.
 *
 * Not cached: CLIENT-004 is for reference data, and this is per-appointment. The id carries a
 * literal `|`, which `encodeURIComponent` sends as `%7C`; the API accepts either.
 */
export async function getProviderLocation(
  providerLocationId: string,
  params: ProviderLocationParams = {}
): Promise<ProviderLocation> {
  const id = providerLocationId.trim();
  if (!id) throw new Error('providerLocationId is required.');

  const response = await request<Partial<ZocdocResponse<ProviderLocation>> | undefined>(
    `/v1/provider_locations/${encodeURIComponent(id)}`,
    { query: { insurance_plan_id: params.insurancePlanId } }
  );

  // A 200 with nothing in it is a malformed response, not an empty state: there is no
  // "no provider" answer for an id the API just accepted.
  if (!response?.data) {
    throw new ZocdocError('Zocdoc API returned no provider location.', 200, undefined, response);
  }
  return response.data;
}
```

- [ ] **Step 4: Run them to verify they pass**

Run: `pnpm vitest run --project client packages/api-components/src/client/__tests__/provider-locations.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing mock-transport tests**

In `mock-transport.test.ts`, add `getProviderLocation` to the `../provider-locations.js` import. Then add this `describe` inside `describe('createMockTransport', ...)`, after `describe('availability', ...)`:

```ts
  describe('provider location by id', () => {
    it('returns a fixture location by its id', async () => {
      const fixture = PROVIDER_LOCATIONS[0]!;

      const location = await getProviderLocation(fixture.provider_location_id);

      expect(location).toEqual(fixture);
    });

    it('rebases the photo onto assetBaseUrl, as search does', async () => {
      configureZocdoc({
        baseUrl: 'https://mock.test',
        getToken: 'tok',
        transport: createMockTransport({ latencyMs: 0, assetBaseUrl: '/docs/' }),
      });

      const location = await getProviderLocation(PROVIDER_LOCATIONS[0]!.provider_location_id);

      expect(location.provider.provider_photo_url).toBe('/docs/images/michael-scott.png');
    });

    it('answers every documented appointment location with a provider carrying that id', async () => {
      for (const { providerLocationId } of Object.values(APPOINTMENTS)) {
        const location = await getProviderLocation(providerLocationId);
        expect(location.provider_location_id).toBe(providerLocationId);
        expect(location.provider.last_name).toBeTruthy();
      }
    });

    it('returns 500 for the documented error location', async () => {
      await expect(getProviderLocation(SCENARIOS.providerLocationError)).rejects.toMatchObject({
        status: 500,
      });
    });

    it('returns 404 for an unknown id', async () => {
      await expect(getProviderLocation('pr_unknown|lo_unknown')).rejects.toBeInstanceOf(
        ZocdocNotFoundError
      );
    });

    it('leaves availability and deeper paths on their own routes', async () => {
      const transport = createMockTransport({ latencyMs: 0, availabilityStartDate: START_DATE });
      const id = encodeURIComponent(PROVIDER_LOCATIONS[0]!.provider_location_id);

      const availability = await getAvailability({
        providerLocationIds: [PROVIDER_LOCATIONS[0]!.provider_location_id],
        visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
        patientType: 'new',
      });
      const mappings = await transport(
        `https://mock.test/v1/provider_locations/${id}/insurance_mappings`,
        {}
      );

      expect(availability).toHaveLength(1);
      expect(mappings.status).toBe(501);
    });
  });
```

- [ ] **Step 6: Run them to verify they fail**

Run: `pnpm vitest run --project client packages/api-components/src/client/__tests__/mock-transport.test.ts`
Expected: the new tests FAIL with status 501 ("Mock transport has no handler").

- [ ] **Step 7: Implement the mock route**

In `transport.ts`, add next to `handleProviderLocations`:

```ts
/**
 * Serves `GET /v1/provider_locations/{provider_location_id}`.
 *
 * The sandbox's booking and appointment scenario locations (`pr_confirmed|lo_confirmed` and
 * so on) have no fixture of their own. They answer with the in-person fixture under the
 * requested id, so every mock appointment has a provider to show without the appointments
 * leaving their documented ids.
 */
function handleProviderLocation(id: string, assetBaseUrl: string): Response {
  if (id === SCENARIOS.providerLocationError) {
    return json(errorBody('Simulated server error.', 'api_error'), 500);
  }

  const fixture = PROVIDER_LOCATIONS.find((location) => location.provider_location_id === id);
  const location =
    fixture ?? (BOOKINGS[id] ? { ...PROVIDER_LOCATIONS[0]!, provider_location_id: id } : undefined);
  if (!location) {
    return json(errorBody('Provider location not found.', 'invalid_request'), 404);
  }
  return json({ request_id: 'req_mock', data: withAssetBase(location, assetBaseUrl) });
}
```

Next to `APPOINTMENT_PATH`, add:

```ts
/** One segment only, so `/{id}/insurance_mappings` stays unrouted rather than matching here. */
const PROVIDER_LOCATION_PATH = /^\/v1\/provider_locations\/([^/]+)$/;
```

In `createMockTransport`, directly **after** the `/v1/provider_locations/availability` branch (the exact match must win), add:

```ts
    const providerLocationPath = PROVIDER_LOCATION_PATH.exec(path);
    if (providerLocationPath && (init.method ?? 'GET') === 'GET') {
      return handleProviderLocation(decodeURIComponent(providerLocationPath[1]!), assetBaseUrl);
    }
```

- [ ] **Step 8: Run the client project**

Run: `pnpm vitest run --project client`
Expected: PASS, with no other test changed.

- [ ] **Step 9: Document the endpoint**

In `docs/api-contract-notes.md`, insert before `### \`GET /v1/provider_locations/availability\``:

```markdown
### `GET /v1/provider_locations/{provider_location_id}`

In the published OpenAPI spec (v1.177, "Get provider location by id"); not yet probed live.

| Param | In | Notes |
|---|---|---|
| `provider_location_id` | path | **required**; contains a literal `\|`, sent as `%7C` |
| `insurance_plan_id` | query | optional; answers `accepts_patient_insurance` for that plan |

200 is `{ request_id, data: ProviderLocation }`: the unpaged envelope, with `data` the same
provider-location object search returns. 404 is "Provider location not found". No special
scope.
```

In `endpoints.mdx`, after the `searchProviderLocations` section (just before `## Availability`), add:

````mdx
### getProviderLocation

`GET /v1/provider_locations/{provider_location_id}`: one provider location by its ID.

```typescript
import { getProviderLocation } from '@zocdoc/api-components';

const location = await getProviderLocation('pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890');
// location: ProviderLocation, the same shape search returns
```

| Name                 | Type     | Required | Description                                          |
| -------------------- | -------- | -------- | ---------------------------------------------------- |
| `providerLocationId` | `string` | Yes      | The `provider_location_id`, for example from an appointment |
| `insurancePlanId`    | `string` | No       | In the second argument. Answers `accepts_patient_insurance` for this plan |

An unknown ID throws `ZocdocNotFoundError`. Results aren't cached.
````

- [ ] **Step 10: Commit**

```bash
git add packages/api-components/src/client docs/api-contract-notes.md packages/docs/src/content/docs/client/endpoints.mdx
git commit -m "feat(client): add getProviderLocation and its mock route

Generated with AI

Co-Authored-By: Claude Code"
```

---

### Task 2: `zd-appointment` shows the looked-up provider

**Files:**
- Modify: `packages/api-components/src/components/appointment/appointment.ts`
- Test: `packages/api-components/src/components/appointment/appointment.test.ts`

**Interfaces:**
- Consumes: `getProviderLocation(providerLocationId: string): Promise<ProviderLocation>` from `../../client/provider-locations.js` (Task 1). `renderProviderSummary(location, { hidePhoto })` from `../../utilities/provider-summary.js`. Default-export styles from `../../utilities/provider-summary.styles.js`.
- Produces: public `hidePhoto: boolean` (attribute `hide-photo`), and `@state() protected providerLocation?: ProviderLocation`.

- [ ] **Step 1: Write the failing tests**

In `appointment.test.ts`:

- Add `import * as providerLocations from '../../client/provider-locations.js';`
- Add `vi.mock('../../client/provider-locations.js', { spy: true });` below the other two `vi.mock` lines.
- Add `PROVIDER_LOCATIONS` to the `../../client/mock/fixtures.js` import.
- Add `ProviderLocation` to the `../../client/types.js` type import.

Add this after `const PROVIDER = ...`:

```ts
/** The fixture provider under the appointment's own location id, as the mock answers it. */
const LOCATION: ProviderLocation = {
  ...PROVIDER_LOCATIONS[0]!,
  provider_location_id: SCENARIOS.providerLocationConfirmed,
  provider: { ...PROVIDER_LOCATIONS[0]!.provider, provider_photo_url: '//images.test/photo.jpg' },
};
```

In the top-level `beforeEach`, add:

```ts
    vi.spyOn(providerLocations, 'getProviderLocation').mockResolvedValue(LOCATION);
```

The existing `lookup` test asserts `text(element, 'provider')` is `PROVIDER`. That is now the fallback only. Change that one line to:

```ts
      expect(text(element, 'provider')).toContain('Avery Sandoval, MD');
```

Then add this `describe` after `describe('lookup', ...)`:

```ts
  describe('provider', () => {
    it('looks up the provider by the appointment location and shows the summary', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));

      expect(providerLocations.getProviderLocation).toHaveBeenCalledWith(
        SCENARIOS.providerLocationConfirmed
      );
      expect(text(element, 'provider-name')).toBe('Avery Sandoval, MD');
      expect(part<HTMLImageElement>(element, 'provider-photo').src).toBe(
        'https://images.test/photo.jpg'
      );
      expect(queryPart(element, 'provider-insurance')).toBeNull();
    });

    it('hides the photo with hide-photo', async () => {
      vi.spyOn(appointments, 'getAppointment').mockResolvedValue(details());
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}" hide-photo></zd-appointment>`
      );
      await vi.waitFor(() => part(element, 'provider-summary'));

      expect(queryPart(element, 'provider-photo')).toBeNull();
    });

    it('shows provider-name while the provider lookup is pending', async () => {
      const pending = deferred<ProviderLocation>();
      vi.mocked(providerLocations.getProviderLocation).mockReturnValueOnce(pending.promise);
      const element = await mountLoaded();

      expect(text(element, 'provider')).toBe(PROVIDER);
      expect(queryPart(element, 'provider-summary')).toBeNull();

      pending.resolve(LOCATION);
      await vi.waitFor(() => part(element, 'provider-summary'));
    });

    it('a failed provider lookup is quiet and falls back to provider-name', async () => {
      vi.mocked(providerLocations.getProviderLocation).mockRejectedValue(new ZocdocNotFoundError());
      const host = document.createElement('div');
      const seen = record(host, 'appointment-error');
      vi.spyOn(appointments, 'getAppointment').mockResolvedValue(details());
      host.innerHTML = `<zd-appointment appointment-id="${ID}" provider-name="${PROVIDER}"></zd-appointment>`;
      document.body.append(host);
      const element = host.firstElementChild as Manage;
      await vi.waitFor(() => part(element, 'panel'));
      await settled(element);

      expect(text(element, 'provider')).toBe(PROVIDER);
      expect(queryPart(element, 'provider-summary')).toBeNull();
      expect(queryPart(element, 'error')).toBeNull();
      expect(queryPart(element, 'action-error')).toBeNull();
      expect(queryPart(element, 'actions')).not.toBeNull();
      expect(seen).toHaveLength(0);
      host.remove();
    });

    it('shows no provider row when the lookup fails and no provider-name is set', async () => {
      vi.mocked(providerLocations.getProviderLocation).mockRejectedValue(new Error('offline'));
      vi.spyOn(appointments, 'getAppointment').mockResolvedValue(details());
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}"></zd-appointment>`
      );
      await vi.waitFor(() => part(element, 'panel'));
      await settled(element);

      expect(queryPart(element, 'provider')).toBeNull();
      expect(text(element, 'appointment-status')).toBe('Confirmed');
    });

    it('ignores a provider lookup that finishes after the id changed', async () => {
      const stale = deferred<ProviderLocation>();
      const otherLocation = { ...LOCATION, provider_location_id: SCENARIOS.providerLocationPending };
      vi.mocked(providerLocations.getProviderLocation)
        .mockReturnValueOnce(stale.promise)
        .mockReturnValueOnce(new Promise(() => {}));
      vi.spyOn(appointments, 'getAppointment')
        .mockResolvedValueOnce(details())
        .mockResolvedValueOnce(
          details({
            appointment_id: SCENARIOS.appointmentPending,
            provider_location_id: SCENARIOS.providerLocationPending,
          })
        );
      const element = await mount<Manage>(
        `<zd-appointment appointment-id="${ID}"></zd-appointment>`
      );
      await vi.waitFor(() => expect(providerLocations.getProviderLocation).toHaveBeenCalledTimes(1));

      element.appointmentId = SCENARIOS.appointmentPending;
      await vi.waitFor(() => expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending));
      stale.resolve(otherLocation);
      await stale.promise;
      await settled(element);

      expect(queryPart(element, 'provider-summary')).toBeNull();
    });

    it('keeps the provider through a 409 refresh and a reschedule', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));
      vi.mocked(appointments.cancelAppointment).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 409.', 409)
      );
      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(details());

      await element.cancel();
      await settled(element);
      await element.reschedule(NEW_TIME);
      await settled(element);

      expect(providerLocations.getProviderLocation).toHaveBeenCalledTimes(1);
      expect(queryPart(element, 'provider-summary')).not.toBeNull();
    });

    it('drops the old provider as soon as a new id starts loading', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));
      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(
        details({ appointment_id: SCENARIOS.appointmentPending })
      );
      vi.mocked(providerLocations.getProviderLocation).mockReturnValueOnce(new Promise(() => {}));

      element.appointmentId = SCENARIOS.appointmentPending;
      await vi.waitFor(() => expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending));

      expect(queryPart(element, 'provider-summary')).toBeNull();
    });
  });
```

In `describe('accessibility', ...)`, add:

```ts
    it('has no violations with the provider summary shown', async () => {
      const element = await mountLoaded();
      await vi.waitFor(() => part(element, 'provider-summary'));

      await expectNoViolations(element);
    });
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run --project components packages/api-components/src/components/appointment/appointment.test.ts`
Expected: the new `provider` tests and the edited lookup test FAIL (no `provider-summary` part; `getProviderLocation` never called).

- [ ] **Step 3: Implement**

In `appointment.ts`:

Imports. Add `ProviderLocation` to the existing `../../client/types.js` type import, and add:

```ts
import { getProviderLocation } from '../../client/provider-locations.js';
import { renderProviderSummary } from '../../utilities/provider-summary.js';
import summaryStyles from '../../utilities/provider-summary.styles.js';
```

Styles:

```ts
  public static override styles = [...super.styles, summaryStyles, styles] as typeof CharmElement.styles;
```

JSDoc. Replace the `@csspart provider` line with:

```ts
 * @csspart provider - The provider row's value: the looked-up summary, or `provider-name` as a fallback.
 * @csspart provider-summary - The looked-up provider block.
 * @csspart provider-photo - The provider's photo, unless `hide-photo` is set.
 * @csspart provider-detail - The text column beside the photo.
 * @csspart provider-name - The provider's name and credential.
 * @csspart provider-specialty - The provider's first specialty.
 * @csspart provider-location - The address, or "Video visit".
```

Properties. Replace the `providerName` property's doc comment, and add `hidePhoto` and the state below it:

```ts
  /**
   * Who the appointment is with, shown until the provider lookup succeeds and kept if it fails.
   * The component looks the provider up itself, so this is optional.
   */
  @property({ attribute: 'provider-name' })
  public providerName?: string;

  /** Leaves the provider's photo out, as on `zd-provider-card`. */
  @property({ type: Boolean, attribute: 'hide-photo' })
  public hidePhoto = false;
```

and, with the other `@state()` fields:

```ts
  @state() protected providerLocation?: ProviderLocation;
```

In `load()`, add `this.providerLocation = undefined;` to the reset block, after `this.newStartTime = undefined;`. In the `try`, after `this.requestState = 'success';`, add:

```ts
      void this.loadProvider(token, appointment.provider_location_id);
```

In `refresh()`, after `this.appointment = appointment;`, add:

```ts
      if (appointment.provider_location_id !== this.providerLocation?.provider_location_id) {
        void this.loadProvider(token, appointment.provider_location_id);
      }
```

Successful reschedule: it spreads the existing appointment, so `provider_location_id` is unchanged and nothing is needed.

Add the method after `refresh()`:

```ts
  /**
   * Fills in the provider row. Secondary to the appointment, so it is quiet: a failure keeps the
   * `provider-name` fallback and emits nothing. A host acting on `appointment-error` would show a
   * failure while the appointment is on screen and correct.
   */
  private async loadProvider(token: number, providerLocationId: string | undefined): Promise<void> {
    if (!providerLocationId) return;

    try {
      const location = await getProviderLocation(providerLocationId);
      if (token !== this.loadToken) return;
      this.providerLocation = location;
    } catch {
      // Keep the fallback.
    }
  }
```

In `renderDetails`, replace the `this.providerName ? ...` line with `${this.renderProvider()}`, and add:

```ts
  protected renderProvider(): unknown {
    const location = this.providerLocation;
    if (location) {
      return this.html`<div><dt>Provider</dt><dd part="provider">${renderProviderSummary(location, { hidePhoto: this.hidePhoto })}</dd></div>`;
    }
    return this.providerName
      ? this.html`<div><dt>Provider</dt><dd part="provider">${this.providerName}</dd></div>`
      : nothing;
  }
```

If `AppointmentDetails['provider_location_id']` is typed as required `string`, keep the `string | undefined` parameter anyway. The guard is what stops a malformed lookup from producing `/v1/provider_locations/undefined`.

- [ ] **Step 4: Run the component tests**

Run: `pnpm vitest run --project components packages/api-components/src/components/appointment/appointment.test.ts`
Expected: PASS. If the summary text in the `dd` needs a gap from the `dt`, fix it in `appointment.styles.ts` with nesting (STYLE-001) and logical properties (I18N-003). Don't touch `provider-summary.styles.ts`.

- [ ] **Step 5: Run the full suite and typecheck**

Run: `pnpm test` and then `pnpm typecheck`
Expected: all pass (852 + Task 1's and Task 2's new tests, 6 skipped). Typecheck shows exactly 21 errors, none in the files touched here.

- [ ] **Step 6: Commit**

```bash
git add packages/api-components/src/components/appointment
git commit -m "feat(appointment): look up and show the provider summary

Generated with AI

Co-Authored-By: Claude Code"
```

---

### Task 3: Stories, docs, skill, and generated references

**Files:**
- Modify: `packages/api-components/src/components/appointment/appointment.stories.ts`
- Modify: `packages/docs/src/content/docs/components/appointment.mdx`
- Modify: `.claude/skills/api-components/SKILL.md` (about line 53)
- Regenerate: `packages/api-components/custom-elements.json`, `.claude/skills/api-components/references/zd-appointment.md` (via `pnpm run cem`; never open the manifest)

**Interfaces:**
- Consumes: `hidePhoto` / `hide-photo` and the parts from Task 2; the mock route from Task 1.

- [ ] **Step 1: Stories**

In `appointment.stories.ts`, the meta stops passing `provider-name` by default, so the stories show the looked-up summary:

```ts
const meta: Meta<ZdAppointment> = {
  title: 'API Components/Appointment',
  component: 'zd-appointment',
  args: {
    appointmentId: SCENARIOS.appointmentConfirmed,
    hidePhoto: false,
  },
  render: (args) => html`
    <zd-appointment
      appointment-id=${args.appointmentId ?? ''}
      provider-name=${args.providerName ?? nothing}
      ?hide-photo=${args.hidePhoto}
    ></zd-appointment>
  `,
};
```

Add `nothing` to the `lit` import. Update the `Confirmed` story's comment to `/** Confirmed. Both actions are offered, and the provider is looked up by location. */`. Append:

```ts
/** No photo, for host pages that make no image requests. */
export const WithoutPhoto: Story = { args: { hidePhoto: true } };

/**
 * A host that also passes `provider-name`. It shows during the mock's latency and is replaced
 * by the looked-up summary. The lookup-fails fallback is pinned by the component tests instead:
 * every mock appointment's location answers, and a story must not reach into private members
 * to force a failure.
 */
export const WithProviderName: Story = { args: { providerName: 'Dr. Avery Sandoval, MD' } };
```

- [ ] **Step 2: Component docs**

In `appointment.mdx`:

Usage example: drop the `provider-name` line, so the snippet is just `<zd-appointment appointment-id="d2ee5bd8-643a-42c8-8c5a-be450e903430"></zd-appointment>`.

Attributes table: replace the `provider-name` row and add `hide-photo`:

```mdx
| `provider-name`  | `providerName`  | `string`  | Optional. Shown in the Provider row until the provider lookup finishes, and kept if it fails |
| `hide-photo`     | `hidePhoto`     | `boolean` | Leaves out the provider's photo                                                              |
```

Re-pad the table so the columns line up (Prettier formats it).

After the attributes table, add:

```mdx
The component looks up the provider by the appointment's `provider_location_id` and shows their photo, name, specialty, and address. If that lookup fails, the appointment still shows: the Provider row falls back to `provider-name`, or is left out. No error appears and no `appointment-error` event fires, because the appointment itself loaded.
```

Zocdoc API table: add a row after "Look up":

```mdx
| Provider    | `GET /v1/provider_locations/{provider_location_id}`                                | Any                          |
```

Styling table: change the details row to `appointment-status`, `provider`, `when`, `reference`. Add a row:

```mdx
| `provider-summary`, `provider-photo`, `provider-detail`, `provider-name`, `provider-specialty`, `provider-location` | The looked-up provider |
```

- [ ] **Step 3: Skill**

In `.claude/skills/api-components/SKILL.md`, change `(which\ncall \`getAppointment\`, \`cancelAppointment\` and \`rescheduleAppointment\`)` to `(which\ncall \`getAppointment\`, \`getProviderLocation\`, \`cancelAppointment\` and \`rescheduleAppointment\`)`. Keep the line wrapping close to the surrounding text.

- [ ] **Step 4: Regenerate references**

Run: `pnpm run cem`
Then check: `git diff --stat`. Expect changes in `packages/api-components/custom-elements.json`, `.claude/skills/api-components/references/zd-appointment.md`, and possibly `references/index.md`. Read only the reference `.md` diff. It must list `hide-photo` and the six provider parts (prefixed `zd-` by the cem plugin, if that's how the other parts appear there).

- [ ] **Step 5: Build docs and Storybook typecheck**

Run: `pnpm test` and `pnpm typecheck`
Expected: as at the end of Task 2.

- [ ] **Step 6: Commit**

```bash
git add packages/api-components/src/components/appointment/appointment.stories.ts packages/docs/src/content/docs/components/appointment.mdx .claude/skills/api-components packages/api-components/custom-elements.json
git commit -m "docs(appointment): document the provider lookup

Generated with AI

Co-Authored-By: Claude Code"
```
