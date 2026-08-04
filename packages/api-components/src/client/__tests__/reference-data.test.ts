import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import {
  clearReferenceDataCache,
  getInsurancePlans,
  getSpecialties,
  getVisitReasons,
} from '../reference-data.js';

/**
 * Reference data comes back in the paged envelope, so every mock here wraps its
 * items — a bare array would let a regression that forgets to unwrap `data` pass.
 */
function pagedBody<T>(items: T[], page: number, pageSize: number, totalCount: number): unknown {
  return {
    request_id: 'req_test',
    page,
    page_size: pageSize,
    total_count: totalCount,
    next_url: null,
    data: items,
  };
}

/** Serves `all` a page at a time, honouring the page/page_size the caller asked for. */
function mockPagedFetch<T>(all: T[]): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      const page = Number(url.searchParams.get('page') ?? '0');
      const pageSize = Number(url.searchParams.get('page_size') ?? '100');
      const slice = all.slice(page * pageSize, (page + 1) * pageSize);
      return new Response(JSON.stringify(pagedBody(slice, page, pageSize, all.length)), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    })
  );
}

function firstUrl(): URL {
  return new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
}

const SPECIALTY = {
  id: 'sp_153',
  name: 'Primary Care Doctor',
  care_category: 'health',
  default_visit_reason_id: 'pc_FRO-18leckytNKtruw5dLR',
  default_visit_reason_name: 'New patient visit',
};

describe('reference data', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
    clearReferenceDataCache();
    mockPagedFetch([SPECIALTY]);
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('requests /v1/specialties', async () => {
    await getSpecialties();

    expect(firstUrl().pathname).toBe('/v1/specialties');
  });

  it('unwraps the paged envelope rather than returning it', async () => {
    // The endpoint returns { request_id, page, …, data: [...] }. Returning that
    // object instead of data would typecheck against a loose signature and then
    // break every consumer that expects to map over the result.
    await expect(getSpecialties()).resolves.toEqual([SPECIALTY]);
  });

  it('caches results across calls', async () => {
    await getSpecialties();
    await getSpecialties();

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('shares one in-flight request between concurrent callers', async () => {
    // Two components mounting at once must not each trigger a fetch. This is why
    // the cache stores the Promise and not the resolved value (CLIENT-004).
    const [a, b] = await Promise.all([getSpecialties(), getSpecialties()]);

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('refetches after the cache is cleared', async () => {
    await getSpecialties();
    clearReferenceDataCache();
    await getSpecialties();

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('does not cache a rejected request', async () => {
    // Caching a rejection would poison the cache for the lifetime of the page.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 500 }))
    );
    await expect(getSpecialties()).rejects.toBeTruthy();

    mockPagedFetch([SPECIALTY]);
    await expect(getSpecialties()).resolves.toEqual([SPECIALTY]);
  });

  it('follows pages until total_count is satisfied', async () => {
    // page_size caps at 500, so a directory with more entries than that would be
    // silently truncated by a single-request implementation — a select showing
    // two thirds of the insurance plans looks like working software.
    const many = Array.from({ length: 600 }, (_, index) => ({
      id: `sp_test_${index}`,
      name: `Specialty ${index}`,
    }));
    mockPagedFetch(many);

    const result = await getSpecialties();

    expect(result).toHaveLength(600);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect(firstUrl().searchParams.get('page_size')).toBe('500');
    expect(new URL(String(vi.mocked(fetch).mock.calls[1]?.[0])).searchParams.get('page')).toBe('1');
  });

  it('stops without a second request when one page covers total_count', async () => {
    await getSpecialties();

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when the directory has no entries', async () => {
    mockPagedFetch([]);

    await expect(getSpecialties()).resolves.toEqual([]);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('filters visit reasons with specialty_id, not specialty', async () => {
    // The parameter is `specialty_id`; `specialty` is prose from the docs summary
    // and is silently ignored by the API, which would return every visit reason.
    mockPagedFetch([{ id: 'pc_FRO-18leckytNKtruw5dLR', name: 'Checkup', specialty_id: 'sp_153' }]);
    await getVisitReasons('sp_153');

    const url = firstUrl();
    expect(url.pathname).toBe('/v1/visit_reasons');
    expect(url.searchParams.get('specialty_id')).toBe('sp_153');
    expect(url.searchParams.has('specialty')).toBe(false);
  });

  it('omits specialty_id when no specialty was supplied', async () => {
    mockPagedFetch([]);
    await getVisitReasons();

    expect(firstUrl().searchParams.has('specialty_id')).toBe(false);
  });

  it('caches visit reasons per specialty', async () => {
    mockPagedFetch([]);
    await getVisitReasons('sp_153');
    await getVisitReasons('sp_153');
    await getVisitReasons();

    // Two distinct filters, so two requests — and the repeat is served from cache.
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('requests /v1/insurance_plans', async () => {
    mockPagedFetch([{ id: 'ip_9111', name: 'A Plan' }]);

    await expect(getInsurancePlans()).resolves.toEqual([{ id: 'ip_9111', name: 'A Plan' }]);
    expect(firstUrl().pathname).toBe('/v1/insurance_plans');
  });

  it('keeps each endpoint on its own cache key', async () => {
    await getSpecialties();
    await getVisitReasons();
    await getInsurancePlans();

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
  });
});
