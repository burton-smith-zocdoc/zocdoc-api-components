# powered-by-zocdoc

Standards-based web components for the [Zocdoc public API](https://api-docs.zocdoc.com/guides).
They are custom elements, so they work in any framework or in plain HTML.

The first slice is a booking flow: search for providers, pick a time, enter patient
details, confirm.

## Status

Proof of concept. Not published, not versioned, no browser support matrix.

| Package | State |
| --- | --- |
| `@powered-by-zocdoc/primitives` | built — theme tokens, 35 components with axe-core accessibility tests (light + dark mode) |
| `@powered-by-zocdoc/api-components` | scaffolded |

## Layout

```
packages/
  primitives/         tokens, Charm prefix configuration, the primitives to build on
  api-components/
    src/client/       the Zocdoc API client
    src/components/   the zd-* booking components
```

Two packages, split along the line that matters: `primitives` is presentation with no
knowledge of Zocdoc's API, `api-components` is everything that knows about it. The
client lives inside `api-components` because nothing else consumes it.

Each package is consumed straight from TypeScript source — every `exports` field
points at `./src/index.ts`. There is no build step and no `dist/`. Typechecking is
`tsc --noEmit` only.

## Prerequisites

**Node 24.11.0** (`.nvmrc`). **pnpm** for workspaces.

The Node version is not arbitrary. Vitest 4 peer-requires Vite ≥6, and Vite 7 calls
`crypto.hash`, which landed in Node 20.12 — on anything older the browser test
project dies at startup with `crypto.hash is not a function`. 24.11.0 also matches
Charm's own `.nvmrc`, so one `nvm use` serves both repos.

**A local Charm checkout.** Both Charm packages are consumed via pnpm `link:` paths
into `../charm-ux/core`, not from npm:

- `@charm-ux/theming@0.5.0` is unpublished — npm tops out at `0.2.0`.
- Local `@charm-ux/core` carries fixes past the published `0.5.2` tag.

The checkout must be on branch `next` and built (`pnpm build` in `charm-ux/core`).

## Getting started

```bash
nvm use                 # 24.11.0
pnpm install
pnpm typecheck
pnpm test
```

Browser tests need Chromium: `pnpm exec playwright install chromium`.

Copy `.env.local.example` to `.env.local` and add your sandbox token. `.env.local`
is gitignored. **Never commit a token.**

## Commands

| Command | Does |
| --- | --- |
| `pnpm typecheck` | `tsc --noEmit` across the workspace |
| `pnpm test` | all Vitest projects |
| `pnpm test:client` | node project — everything outside `components/` and `__tests__/` |
| `pnpm test:components` | Chromium project — `components/` and `__tests__/` |
| `pnpm storybook` | Storybook on :6006 |
| `pnpm demo` | the demo site |

## Conventions

**Tag prefix is `zd`.** Never hardcode a tag name in a template — use
`this.scope.tag('name')` with `html` from `lit/static-html.js`, so a consumer that
rescopes the project still gets working markup.

**Register Charm primitives through `dependencies()`, not barrel imports.** A
component folder's `index.js` barrel calls `registerComponent()` at import time,
which defines the element using whatever prefix is current at that moment — so an
import that lands before configuration permanently registers under `ch-`. Importing
the class module (`.../button/button.js`) and listing it in
`static override get dependencies()` defers registration to construction, when the
prefix is guaranteed set.

**PHI never leaves the machine.** No patient values in logs, thrown errors,
fixtures, stories, or tests. Use only sandbox test data.
