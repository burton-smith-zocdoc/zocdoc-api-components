/**
 * A `fetch`-shaped transport that serves the documented sandbox fixtures without a
 * token and without any outbound request.
 *
 * It routes on path and honours the documented sentinel inputs, so a story or demo
 * drives a state by sending the same value it would send to the real sandbox. That
 * keeps the mock honest: there is no mock-only switch that production code could come
 * to depend on, and swapping back to the real API is a config change with no edits to
 * the components.
 *
 * Because it never touches the network it also satisfies PHI-003 trivially — there is
 * no outbound destination at all.
 */
import { configureZocdoc, type ZocdocTransport } from '../configure.js';
import type { Patient, ZocdocErrorResponse } from '../types.js';
import {
  BOOKINGS,
  DEFAULT_BOOKING,
  INSURANCE_PLANS,
  PROVIDER_LOCATIONS,
  SCENARIOS,
  SPECIALTIES,
  VISIT_REASONS,
  buildAvailability,
} from './fixtures.js';

export interface MockTransportOptions {
  /**
   * Artificial delay per request, in ms. Defaults to 300 so the `loading` leg of the
   * COMP-001 state machine is actually observable — with an instant resolve, a demo
   * jumps straight to `success` and a broken spinner looks fine.
   */
  latencyMs?: number;
  /**
   * Pins the first day of generated availability, overriding the requested window's
   * start date. Without it the window comes from the request, defaulting to today — set
   * this only when dates have to hold still, as in a test or a visual snapshot.
   */
  availabilityStartDate?: string;
}

/**
 * `.invalid` is reserved by RFC 2606 and can never resolve, so a request that somehow
 * escapes the mock transport fails at DNS rather than reaching a real host.
 */
const MOCK_BASE_URL = 'https://mock.api-developer-sandbox.invalid';

/** What the availability endpoint returns when the request names no window. */
const DEFAULT_AVAILABILITY_DAYS = 7;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function errorBody(message: string, type: ZocdocErrorResponse['error_type']): ZocdocErrorResponse {
  return { request_id: 'req_mock', error_type: type, errors: [{ message }] };
}

interface Paging {
  page: number;
  pageSize: number;
}

function paging(url: URL, defaultPageSize: number): Paging {
  return {
    page: Number(url.searchParams.get('page') ?? '0'),
    pageSize: Number(url.searchParams.get('page_size') ?? String(defaultPageSize)),
  };
}

/**
 * Mirrors the real paged envelope so pagination code is exercised, not bypassed.
 *
 * `totalCount` is the unpaged total and `data` is already the page — the two are passed
 * separately because `/v1/provider_locations` wraps its page inside an object, so this
 * cannot slice on the caller's behalf.
 */
function paged(totalCount: number, { page, pageSize }: Paging, data: unknown): Response {
  const consumed = page * pageSize + pageSize;
  return json({
    request_id: 'req_mock',
    page,
    page_size: pageSize,
    total_count: totalCount,
    // Empty string on the last page, and an absolute URL otherwise — both copied from
    // production (2026-08-04), which contradicts the spec's "null if this is the last
    // page". Imitating the spec here would hide that from anything built on the mock.
    next_url:
      consumed < totalCount ? `${MOCK_BASE_URL}/v1?page=${page + 1}&page_size=${pageSize}` : '',
    data,
  });
}

