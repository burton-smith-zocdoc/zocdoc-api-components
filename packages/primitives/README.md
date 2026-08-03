# @powered-by-zocdoc/primitives

The presentation layer everything else builds on: design tokens, Charm
configuration, and the Charm primitives the booking components compose.

Importing this package is what sets the `zd` prefix. Anything that touches Charm
should depend on it.

## Status

Built. 3 token tests (node) and 4 prefix tests (Chromium).

## What's in it

| File | Responsibility |
| --- | --- |
| `configure.ts` | sets the `zd` tag and token prefix — side effects only |
| `tokens.ts` | the token definition and generated CSS |
| `charm.ts` | Charm primitive classes, re-exported for `dependencies()` |
| `index.ts` | runs `configure.ts` first, then re-exports the above |

## Tokens

```ts
import { zocdocThemeCss } from '@powered-by-zocdoc/primitives';
```

`zocdocThemeCss` is a plain CSS string — inject it once at the document level via a
`<style>` tag, a constructed stylesheet, or your bundler. Components read the
variables; they do not import the CSS themselves.

Five base colors expand into full 50–950 palettes: 220 `--zd-` custom properties,
about 8.5 KB.

| Export | What it is |
| --- | --- |
| `zocdocThemeCss` | the generated CSS, as a string |
| `zocdocTheme` | the full result — also carries `cssReset`, `cssUtilities`, `tokensJson` |
| `zocdocTokenDefinition` | the resolved token definition, for tooling |

**The palette is a placeholder.** These are not real Zocdoc brand values; they exist
so components render coherently during the proof of concept. Replacing them is a
single-file change — the `primitives.color` block in `tokens.ts`.

`generateThemeSync` is used rather than `generateTheme` because the latter is async
and writes files; this package needs a string at module scope.

## Prefix configuration

Charm defaults to `ch`. `configure.ts` sets it to `zd`:

```ts
project.updateProject({ prefix: 'zd', tokenPrefix: 'zd' });
```

`prefix` controls tag names (`zd-button`), `tokenPrefix` controls CSS custom
properties (`--zd-color-primary`). They are set independently and nothing enforces
that they match the token prefix in `tokens.ts` — keep them in sync by hand.

## Why ordering matters, and why there are no barrel imports

`registerComponent()` computes the tag name from the prefix **at call time** and
immediately calls `customElements.define()`. Custom elements cannot be
unregistered, and `updateProject()` does not re-register anything already defined.
A Charm component registered before configuration runs is permanently `ch-`prefixed,
with no runtime repair.

A component folder's `index.js` **barrel** calls `registerComponent()` as an import
side effect — so importing one is exactly the hazard above. This package therefore
imports no barrels. `charm.ts` re-exports the **class modules**, which register
nothing:

```ts
import { button, input } from '@powered-by-zocdoc/primitives';

class MyThing extends CharmElement {
  public static override baseName = 'my-thing';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [button, input];
  }
}
```

The `CharmElement` constructor registers everything in `dependencies()` — at
construction time, long after the prefix is set. Ordering stops being something you
have to get right.

`src/__tests__/prefix.browser.test.ts` guards this in a real browser, including an
assertion that importing a class module registers nothing until a host is
constructed.

The one remaining ordering rule: **`import './configure.js'` must stay first in
`index.ts`.** Do not reorder it and do not let a formatter sort it.
