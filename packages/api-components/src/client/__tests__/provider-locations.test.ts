import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { DEFAULT_PAGE_SIZE, searchProviderLocations } from '../provider-locations.js';
import type { ProviderLocation } from '../types.js';

/**
 * `/v1/provider_locations` is the one endpoint whose `data` is an object rather than
 * an array — the locations sit under `data.provider_locations`. Mocking the real
 * envelope means a regression that forgets to reach through it fails here.
 */
function searchBody(locations: Partial<ProviderLocation>[], totalCount = locations.length): string {
  return JSON.stringify({
    request_id: 'req_test',
    page: 0,
    page_size: 25,
    total_count: totalCount,
    // `''`, not `null` — production sends an empty string on the last page (2026-08-04).
    next_url: '',
    data: {
      search_parameters: { specialty_id: 'sp_153', visit_reason_id: 'pc_test' },
      provider_locations: locations,
    },
  });
}

function mockSearch(body: string, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () => new Response(body, { status, headers: { 'content-type': 'application/json' } })
    )
  );
}

function firstUrl(): URL {
  return new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
}

const LOCATION: Partial<ProviderLocation> = {
  provider_location_id: 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890',
  provider_location_type: 'in_person_provider',
};

describe('searchProviderLocations', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    mockSearch(searchBody([LOCATION]));
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('maps camelCase params onto the API snake_case names', async () => {
    await searchProviderLocations({ zipCode: '11201', visitReasonId: 'pc_test', pageSize: 5 });

    const url = firstUrl();
    expect(url.pathname).toBe('/v1/provider_locations');
    expect(url.searchParams.get('zip_code')).toBe('11201');
    expect(url.searchParams.get('visit_reason_id')).toBe('pc_test');
    expect(url.searchParams.get('page_size')).toBe('5');
  });

  it('omits params that were not supplied', async () => {
    await searchProviderLocations({ zipCode: '11201' });

    const url = firstUrl();
    expect(url.searchParams.has('visit_reason_id')).toBe(false);
    expect(url.searchParams.has('insurance_plan_id')).toBe(false);
    expect(url.searchParams.has('visit_type')).toBe(false);
    expect(url.searchParams.has('max_distance_to_patient_mi')).toBe(false);
  });

  it('passes through the optional filters when supplied', async () => {
    await searchProviderLocations({
      zipCode: '11201',
      specialtyId: 'sp_153',
      insurancePlanId: 'ip_9111',
      visitType: 'video_visit',
      maxDistanceToPatientMi: 10,
      page: 2,
    });

    const url = firstUrl();
    expect(url.searchParams.get('specialty_id')).toBe('sp_153');
    expect(url.searchParams.get('insurance_plan_id')).toBe('ip_9111');
    expect(url.searchParams.get('visit_type')).toBe('video_visit');
    expect(url.searchParams.get('max_distance_to_patient_mi')).toBe('10');
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('reaches through data.provider_locations rather than returning the envelope', async () => {
    const result = await searchProviderLocations({ zipCode: '11201' });

    expect(result.providerLocations).toEqual([LOCATION]);
  });

  it('reports the total count so a caller can paginate', async () => {
    mockSearch(searchBody([LOCATION], 42));

    const result = await searchProviderLocations({ zipCode: '11201' });

    expect(result.totalCount).toBe(42);
  });

  /*
   * The size the response was built with, not the size that was asked for. A pager divides
   * `total_count` by this to count pages, so reporting a requested 5 against a served 25 would
   * offer five times the pages that exist.
   */
  it('reports the page size the response was built with', async () => {
    const result = await searchProviderLocations({ zipCode: '11201', pageSize: 5 });

    expect(result.pageSize).toBe(25);
  });

  it('falls back to the documented default when the envelope omits the page size', async () => {
    mockSearch(
      JSON.stringify({ request_id: 'req_test', total_count: 1, data: { provider_locations: [] } })
    );

    const result = await searchProviderLocations({ zipCode: '11201' });

    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('returns an empty list for a zip code with no providers', async () => {
    // Documented scenario: zip 99734 returns no matching provider locations. Empty is
    // a distinct state from error (COMP-001), so it must not throw.
    mockSearch(searchBody([], 0));

    const result = await searchProviderLocations({ zipCode: '99734' });

    expect(result.providerLocations).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it('tolerates a response with no provider_locations key', async () => {
    // Defensive: a 200 whose data object omits the array would otherwise hand the
    // component `undefined` and crash its render rather than showing the empty state.
    mockSearch(
      JSON.stringify({ request_id: 'req_test', total_count: 0, data: { search_parameters: {} } })
    );

    const result = await searchProviderLocations({ zipCode: '99734' });

    expect(result.providerLocations).toEqual([]);
  });

  it('propagates a server error rather than returning an empty list', async () => {
    // Documented scenario: zip 10112 returns a 500. Silently returning [] here would
    // render "no providers found" for an outage, which is a lie.
    mockSearch(
      JSON.stringify({ request_id: 'req_test', error_type: 'api_error', errors: [] }),
      500
    );

    await expect(searchProviderLocations({ zipCode: '10112' })).rejects.toBeTruthy();
  });
});
