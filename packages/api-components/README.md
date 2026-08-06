# @powered-by-zocdoc/api-components

The booking components — `zd-provider-search`, `zd-availability`, `zd-booking-form`,
and friends — plus the Zocdoc API client they talk to.

## Status

Scaffold only. `src/client/` and `src/components/` are empty; `src/index.ts` is a stub.

## Layout

```
src/
  client/       transport: config, errors, fetch wrapper, endpoint functions
  components/   presentation: the zd-* custom elements
  test/         shared test setup
```

The client and the components ship together because nothing else consumes the
client. Keeping the boundary inside one package — rather than across two — means the
seam can move as the API surface settles, without a package rename each time.

The boundary itself still holds: `client/` never imports from `components/`. It is
plain functions over `fetch`, testable under node with no DOM. Components import
from `client/` and own all rendering.

## Client

Configured once, globally:

```ts
import { configure } from '@powered-by-zocdoc/api-components';

configure({ baseUrl: '...', token: '...' });
```

Every component then reads that config. No per-component auth attributes — a token
in markup is a token in the page source.

Endpoint functions are plain async functions returning typed results. They throw
typed errors on failure; components catch and render.

## Components

Each component extends `CharmElement`, declares its Charm primitives in
`static get dependencies()`, and writes them as `<scoped-*>` tags inside
`this.html`, which rewrites them to the configured prefix as it renders.

Composition is attributes in, events out. No context protocol — a host page wires
components together by listening for events and setting attributes, which works in
any framework or none.

Importing this package pulls in `@powered-by-zocdoc/primitives`, which sets the `zd`
prefix. See that package's README for why that ordering matters and why nothing here
imports a Charm barrel.

## Testing

Two projects, split by filename:

| Directory | Runs in |
| --- | --- |
| `src/components/**`, `src/__tests__/**` | real Chromium — anything touching `customElements` or rendering |
| everything else | node — client logic, no DOM |

Every test file is plain `*.test.ts`; its directory decides the environment. The node
project is a catch-all, so a new folder runs by default rather than being silently
collected by neither project.

`src/utils/test/setup-browser.ts` imports the primitives package before any test module
evaluates, so the prefix is configured first.

Client tests stub `fetch` and assert on request shape and error mapping. No live API
calls in the suite — the sandbox is for the demo, not for CI.

## PHI

Sandbox data is synthetic, but the discipline holds regardless: no captured API
response goes into a fixture, story, or commit without review. Fixtures are
hand-written from the schema, not pasted from a live call.
