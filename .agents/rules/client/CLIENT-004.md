# CLIENT-004: Cache reference data at module level

Reference data (specialties, visit reasons, insurance plans) is stable within a page load and the search UI needs it to populate selects. Cache it in a module-level map.

**Do:**

```ts
// client/reference-data.ts
const cache = new Map<string, Promise<unknown>>();

export function getSpecialties(): Promise<Specialty[]> {
  if (!cache.has('specialties')) {
    cache.set('specialties', request<Specialty[]>('/v1/specialties'));
  }
  return cache.get('specialties') as Promise<Specialty[]>;
}

export function getVisitReasons(): Promise<VisitReason[]> {
  if (!cache.has('visit_reasons')) {
    cache.set('visit_reasons', request<VisitReason[]>('/v1/visit_reasons'));
  }
  return cache.get('visit_reasons') as Promise<VisitReason[]>;
}

export function getInsurancePlans(): Promise<InsurancePlan[]> {
  if (!cache.has('insurance_plans')) {
    cache.set('insurance_plans', request<InsurancePlan[]>('/v1/insurance_plans'));
  }
  return cache.get('insurance_plans') as Promise<InsurancePlan[]>;
}
```

Note: the cache stores the Promise, not the resolved value. This prevents duplicate in-flight requests when multiple components call the same function before the first resolves.

**Don't:**

```ts
// ❌ No caching — N components = N redundant API calls
export function getSpecialties(): Promise<Specialty[]> {
  return request<Specialty[]>('/v1/specialties');
}

// ❌ Caching the value, not the promise — race condition
let cached: Specialty[] | null = null;
export async function getSpecialties(): Promise<Specialty[]> {
  if (!cached) {
    cached = await request<Specialty[]>('/v1/specialties');
  }
  return cached;
}
```

See also: [CLIENT-001](./CLIENT-001.md)
