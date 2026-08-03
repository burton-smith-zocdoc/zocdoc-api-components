# CLIENT-001: Centralize fetch in http.ts

`client/http.ts` is the only module that calls `fetch`. It resolves the token, sets `Authorization: Bearer` and `Accept`, serializes query parameters (comma-joining array-valued ones such as `provider_location_ids` and `npis`), and maps non-2xx responses to typed errors.

Endpoint modules are thin typed wrappers over it.

**Do:**

```ts
// client/http.ts
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const config = getConfig();
  const token = await resolveToken(config.getToken);
  const url = buildUrl(config.baseUrl, path, options.params);
  
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...(options.body && { 'Content-Type': 'application/json' }),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  if (!response.ok) {
    throw mapError(response);
  }
  return response.json();
}
```

```ts
// client/provider-locations.ts
import { request } from './http.js';

export function searchProviderLocations(params: SearchParams) {
  return request<ProviderLocationResponse>('/v1/provider_locations', { params });
}
```

**Don't:**

```ts
// ❌ Fetch scattered across modules — inconsistent headers, error handling
export async function searchProviderLocations(params: SearchParams) {
  const response = await fetch(`${baseUrl}/v1/provider_locations?...`);
  return response.json();
}
```

See also: [CLIENT-002](./CLIENT-002.md), [CLIENT-003](./CLIENT-003.md)
