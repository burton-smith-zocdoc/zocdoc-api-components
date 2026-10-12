# TEST-004: Ship a report-only `*.performance.ts` for every component

Every component has a `<name>.performance.ts` beside it. It times mount, rerender, and bulk
mount (10 / 50 / 100 instances) and prints median, p95, min and max. It **never fails on a
number** — timings on a laptop are too noisy for a budget — only on a thrown error or a
component that never becomes ready.

Run locally only: `pnpm test:performance`. It is not part of `pnpm test` or CI. Results are
also merged into `performance-results/<package>.json` (gitignored); compare two runs with
`diff` after copying the first aside.

The harness is `packages/primitives/src/utils/test/performance.ts`.

**Leaf primitive** — nothing to change, rerender is `requestUpdate()`:

```ts
import { describe, it } from 'vitest';
import { benchmarkTag } from '../../utils/test/performance.js';

describe('zd-badge performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkTag('badge', 'zd-badge');
  });
});
```

**Composed primitive** — realistic children, a real state change, `COMPOSED_OPTIONS`:

```ts
await benchmarkComponent(
  {
    name: 'tabs',
    create: () => {
      const element = document.createElement('zd-tabs');
      element.innerHTML =
        '<zd-tab id="tab-one">One</zd-tab>…<zd-tab-panel slot="tabpanel">Panel one</zd-tab-panel>…';
      return element;
    },
    update: (element, i) => element.setAttribute('active-id', i % 2 ? 'tab-one' : 'tab-two'),
  },
  COMPOSED_OPTIONS
);
```

**API component** — mock the client layer (TEST-002), fixtures only (TEST-003), wait for a
success-only part, and rerender with an input that does **not** refetch:

```ts
vi.mock('../../client/appointments.js', { spy: true });
// beforeEach: vi.spyOn(appointments, 'getAppointment').mockResolvedValue(APPOINTMENT);

await benchmarkComponent(
  {
    name: 'appointment',
    create: () => { /* set appointment-id */ },
    update: (element, i) => element.toggleAttribute('hide-photo', i % 2 === 0),
    ready: untilPart('panel'),
  },
  { ...COMPOSED_OPTIONS, record: 'api-components' }
);
```

**Don't:**

- Assert on a duration (`expect(report.mount.median).toBeLessThan(…)`).
- Import a primitive's component module in its benchmark — the setup file already registered
  every `zd-*` tag, and a second definition throws.
- Rerender an async component by changing an id it fetches on — the old success markup is
  still on screen, so `ready` resolves before the new render.
- Mock `fetch`.
