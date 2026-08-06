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
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, settled } from '../../utils/test/mount.js';
import './index.js';

// spy: true keeps real impl but makes exports spyable
vi.mock('../../client/<endpoint>.js', { spy: true });

type Element = HTMLElement & { load(): Promise<void> };

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
    expect(part(el, 'content')).toBeDefined();
  });
});
```

## Test Helpers

**Don't hand-roll `shadow`, a part query, or a relative-date helper in a test
file** — they all live in `src/utils/test/`, and every component test imports them from
there. A local copy is the thing this package most often accumulates.

### `utils/test/mount.ts`

| Helper | Returns |
|---|---|
| `mount<T>(markup)` | Renders into `document.body`, awaits the first update, registers teardown |
| `track(element)` | Registers an element for teardown — for the cases `mount()` can't express |
| `settled(element)` | Awaits Lit's next update cycle |
| `shadow(element)` | The shadow root, throwing and naming the element if there is none |
| `part<T>(element, name)` | The one `[part~="name"]`, throwing if absent |
| `queryPart<T>(element, name)` | Same, nullable — for assertions *about* absence |
| `parts<T>(element, name)` | Every `[part~="name"]`, in render order |
| `texts(element, name)` | The trimmed text of each, in render order |

Part queries use `~=` because `part` is a space-separated list: `part="section contact"`
is one element in two parts, and an exact match misses it.

Wrap these in a domain-named local when it reads better —
`field(el, name) { return part<Control>(el, name); }` — rather than reimplementing
the query.

### `utils/test/dates.ts`

`dayFromToday(offset)` → a `YYYY-MM-DD` key relative to today.

Availability fixtures must be relative: the window starts at today, so a
hard-coded date falls outside it tomorrow and every count reads zero.

**This deliberately reimplements `internal/provider-time.js` rather than importing
it.** If the tests used the component's own helper, a bug in it would move the
fixtures and the assertions together and the suite would agree with it. The
duplication is the oracle — don't "fix" it.

That reasoning stops at the test files. `.stories.ts` needs the same relative
dates but asserts nothing, so the three that need it define
`dayFromToday = (offset) => addDays(todayDayKey(), offset)` over the component's
own helpers. Stories import from `internal/provider-time.js`, never from `test/`.

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