/** The list endpoints all page the same way: slice, then wrap. */
function pagedList<T>(items: T[], p: Paging): Response {
  const start = p.page * p.pageSize;
  return paged(items.length, p, items.slice(start, start + p.pageSize));
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function handleProviderLocations(url: URL): Response {
  const zip = url.searchParams.get('zip_code');

  if (zip === SCENARIOS.zipError) {
    return json(errorBody('Simulated server error.', 'api_error'), 500);
  }
  if (url.searchParams.get('insurance_plan_id') === SCENARIOS.insurancePlanMissing) {
    // 400 here, not 404: as a search *filter* `ip_0` is documented as an invalid plan.
    // The same id fetched as a path resource is the case that 404s.
    return json(errorBody('Invalid insurance plan.', 'invalid_request'), 400);
  }

  const specialtyId = url.searchParams.get('specialty_id');
  const visitType = url.searchParams.get('visit_type');

  let locations = zip === SCENARIOS.zipEmpty ? [] : PROVIDER_LOCATIONS;
  if (specialtyId) {
    locations = locations.filter((l) => l.provider.specialty_ids?.includes(specialtyId));
  }
  if (visitType === 'video_visit') {
    locations = locations.filter((l) => l.provider_location_type === 'virtual_provider');
  } else if (visitType === 'in_person') {
    locations = locations.filter((l) => l.provider_location_type === 'in_person_provider');
  }

  const p = paging(url, 25);
  const start = p.page * p.pageSize;

  return paged(locations.length, p, {
    // The real API echoes the ids it resolved, including the default it picked for an
    // omitted visit reason — a component that reads these back gets the same shape here.
    search_parameters: {
      specialty_id: specialtyId ?? undefined,
      visit_reason_id:
        url.searchParams.get('visit_reason_id') ?? locations[0]?.provider.default_visit_reason_id,
    },
    provider_locations: locations.slice(start, start + p.pageSize),
  });
}

/**
 * Days between two `YYYY-MM-DD` strings. Parsed as UTC midnight on both sides so the
 * subtraction is a whole number of days regardless of the browser's zone, and floored at
 * one day: a window that ends before it starts is the caller's problem, not a reason to
 * return nothing.
 */
function windowDays(startDate: string, endDate: string | null): number {
  if (!endDate) return DEFAULT_AVAILABILITY_DAYS;

  const span = Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`);
  if (Number.isNaN(span)) return DEFAULT_AVAILABILITY_DAYS;

  return Math.max(1, Math.round(span / 86_400_000));
}

function handleAvailability(url: URL, pinnedStartDate?: string): Response {
  const ids = (url.searchParams.get('provider_location_ids') ?? '')
    .split(',')
    .filter((id) => id.length > 0);

  if (ids.includes(SCENARIOS.providerLocationError)) {
    return json(errorBody('Simulated server error.', 'api_error'), 500);
  }

  // The real endpoint reads the window from these two parameters and defaults to 7 days
  // when they are absent, so the mock has to as well — a picker asking for two weeks and
  // getting one day back would look like a component bug. `pinnedStartDate` still wins,
  // because its whole job is holding the dates still for a test or a snapshot.
  const startDate =
    pinnedStartDate ?? url.searchParams.get('start_date_in_provider_local_time') ?? todayIso();
  const days = windowDays(startDate, url.searchParams.get('end_date_in_provider_local_time'));

  return json({
    request_id: 'req_mock',
    data: ids.map((id) => buildAvailability(id, startDate, days)),
  });
}

/**
 * Serves `POST /v1/appointments`.
 *
 * Nothing is stored. The submitted patient is read only to check the fields the location
 * requires and is then discarded — it is never retained, echoed in full, or put in an
 * error message (PHI-001). The two fields the real API does echo, `developer_patient_id`
 * and `notes`, are passed back so a confirmation screen can render them.
 */
function handleCreateAppointment(rawBody: unknown): Response {
  const body = rawBody as
    | { data?: { provider_location_id?: string; patient?: Patient; notes?: string } }
    | undefined;
  const data = body?.data;
  const locationId = data?.provider_location_id ?? '';
  const insurance = data?.patient?.insurance;

  if (locationId === SCENARIOS.providerLocationError) {
    return json(errorBody('Simulated server error.', 'api_error'), 500);
  }

  const location = PROVIDER_LOCATIONS.find((l) => l.provider_location_id === locationId);
  const required = location?.booking_requirements?.required_fields ?? [];
  // The required fields are dotted paths into this very body, so they are checked by
  // path — a component that sends the wrong key gets rejected here as it would live.
  const missing = required.filter((path) => {
    if (path === 'data.patient.insurance.insurance_plan_id') {
      return !insurance?.insurance_plan_id;
    }
    if (path === 'data.patient.insurance.insurance_member_id') {
      return !insurance?.insurance_member_id;
    }
    return false;
  });
  if (missing.length > 0) {
    // Names the paths, never the values.
    return json(
      errorBody(`Missing required fields: ${missing.join(', ')}.`, 'invalid_request'),
      400
    );
  }

  if (locationId === SCENARIOS.providerLocationSelfPayNotAccepted && insurance?.is_self_pay) {
    return json(errorBody('This provider does not accept self-pay.', 'invalid_request'), 400);
  }
  if (locationId === SCENARIOS.providerLocationInNetworkOnly && insurance?.insurance_plan_id) {
    return json(
      errorBody('This provider accepts in-network patients only.', 'invalid_request'),
      400
    );
  }

  const { status, appointmentId } = BOOKINGS[locationId] ?? DEFAULT_BOOKING;
  return json({
    request_id: 'req_mock',
    data: {
      appointment_id: appointmentId,
      appointment_status: status,
      is_provider_resource: false,
      // `manual` for the pending statuses, since awaiting the practice is why they pend.
      confirmation_type: status.startsWith('pending') ? 'manual' : 'auto',
      visit_type:
        location?.provider_location_type === 'virtual_provider'
          ? 'zocdoc_video_service'
          : 'in_person',
      ...(data?.patient?.developer_patient_id === undefined
        ? {}
        : { developer_patient_id: data.patient.developer_patient_id }),
      ...(data?.notes === undefined ? {} : { notes: data.notes }),
    },
  });
}

/**
 * Creates the transport. Routing is a chain of explicit path checks rather than a table
 * keyed by path, because the interesting endpoints decide on more than the path — the
 * sentinel zip codes and provider location ids live in the query string or the body.
 */
export function createMockTransport(options: MockTransportOptions = {}): ZocdocTransport {
  const { latencyMs = 300, availabilityStartDate } = options;

  return async (rawUrl: string, init: RequestInit = {}): Promise<Response> => {
    if (latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
    }

    const url = new URL(rawUrl);
    const path = url.pathname;

    if (path === '/v1/appointments' && init.method === 'POST') {
      // `request` always stringifies, so a non-string body means a caller bypassed it.
      return handleCreateAppointment(
        typeof init.body === 'string' ? JSON.parse(init.body) : undefined
      );
    }

    if (path === '/v1/specialties') {
      return pagedList(SPECIALTIES, paging(url, 100));
    }

    if (path === '/v1/visit_reasons') {
      const specialtyId = url.searchParams.get('specialty_id');
      const reasons = specialtyId
        ? VISIT_REASONS.filter((r) => r.specialty_id === specialtyId)
        : VISIT_REASONS;
      return pagedList(reasons, paging(url, 100));
    }

    if (path === '/v1/insurance_plans') {
      return pagedList(INSURANCE_PLANS, paging(url, 100));
    }

    if (path === '/v1/provider_locations') {
      return handleProviderLocations(url);
    }

    if (path === '/v1/provider_locations/availability') {
      return handleAvailability(url, availabilityStartDate);
    }

    // An unrouted path is a bug in the mock, not a 404 the component should render, so
    // it says which path was missed rather than imitating a real not-found response.
    return json(errorBody(`Mock transport has no handler for ${path}.`, 'api_error'), 501);
  };
}

/**
 * Convenience wrapper for demos and stories: configures the client to serve fixtures.
 *
 * The token is a fixed placeholder, not a credential — the mock never reads it. It is
 * supplied because `getToken` stays required on the real path, where a missing token
 * silently sending unauthenticated requests would be far worse than a type error.
 */
export function configureZocdocMock(options: MockTransportOptions = {}): void {
  configureZocdoc({
    baseUrl: MOCK_BASE_URL,
    getToken: 'mock-token-not-a-credential',
    transport: createMockTransport(options),
  });
}
