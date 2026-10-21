---
name: zocdoc-web-components
description: Use when an app depends on @zocdoc/api-components or @zocdoc/api-primitive-components and you are adding, configuring, styling, typing, or testing zd-* elements (zd-booking, zd-provider-search, zd-button, and the rest), configureZocdoc or getToken auth, the React wrappers, or the mock transport. Not for working inside the zocdoc-api-components repository itself.
---

# Zocdoc Web Components

## Overview

Both packages ship their own docs for agents in `agent-docs/`, built for the exact version
installed. Read those instead of answering from memory or reverse-engineering `dist/`: the
API changes between versions, and this skill deliberately states none of it.

## Find the docs

1. Locate each installed package, its version, and its docs. Run this skill's script from the
   app (in a monorepo, from the workspace that depends on the packages):

   ```bash
   node <this-skill-dir>/scripts/locate.mjs
   ```

2. Read each package's `docs` path it prints, `<dir>/agent-docs/index.md`. It lists every
   guide and component with a one-line summary.

3. Open only the pages the task needs:

   | Task | Page |
   |---|---|
   | First integration, script tag or bundler | `guides/getting-started/installation.md`, then `quick-start.md` |
   | Tokens, `getToken`, sandbox vs production | `guides/getting-started/authentication.md` |
   | One `zd-booking` vs wiring components yourself | `guides/composed-vs-single.md` |
   | React, Vue, Svelte, JSX types | `guides/frameworks.md` |
   | Tests, demos, no-network development | `guides/testing.md` |
   | Calling endpoints or handling errors directly | `guides/client/*.md` |
   | A component's usage, events, and payloads | `components/<name>.md` |
   | Every attribute, property, slot, CSS part | `reference/<tag>.md` |
   | Brand colours, fonts, dark mode, `--zd-*` tokens, `::part()` | `guides/theming.md`; every token is in the primitives package's `TOKENS.md` |
   | Layout tags, primitives | `@zocdoc/api-primitive-components` → `agent-docs/index.md` |

   Paths are relative to `@zocdoc/api-components/agent-docs/` unless the row names the
   primitives package.

## When there is no `agent-docs/`

Versions published before it shipped have none. Use, in order:

1. The package `README.md`.
2. `custom-elements.json`, queried rather than read whole (it runs past 1MB):

   ```bash
   jq '.modules[].declarations[]? | select(.tagName == "zd-booking")
       | {attributes, events, slots, members: [.members[]? | select(.privacy != "private") | .name]}' \
     "<dir>/custom-elements.json"
   ```

3. The `.d.ts` file for the one export you need, found through the `exports` map in
   `package.json`.

Tell the user the installed version predates `agent-docs/`, so they can weigh upgrading.

## Checks before you finish

- Every import path you wrote appears in the package's `exports` map.
- Every `zd-*` attribute, event, and payload field you used appears on that component's
  page — not inferred from a similarly named one.
- Anything the docs didn't settle is reported to the user as a guess, with what you chose.

## Common mistakes

| Mistake | Fix |
|---|---|
| Writing code from memory of a previous version | Read the installed version's `agent-docs/` first |
| Reading `dist/*.js` or the whole `custom-elements.json` to learn the API | Use `agent-docs/`; for older versions query the manifest with `jq` |
| Reading only `reference/<tag>.md` | It lists the API but not the usage rules; read `components/<name>.md` and the guides too |
| Using the hosted docs site | It documents the latest release, which may not be the installed one |
