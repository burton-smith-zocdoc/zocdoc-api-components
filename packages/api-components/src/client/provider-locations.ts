import { ZocdocError } from './errors.js';
import { request } from './http.js';
import type {
  ProviderLocation,
  ProviderLocationsData,
  VisitType,
  ZocdocPagedResponse,
  ZocdocResponse,
} from './types.js';

export interface ProviderSearchParams {
  /** Required by the API — there is no "search everywhere" mode. */
  zipCode: string;
  specialtyId?: string;
  visitReasonId?: string;
  insurancePlanId?: string;
  visitType?: VisitType;
  maxDistanceToPatientMi?: number;
  page?: number;
  pageSize?: number;
}

/**
 * What `page_size` is when nothing asks for another, per the endpoint's documentation. Exported
 * because a pager has to know it to work out how many pages a `total_count` is, and deriving
 * that from a second copy of the number is how the two drift apart.
 */
export const DEFAULT_PAGE_SIZE = 10;

export interface ProviderSearchResult {
  providerLocations: ProviderLocation[];
  /**
   * From the paged envelope, so a caller can decide whether another page exists
   * without parsing `next_url`.
   */
  totalCount: number;
  /**
   * The page size the response was actually built with, which is not necessarily the one that
   * was asked for — a caller pairs it with `totalCount` to count pages.
   */
  pageSize: number;
  /** The API echoes these back, filling in defaults it chose for omitted filters. */
  searchParameters: ProviderLocationsData['search_parameters'];
}

/**
 * Params are camelCase here and snake_case on the wire. The mapping is written out
 * rather than generated from the key names because two of them are not mechanical
 * transforms — `maxDistanceToPatientMi` and the paging pair — and a clever
 * auto-converter would silently mangle exactly those.
 *
 * Unsupplied values are left `undefined`; `request` drops them, so an optional filter
 * never reaches the API as an empty string (which it would treat as a real value).
 */
export async function searchProviderLocations(
  params: ProviderSearchParams
): Promise<ProviderSearchResult> {
  const response = await request<ZocdocPagedResponse<ProviderLocationsData>>(
    '/v1/provider_locations',
    {
      query: {
        zip_code: params.zipCode,
        specialty_id: params.specialtyId,
        visit_reason_id: params.visitReasonId,
        insurance_plan_id: params.insurancePlanId,
        visit_type: params.visitType,
        max_distance_to_patient_mi: params.maxDistanceToPatientMi,
        page: params.page,
        page_size: params.pageSize,
      },
    }
  );

  return {
    // A 200 whose data object omits the array would otherwise hand the component
    // `undefined` and crash its render instead of showing the empty state.
    providerLocations: response.data?.provider_locations ?? [],
    totalCount: response.total_count ?? 0,
    // A response that omits the echo was still built with the default, so that is what it was.
    pageSize: response.page_size ?? DEFAULT_PAGE_SIZE,
    searchParameters: response.data?.search_parameters,
  };
}

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
