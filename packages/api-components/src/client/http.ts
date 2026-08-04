import { getZocdocConfig, resolveToken, type ZocdocConfig } from './configure.js';
import { mapError } from './errors.js';

export type QueryParams = Record<string, string | number | boolean | string[] | undefined | null>;

export interface ZocdocRequestInit {
  method?: string;
  query?: QueryParams;
  body?: unknown;
  config?: ZocdocConfig;
  signal?: AbortSignal;
}

/**
 * Array values are comma-joined, which is how this API takes repeated ids
 * (`provider_location_ids=a,b`) rather than repeating the key. `null` and
 * `undefined` are dropped so callers can pass optional filters straight through
 * without building the object conditionally.
 */
function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return url.toString();
}

/** The only place in this codebase that calls fetch (CLIENT-001). */
export async function request<T>(path: string, init: ZocdocRequestInit = {}): Promise<T> {
  const config = init.config ?? getZocdocConfig();
  const token = await resolveToken(config);
  const hasBody = init.body !== undefined;

  // Resolved per call, and `fetch` is referenced inside the arrow rather than passed
  // by value, so a test that swaps the global still takes effect and no environment
  // needs `fetch` bound to a receiver.
  const send =
    config.transport ?? ((url: string, requestInit: RequestInit) => fetch(url, requestInit));

  const response = await send(buildUrl(config.baseUrl, path, init.query), {
    method: init.method ?? 'GET',
    signal: init.signal,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(hasBody ? { body: JSON.stringify(init.body) } : {}),
  });

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    // A non-JSON body is still worth carrying on the error, so keep the raw text
    // rather than discarding it or throwing a parse error over the real status.
    parsed = text;
  }

  if (!response.ok) {
    throw mapError(response.status, parsed);
  }

  return parsed as T;
}
