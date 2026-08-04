import { request, type QueryParams } from './http.js';
import type { InsurancePlan, Specialty, VisitReason, ZocdocPagedResponse } from './types.js';

/** Documented ceilings on the paged reference-data endpoints. */
const MAX_PAGE_SIZE = 500;
const MAX_PAGES = 200;

/**
 * Reference data is stable within a page load and the search UI needs it to
 * populate selects, so each list is fetched once and shared.
 *
 * The cache holds the **Promise**, not the resolved value (CLIENT-004). That is
 * what makes two components mounting in the same tick share one request instead
 * of racing to issue two. Rejections are evicted, since caching one would poison
 * the entry for the lifetime of the page.
 */
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const existing = cache.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const pending = load().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, pending);
  return pending;
}

/**
 * Walks the paged envelope until `total_count` is satisfied.
 *
 * A single request would cap out at `page_size`, silently truncating any list
 * longer than 500 — and a specialty select missing its tail looks like working
 * software rather than a bug. `MAX_PAGES` matches the API's own ceiling on `page`
 * and also stops us looping forever if `total_count` is ever overstated.
 */
async function fetchAllPages<T>(path: string, query: QueryParams = {}): Promise<T[]> {
  const items: T[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    // Sequential by necessity: the number of pages is only known from a response,
    // so the rule's suggested Promise.all cannot apply here.
    // eslint-disable-next-line no-await-in-loop
    const response = await request<ZocdocPagedResponse<T[]>>(path, {
      query: { ...query, page, page_size: MAX_PAGE_SIZE },
    });

    items.push(...response.data);

    // An empty page is the belt-and-braces exit: without it a `total_count` that
    // overstates the truth would spin through all 200 pages before giving up.
    if (response.data.length === 0 || items.length >= response.total_count) {
      break;
    }
  }

  return items;
}

/** Drops every cached list. Call between tests, or after a token change. */
export function clearReferenceDataCache(): void {
  cache.clear();
}

export function getSpecialties(): Promise<Specialty[]> {
  return cached('specialties', () => fetchAllPages<Specialty>('/v1/specialties'));
}

/**
 * `specialtyId` filters by primary specialty. The parameter is `specialty_id` —
 * `specialty` appears only in the docs' English summary and would be ignored,
 * quietly returning every visit reason instead of the filtered set.
 */
export function getVisitReasons(specialtyId?: string): Promise<VisitReason[]> {
  return cached(`visit_reasons:${specialtyId ?? ''}`, () =>
    fetchAllPages<VisitReason>('/v1/visit_reasons', { specialty_id: specialtyId })
  );
}

export function getInsurancePlans(): Promise<InsurancePlan[]> {
  return cached('insurance_plans', () => fetchAllPages<InsurancePlan>('/v1/insurance_plans'));
}
