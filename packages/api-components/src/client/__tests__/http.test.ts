import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { ZocdocAuthError, ZocdocError, ZocdocNotFoundError } from '../errors.js';
import { request } from '../http.js';

/**
 * A fresh Response per call — a body can only be read once, and several cases
 * below issue the same request twice to assert on two things about the rejection.
 */
function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status,
          headers: { 'content-type': 'application/json' },
        })
    )
  );
}

/**
 * These throw rather than returning `undefined` so a test that never reached
 * fetch fails with a clear reason instead of a TypeError on a missing property.
 */
function lastInit(): RequestInit {
  const init = vi.mocked(fetch).mock.calls[0]?.[1];
  if (!init) {
    throw new Error('fetch was not called');
  }
  return init;
}

function headersOf(init: RequestInit | undefined): Record<string, string> {
  if (!init?.headers) {
    throw new Error('fetch was called without headers');
  }
  return init.headers as Record<string, string>;
}

function lastUrl(): string {
  return String(vi.mocked(fetch).mock.calls[0]?.[0]);
}

describe('request', () => {
  beforeEach(() => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok_123' });
  });

  afterEach(() => {
    resetZocdocConfig();
    vi.unstubAllGlobals();
  });

  it('sends a bearer token', async () => {
    mockFetch(200, { ok: true });
    await request('/v1/thing');

    expect(headersOf(lastInit()).Authorization).toBe('Bearer tok_123');
  });

  it('resolves an async getToken function', async () => {
    configureZocdoc({ baseUrl: 'https://example.test', getToken: async () => 'tok_async' });
    mockFetch(200, { ok: true });
    await request('/v1/thing');

    expect(headersOf(lastInit()).Authorization).toBe('Bearer tok_async');
  });

  it('calls getToken per request, so a 60-minute expiry can be refreshed without us', async () => {
    let issued = 0;
    configureZocdoc({ baseUrl: 'https://example.test', getToken: () => `tok_${++issued}` });
    mockFetch(200, { ok: true });

    await request('/v1/thing');
    await request('/v1/thing');

    const tokens = vi.mocked(fetch).mock.calls.map((call) => headersOf(call[1]).Authorization);
    expect(tokens).toEqual(['Bearer tok_1', 'Bearer tok_2']);
  });

  it('comma-joins array query params and omits undefined ones', async () => {
    mockFetch(200, { ok: true });
    await request('/v1/thing', { query: { ids: ['a', 'b'], skip: undefined, n: 3 } });

    expect(lastUrl()).toBe('https://example.test/v1/thing?ids=a%2Cb&n=3');
  });

  it('percent-encodes the pipe in a provider_location_id', async () => {
    // Real IDs look like pr_abc|lo_abc — an unencoded pipe is an invalid URL.
    mockFetch(200, { ok: true });
    await request('/v1/provider_locations/availability', {
      query: { provider_location_ids: ['pr_abc|lo_abc'] },
    });

    expect(lastUrl()).toBe(
      'https://example.test/v1/provider_locations/availability?provider_location_ids=pr_abc%7Clo_abc'
    );
  });

  it('throws ZocdocAuthError on 401', async () => {
    mockFetch(401, { message: 'Unauthorized' });

    await expect(request('/v1/thing')).rejects.toBeInstanceOf(ZocdocAuthError);
    await expect(request('/v1/thing')).rejects.toMatchObject({ status: 401, code: 'AUTH_ERROR' });
  });

  it('throws ZocdocNotFoundError on 404', async () => {
    mockFetch(404, { message: 'No such plan' });

    await expect(request('/v1/insurance_plans/ip_0')).rejects.toBeInstanceOf(ZocdocNotFoundError);
    await expect(request('/v1/insurance_plans/ip_0')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('throws ZocdocError with the status on other failures', async () => {
    mockFetch(500, { message: 'boom' });

    await expect(request('/v1/thing')).rejects.toMatchObject({ status: 500 });
    await expect(request('/v1/thing')).rejects.toBeInstanceOf(ZocdocError);
  });

  it('keeps the upstream body off the error message', async () => {
    // PHI-001: an error body may echo a submitted field value, so it is carried
    // on the error for debugging but must never reach the message.
    const sentinel = 'SENTINEL_UPSTREAM_DETAIL';
    mockFetch(400, { error_type: 'invalid_request', errors: [{ message: sentinel }] });

    await expect(request('/v1/thing')).rejects.toMatchObject({
      body: { errors: [{ message: sentinel }] },
    });

    const error = await request('/v1/thing').then(
      () => new Error('expected a rejection'),
      (reason: unknown) => reason as Error
    );
    expect(error.message).not.toContain(sentinel);
    expect(error.message).toContain('400');
  });

  it('narrows to ZocdocError, so callers can discriminate auth from the rest', async () => {
    mockFetch(401, {});

    // The hierarchy is what lets a component show "session expired" for one case
    // and a generic message for every other.
    await expect(request('/v1/thing')).rejects.toBeInstanceOf(ZocdocError);
  });

  it('sends a JSON body for POST', async () => {
    mockFetch(200, { appointment_id: 'ap_1' });
    await request('/v1/appointments', { method: 'POST', body: { a: 1 } });

    expect(lastInit().method).toBe('POST');
    expect(lastInit().body).toBe('{"a":1}');
  });

  it('omits Content-Type when there is no body', async () => {
    mockFetch(200, { ok: true });
    await request('/v1/thing');

    const headers = headersOf(lastInit());
    expect(headers['Content-Type']).toBeUndefined();
    expect(headers.Accept).toBe('application/json');
  });

  it('returns the parsed JSON body', async () => {
    mockFetch(200, { data: [{ id: 'sp_153' }], total_count: 1 });

    await expect(request('/v1/specialties')).resolves.toEqual({
      data: [{ id: 'sp_153' }],
      total_count: 1,
    });
  });

  it('throws a helpful error when configureZocdoc was never called', async () => {
    resetZocdocConfig();
    mockFetch(200, { ok: true });

    await expect(request('/v1/thing')).rejects.toThrow(/not configured/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('accepts a per-call config override without touching the singleton', async () => {
    mockFetch(200, { ok: true });
    await request('/v1/thing', {
      config: { baseUrl: 'https://other.test', getToken: 'tok_other' },
    });

    expect(lastUrl()).toBe('https://other.test/v1/thing');
    expect(headersOf(lastInit()).Authorization).toBe('Bearer tok_other');
  });
});
