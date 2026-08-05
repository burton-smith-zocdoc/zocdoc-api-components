---
name: client
description: API client layer patterns - endpoints, errors, caching, configuration. Use when working on packages/api-components/src/client/.
---

# API Client Reference

The client layer lives in `packages/api-components/src/client/`.

## Architecture

```
configure.ts    → Config singleton (baseUrl, getToken, transport)
http.ts         → Central fetch wrapper (only file that calls fetch)
errors.ts       → ZocdocError hierarchy
types.ts        → Wire-format types (snake_case)
<endpoint>.ts   → Thin typed wrappers per API resource
reference-data.ts → Cached reference data (specialties, visit reasons, plans)
mock/           → Mock transport for demos/tests
```

## Configuration

```typescript
import { configureZocdoc } from '@powered-by-zocdoc/api-components';

configureZocdoc({
  baseUrl: 'https://api-developer-sandbox.zocdoc.com',
  getToken: () => fetchFreshToken(),  // Called per request
});
```

| Option | Type | Notes |
|--------|------|-------|
| `baseUrl` | `string` | API base URL |
| `getToken` | `string \| () => string \| Promise<string>` | Token or async function |
| `transport` | `ZocdocTransport` | Optional, defaults to `fetch` |

**Token refresh**: `getToken` is called per request. For 60-minute tokens, pass a function that returns a fresh token.

## HTTP Layer (`http.ts`)

Only this file calls `fetch`. All endpoints use `request<T>()`:

```typescript
async function request<T>(path: string, init?: ZocdocRequestInit): Promise<T>
```

**Query params**:
- Arrays comma-joined: `['a', 'b']` → `param=a,b`
- `undefined`/`null` values dropped
- No empty strings sent

**Headers added**:
- `Authorization: Bearer <token>`
- `Accept: application/json`
- `Content-Type: application/json` (only when body present)

## Error Hierarchy

```typescript
class ZocdocError extends Error {
  status: number;
  code?: string;
  body: unknown;  // Never log or display (may contain PHI echoes)
}

class ZocdocAuthError extends ZocdocError {}    // 401
class ZocdocNotFoundError extends ZocdocError {} // 404
```

Handle in components:

```typescript
import { ZocdocAuthError } from '../client/errors.js';

try {
  await apiCall();
} catch (error) {
  if (error instanceof ZocdocAuthError) {
    // Token expired - emit auth error event
  }
  this.errorMessage = userFacingError(error);
}
```

**PHI rule**: The `body` property must never be rendered or logged - 400 responses may echo submitted field values.

## Endpoint Pattern

Create thin wrappers that map camelCase to snake_case:

```typescript
// provider-locations.ts
import { request } from './http.js';
import type { ZocdocPagedResponse, ProviderLocationsData } from './types.js';

export interface ProviderSearchParams {
  zipCode: string;
  specialtyId?: string;
  visitReasonId?: string;
  // ... camelCase
}

export interface ProviderSearchResult {
  providerLocations: ProviderLocation[];
  totalCount: number;
}

export async function searchProviderLocations(
  params: ProviderSearchParams
): Promise<ProviderSearchResult> {
  const response = await request<ZocdocPagedResponse<ProviderLocationsData>>(
    '/v1/provider_locations',
    {
      query: {
        zip_code: params.zipCode,           // Explicit mapping
        specialty_id: params.specialtyId,
        visit_reason_id: params.visitReasonId,
      },
    }
  );
  
  return {
    providerLocations: response.data?.provider_locations ?? [],
    totalCount: response.total_count ?? 0,
  };
}
```

**Key patterns**:
- Explicit camelCase → snake_case (not auto-converted)
- Defensive defaults for missing arrays/counts
- Return normalized interface, not raw response

## Caching (`reference-data.ts`)

Cache the **Promise**, not the resolved value:

```typescript
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing) return existing as Promise<T>;

  const pending = load().catch((error) => {
    cache.delete(key);  // Evict failed requests
    throw error;
  });
  cache.set(key, pending);
  return pending;
}
```

**Why Promise-cache**: Prevents duplicate requests when components mount simultaneously.

**Cache keys include filters**:
```typescript
cached(`insurance_plans:${JSON.stringify(query)}`, () => fetchAllPages(...))
```

## Available Endpoints

| File | Function | Returns |
|------|----------|---------|
| `provider-locations.ts` | `searchProviderLocations(params)` | `{ providerLocations, totalCount }` |
| `availability.ts` | `getAvailability(params)` | `{ slots }` |
| `appointments.ts` | `createAppointment(params)` | `{ appointmentId }` |
| `reference-data.ts` | `getSpecialties()` | `Specialty[]` (cached) |
| `reference-data.ts` | `getVisitReasons(specialtyId)` | `VisitReason[]` (cached) |
| `reference-data.ts` | `getInsurancePlans(query?)` | `InsurancePlan[]` (cached) |

## Types (`types.ts`)

Wire-format types use **snake_case** matching the API:

```typescript
interface ZocdocResponse<T> {
  data: T;
}

interface ZocdocPagedResponse<T> extends ZocdocResponse<T> {
  total_count: number;
  page: number;
  page_size: number;
}

interface ZocdocErrorResponse {
  error: { code: string; message: string };
}
```

## Adding a New Endpoint

1. Add types to `types.ts` (snake_case, matching API)
2. Create `<resource>.ts` with:
   - camelCase param interface
   - camelCase result interface
   - Async function using `request<T>()`
3. Export from `client/index.ts`
4. Add mock handler to `mock/transport.ts`
5. Add fixtures to `mock/fixtures.ts`

## Mock Transport

For tests and demos:

```typescript
import { configureZocdocMock } from './mock/transport.js';

configureZocdocMock({
  latencyMs: 300,  // Default; set 0 for tests
  availabilityStartDate: '2026-08-05',
});
```

Uses sentinel values from `SCENARIOS` to trigger specific behaviors (errors, empty results).
