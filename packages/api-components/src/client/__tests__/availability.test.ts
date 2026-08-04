import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAvailability } from '../availability.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import type { ProviderLocationAvailability } from '../types.js';

/** `data` on the availability endpoint is a bare array, unlike provider_locations. */
function availabilityBody(items: ProviderLocationAvailability[]): string {
  return JSON.stringify({ request_id: 'req_test', data: items });
}

function mockAvailability(body: string, status = 200): void {
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

const PL_A = 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';
const PL_B = 'pr_ghi123-jkl456_mnop7890|lo_ghi123-jkl456_mnop7890';

const AVAILABILITY: ProviderLocationAvailability = {
  provider_location_id: PL_A,
  first_availability: { start_time: '2022-04-27T09:00:00-04:00' },
  timeslots: [
    { start_time: '2022-04-27T09:00:00-04:00' },
    { start_time: '2022-04-27T09:30:00-04:00' },
  ],
};

describe('getAvailability', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    mockAvailability(availabilityBody([AVAILABILITY]));
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('requests the availability path with the required params', async () => {
    await getAvailability({
      providerLocationIds: [PL_A],
      visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
      patientType: 'new',
    });

    const url = firstUrl();
    expect(url.pathname).toBe('/v1/provider_locations/availability');
    expect(url.searchParams.get('visit_reason_id')).toBe('pc_FRO-18leckytNKtruw5dLR');
    expect(url.searchParams.get('patient_type')).toBe('new');
  });

  it('comma-joins provider location ids without escaping the literal pipe away', async () => {
    // Each id already contains a `|` joining its provider and location halves, so a
    // comma-joined list of two ids has to survive round-tripping through URLSearchParams.
    await getAvailability({
      providerLocationIds: [PL_A, PL_B],
      visitReasonId: 'pc_test',
      patientType: 'new',
    });

    expect(firstUrl().searchParams.get('provider_location_ids')).toBe(`${PL_A},${PL_B}`);
  });

  it('maps the date params onto their provider-local-time names', async () => {
    await getAvailability({
      providerLocationIds: [PL_A],
      visitReasonId: 'pc_test',
      patientType: 'existing',
      startDate: '2026-08-04',
      endDate: '2026-08-11',
    });

    const url = firstUrl();
    expect(url.searchParams.get('start_date_in_provider_local_time')).toBe('2026-08-04');
    expect(url.searchParams.get('end_date_in_provider_local_time')).toBe('2026-08-11');
  });

  it('omits the dates when not supplied so the API applies its own 7-day default', async () => {
    await getAvailability({
      providerLocationIds: [PL_A],
      visitReasonId: 'pc_test',
      patientType: 'new',
    });

    const url = firstUrl();
    expect(url.searchParams.has('start_date_in_provider_local_time')).toBe(false);
    expect(url.searchParams.has('end_date_in_provider_local_time')).toBe(false);
  });

  it('unwraps data into one entry per provider location', async () => {
    const result = await getAvailability({
      providerLocationIds: [PL_A],
      visitReasonId: 'pc_test',
      patientType: 'new',
    });

    expect(result).toEqual([AVAILABILITY]);
  });

  it('returns an empty timeslot list rather than undefined when a location has none', async () => {
    // Documented scenario: lo_no_availbility returns no availability. The picker needs
    // an array it can safely map over to render its empty state.
    mockAvailability(availabilityBody([{ provider_location_id: PL_A }]));

    const result = await getAvailability({
      providerLocationIds: [PL_A],
      visitReasonId: 'pc_test',
      patientType: 'new',
    });

    expect(result[0]?.timeslots).toEqual([]);
  });

  it('propagates a server error', async () => {
    mockAvailability(
      JSON.stringify({ request_id: 'req_test', error_type: 'api_error', errors: [] }),
      500
    );

    await expect(
      getAvailability({
        providerLocationIds: ['pr_error|lo_error'],
        visitReasonId: 'pc_test',
        patientType: 'new',
      })
    ).rejects.toBeTruthy();
  });
});
