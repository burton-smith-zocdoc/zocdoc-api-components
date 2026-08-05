---
name: testing
description: Testing patterns for api-components. Use when writing or debugging tests for components or client code.
---

# Testing Reference

Two Vitest projects run in different environments.

## Projects

| Project | Environment | Tests | What to mock |
|---------|-------------|-------|--------------|
| `client` | Node | `packages/*/src/**/*.test.ts` (except components) | `fetch` via `vi.stubGlobal` |
| `components` | Browser (Playwright) | `packages/*/src/components/**/*.test.ts` | Client layer via `vi.mock` |

Run all: `pnpm test`
Run one: `pnpm test --project=components`

## Component Test Template

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as clientModule from '../../client/<endpoint>.js';
import { expectNoViolations } from '../../test/a11y.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

// spy: true keeps real impl but makes exports spyable
vi.mock('../../client/<endpoint>.js', { spy: true });

type Element = HTMLElement & { load(): Promise<void> };

function shadow(el: Element): ShadowRoot {
  const root = el.shadowRoot;
  if (!root) throw new Error('no shadow root');
  return root;
}

describe('zd-component', () => {
  beforeEach(() => {
    vi.spyOn(clientModule, 'apiCall').mockResolvedValue(/* fixture */);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders after load', async () => {
    const el = await mount<Element>(`<zd-component></zd-component>`);
    await el.load();
    await settled(el);
    expect(shadow(el).querySelector('[part="content"]')).not.toBeNull();
  });
});
```

## Test Helpers

### mount(markup)

Renders HTML into `document.body`, waits for `updateComplete`, registers for teardown:

```typescript
const el = await mount<MyElement>(`<zd-foo id="123"></zd-foo>`);
```

### settled(element)

Awaits Lit's next update cycle:

```typescript
el.someProperty = 'new value';
await settled(el);
```

### expectNoViolations(element)

Runs axe-core on the element. Use for every visual state:

```typescript
await expectNoViolations(el);
```

## Mocking Client Layer (Components)

Mock at the module level, not `fetch`:

```typescript
import * as providerLocations from '../../client/provider-locations.js';

vi.mock('../../client/provider-locations.js', { spy: true });

beforeEach(() => {
  vi.spyOn(providerLocations, 'searchProviderLocations').mockResolvedValue({
    providerLocations: FIXTURES.PROVIDER_LOCATIONS,
    totalCount: 1,
  });
});
```

## Mocking Fetch (Client Tests)

For testing HTTP behavior in client layer:

```typescript
vi.stubGlobal('fetch', vi.fn(async () => 
  new Response(JSON.stringify({ data: [] }), { status: 200 })
));
```

## Fixtures and Scenarios

Import from `../../client/mock/fixtures.js`:

### SCENARIOS (Sentinel Values)

```typescript
SCENARIOS.zipWithResults        // '11201' - returns providers
SCENARIOS.zipEmpty              // '99734' - no results
SCENARIOS.zipError              // '10112' - 500 error
SCENARIOS.providerLocationError // 'pr_error|lo_error' - server error
```

### Fixture Data

```typescript
import {
  PROVIDER_LOCATIONS,
  SPECIALTIES,
  VISIT_REASONS,
  INSURANCE_PLANS,
  buildAvailability,
} from '../../client/mock/fixtures.js';

// Generate slots relative to a date
const availability = buildAvailability('pr_a|lo_a', new Date(), 7);
```

## Accessibility Testing

Test every state - not just success:

```typescript
describe('accessibility', () => {
  it('passes axe in success state', async () => {
    const el = await mount<Element>(`<zd-foo></zd-foo>`);
    await el.load();
    await settled(el);
    await expectNoViolations(el);
  });

  it('passes axe in error state', async () => {
    vi.mocked(clientModule.apiCall).mockRejectedValue(new Error('fail'));
    const el = await mount<Element>(`<zd-foo></zd-foo>`);
    await el.load();
    await settled(el);
    await expectNoViolations(el);
  });

  it('passes axe in empty state', async () => {
    vi.mocked(clientModule.apiCall).mockResolvedValue([]);
    const el = await mount<Element>(`<zd-foo></zd-foo>`);
    await el.load();
    await settled(el);
    await expectNoViolations(el);
  });
});
```

## Mock Transport (Storybook/Demo)

For stories and demos, use the mock transport:

```typescript
import { configureZocdocMock } from '../../client/mock/transport.js';

configureZocdocMock({
  latencyMs: 0,  // instant for tests, default 300ms for stories
  availabilityStartDate: '2026-08-05',
});
```

## Common Gotchas

1. **`{ spy: true }` required** - ES module exports are non-configurable in browser; without `spy: true`, spyOn fails
2. **await settled() after property changes** - Lit updates are async
3. **Test all states** - success, empty, error, loading
4. **Use SCENARIOS values** - matches real sandbox behavior
5. **clearMocks: true** - config handles this, but don't rely on mock state between tests
