# CEM Agent Docs Plugin — Design

**Date:** 2026-08-09
**Status:** Draft for review

## Problem

Agents working in this repo need accurate component API reference: what tags exist, what
attributes they take, what values those attributes accept, what events they emit. Today
that lives in five hand-written skills under `.claude/skills/`. Two of them carry
generated-shaped content — `primitives/SKILL.md` has a 66-line "Component Catalog" and
`api-components/SKILL.md` has "What each component actually is". Both drift from source
the moment a component changes.

The naive fix — dump the full API into the skill — trades drift for context bloat. A
single expanded `ProviderLocation` is ~900 characters; there are 40+ components. An agent
asking "what variants does the button have?" should not pay for the booking flow's type
graph.

We already produce a complete, type-resolved Custom Elements Manifest. Today it is
consumed only by Storybook and by editor tooling that follows the `customElements` field
in `package.json`. No agent-facing surface reads it.

## Goals

- Generate per-component markdown from the CEM, so API reference cannot drift from source.
- Structure it for progressive disclosure: an agent reads an index, then one component.
- Keep hand-written knowledge hand-written. Generated files never overwrite `SKILL.md`.
- Each package gets its own isolated skill, so packages can be distributed separately.
- Make the generator reusable across packages that have different data and conventions.

## Non-Goals

- Publishing the plugin to npm. It stays a private workspace package.
- Distributing skills as a Claude Code plugin or marketplace entry. Local-only for now.
- Replacing Storybook docs. Storybook serves humans; this serves agents.
- Documenting the client layer. It has no custom elements.

## Assumption on Placement

The original request said "in the primitives package." Taken literally that would make
`api-components` depend on `primitives` for a build tool, and would ship dev tooling
inside a published package. Since the generator must serve both packages and be
extractable later, it goes in a new private workspace package instead:

```
tools/cem-agent-docs/
```

This requires adding `'./tools/*'` to `pnpm-workspace.yaml`. If you'd rather it live under
`packages/primitives/`, say so — it's a directory move, not a redesign.

## Architecture

### Per-package analyzer runs

Today one analyzer run at the repo root produces a unified 1.3 MB manifest for Storybook.
This design adds a **second analyzer config per package**, each producing a manifest scoped
to that package. The root run stays exactly as it is.

```
custom-elements.config.base.mjs                          shared plugin factory
custom-elements-manifest.config.mjs                      root — unified, Storybook only
packages/primitives/custom-elements-manifest.config.mjs
packages/api-components/custom-elements-manifest.config.mjs
```

The docs plugin is registered **only in the package configs**, never at root — otherwise
every component would generate twice. Each package config supplies one `outDir`, so there
is no path routing and no way for a component to be silently unclaimed.

This was prototyped before speccing. Per-package output is identical to the corresponding
slice of the unified manifest, on every metric:

| | modules | tags | parsedType | inherited |
|---|---|---|---|---|
| primitives, standalone | 46 | 36 | 46 | 1672 |
| primitives, unified slice | 46 | 36 | 46 | 1672 |
| api-components, standalone | 45 | 10 | 28 | 8 |
| api-components, unified slice | 45 | 10 | 28 | 8 |

Each package uses its own `tsconfig.build.json`. For `api-components` that resolves
`primitives` through `dist/*.d.ts` rather than source — the exact situation that broke
type-parser 1.3.0 — but 1.3.1 resolves through the checker from the consuming file, and the
measured output is unchanged. `analyze` takes 2.3s, so a second run is not a real cost.

Two consequences to plan around:

- **Module paths become package-relative.** `src/components/button/button.ts` rather than
  `packages/primitives/src/components/button/button.ts`. Correct for a distributable
  package, and it is what generated import examples should be built from.
- **The analyzer writes `"customElements": "custom-elements.json"` into each
  `package.json`.** Neither package sets this today. It is the field editor tooling reads,
  so this is wanted — but it is an automatic side effect worth expecting in review.

### Why keep the root run

Storybook is the only consumer of the unified view, and `preview.ts` imports the manifest
directly. Merging two manifests there is possible, but keeping the root run means Storybook
and anything else keyed on `packages/*/src/...` paths are untouched by this work.

The accepted cost is that each component is described by two artifacts that could in
principle disagree. In practice both come from the same sources and the same plugin chain
in the same CI run, and the root manifest is a gitignored build artifact — so a divergence
would be a bug in the analyzer, not drift. If that stops being true, collapsing to
per-package manifests plus an inline merge in `preview.ts` is the exit.

### The plugin

The generator runs **last** in the chain, in `packageLinkPhase`. By that point
`jsdoc-tags`, `cem-inheritance`, `type-parser`, `module-path-resolver`, `css-prefix`, and
`cem-sorter` have finished mutating the manifest, so it reads a finished artifact and
writes files. It never mutates the manifest.

Generation logic lives in a pure core, with the plugin as a thin adapter:

```ts
generateAgentDocs(manifest, config)   // pure, testable without the analyzer
agentDocsPlugin(config)               // packageLinkPhase adapter over the above
```

That split is what makes "reusable in other packages" real: an external consumer can point
the core at their own manifest without adopting our analyzer config.

### Data flow

```
cem analyze  (per package)
  → plugins mutate manifest
  → agentDocsPlugin.packageLinkPhase(manifest)
      → generateAgentDocs(manifest, config)
          → select components (has tagName, passes filter)
          → normalize (dedupe, filter private, resolve types)
          → render (default renderer, or user override)
          → write files, prune orphans
```

## Plugin API

Two hooks. Everything else is configuration.

```ts
interface AgentDocsConfig {
  /** Package name, used in generated import examples. */
  packageName: string;
  /** Where generated markdown goes. Resolved from the repo root, not the package dir,
   *  so it can point at the existing `.claude/skills/` tree. */
  outDir: string;
  /** Decide which components get a page. Default: every component with a tagName. */
  filter?: (component: Component) => boolean;
  /** Produce the files for one component. Default: the built-in renderer. */
  render?: (component: Component, ctx: RenderContext) => RenderResult | null;
}
```

Because each package runs its own analyzer, the config describes one package. There is no
`srcDir`, no routing, and no unclaimed-component case to handle.

`Component` is the CEM declaration object, unmodified — so anything a custom `@jsdoc` tag
or another plugin attached to it is reachable. That is the extension point: customization
happens by reading richer data off the component, not by adding more hooks.

```ts
interface RenderContext {
  /** The resolved config for this package. */
  config: AgentDocsConfig;
  /** Normalized, deduped, private-filtered API groups. */
  api: NormalizedApi;
  /** Apply the literal-union rule to any member. */
  resolveType(member: Member): string;
  /** Every component in this package, for cross-links and the index. */
  siblings: Component[];
  /** Full manifest. Escape hatch for anything the above doesn't cover. */
  manifest: Package;
}

interface RenderResult {
  /** Written to <outDir>/<tag>.md */
  api: string;
  /** Written to <outDir>/<tag>.styling.md — omit if the component has no styling surface. */
  styling?: string;
}
```

Returning `null` from `render` skips the component, same as `filter` rejecting it. Two
ways to say the same thing is a small wart, but `filter` runs before normalization and is
therefore cheap for the common "skip internal components" case, while `render` can decline
after seeing the resolved API.

### Why two hooks and not five

An earlier draft had separate `reference` / `styling` / `extra` / `index` / `indexRow`
callbacks. There is currently no second consumer proving where the seams belong, and
`primitives` and `api-components` are similar enough that any split chosen now is a guess.
All five are reachable by composing inside `render`. Adding a hook later is
backwards-compatible; removing one is not.

The index is generated, not hookable, for the same reason — see "Deferred" below.

## Type Resolution

`parsedType` from `@wc-toolkit/type-parser` is **not** uniformly better than `type.text`.
Measured against the current manifest (74 members carry a `parsedType`), it is better for
opaque aliases and actively worse for object types.

### The rule

> Use `parsedType` only when it is a union of string or number literals, **and**
> `type.text` is not already a literal union. Otherwise use `type.text`.

Rejection cases, in order:

| Condition | Example | Reason |
|---|---|---|
| No `parsedType`, or identical to text | `'strip' \| 'stacked'` | Nothing to gain |
| Text is already a literal union | `resize` | `parsedType` only reorders members |
| All members are `true`/`false` | `boolean` → `false \| true` | Noise, not information |
| Any non-literal member | `ProviderLocation` → `{ …900 chars }` | Context bloat |

Union splitting must be depth-aware — split on `|` only at nesting depth zero and outside
quotes, or `{ a: 'x' \| 'y' }` splits wrong.

Applied to the current manifest this selects `parsedType` for 47 members and falls back
for the rest. Spot checks of what it buys and what it dodges:

```
ZdButton.size        ZdControlSize | undefined  →  'default' | 'small' | undefined
ZdInput.type         InputTypes | undefined     →  'number' | 'date' | … | undefined
ZdProviderSearch.visitType  VisitType | undefined → 'all' | 'in_person' | 'video_visit' | undefined

ZdProviderCard.provider     keeps ProviderLocation      (rejects a ~900-char expansion)
ZdPatientForm.values        keeps Record<string, string> (rejects `{ }`)
ZdPatientForm.fieldErrors   keeps PatientFormErrors      (rejects a malformed expansion)
ZdButton.fluid              keeps boolean                (rejects `false | true`)
```

### Upstream context

`@wc-toolkit/type-parser` 1.3.1 fixed cross-module alias resolution; the repo-side
`tsconfig.json` exclude workaround that 1.3.0 needed has been removed and verified
unnecessary. Two upstream bugs remain, and the rule above routes around both rather than
depending on a fix:

- **Index signatures collapse.** `Record<string, string>` expands to `{ }` — no named
  properties to expand, so everything is lost.
- **Mapped types expand wrong.** `Partial<Record<ValidatedField, string>>` where
  `ValidatedField = 'specialty' | 'zip'` expands to
  `{ specialty: Partial<Record<ValidatedField, string>>, zip: … }` — property values
  replaced by the parent type, optionality dropped. Correct would be
  `{ specialty?: string, zip?: string }`. This affects public members
  (`ZdPatientForm.fieldErrors`), not just private ones.

Both surface as `Skipped parsing type … does not have a declaration that can be inspected`
warnings during `analyze`. They're worth reporting upstream, but nothing here blocks on it.

Note also that `parsedType` does not preserve source declaration order for aliases —
`ZdButtonVariant` comes back `'inverse' | 'primary' | …` rather than source order. Order is
deterministic across runs (verified byte-identical on repeated `analyze`), so it won't
churn diffs; it just isn't source order. Not worth fixing.

## Normalization

Three problems in the raw manifest that every renderer would otherwise re-solve:

**Attributes and properties are duplicated.** Every reflected prop appears once in
`attributes` and once in `members`. Emit one row per logical prop, showing both the
attribute name and the property name when they differ (`patient-type` / `patientType`).

**Private backing fields leak.** `ZdAlert._politeness`, `ZdTooltip._placement`. Drop
members that are `private`/`protected` or whose name starts with `_`.

**Union members repeat.** `ZdTooltip._placement` carries a literal
`PopupPlacement | undefined | undefined`. Dedupe union members and sort `undefined` last.

Inherited members are kept — `cem-inheritance` flattens the Charm chain in, and an agent
does need to know `ZdButton` has a `disabled` attribute even though `CoreButton` declares
it. They're annotated with their origin via `inheritedFrom` and rendered in a separate
section, so own API reads first.

## Output Layout

> **Superseded 2026-08-10.** The API/styling split described below was reversed after the
> first full generation run: `<tag>.styling.md` no longer exists, and the CSS surface is
> rendered onto `<tag>.md` after the callable surface. See the note at the end of this
> section.

```
.claude/skills/primitives/
  SKILL.md                     hand-written, never generated
  references/
    index.md                   generated — the catalog
    zd-button.md               generated — API and styling
    …
.claude/skills/api-components/
  SKILL.md                     hand-written
  references/
    index.md
    zd-provider-search.md
    …
```

**`index.md`** is one line per component: tag, one-sentence summary from the class
JSDoc, and grouping by category. It is the only file an agent needs to decide where to
look next. Target under 100 lines for `primitives`.

**`<tag>.md`** covers the callable surface: description, import, minimal usage example,
attributes/properties table, events, slots, methods, inherited API. Split so that the
common case — "what props does this take" — never pulls in styling.

**`<tag>.styling.md`** covers CSS parts, custom properties, and states. Written only when
the component has at least one of those.

The API/styling split matters because they're consulted in different tasks and by
different rules — styling work is governed by `STYLE-001` and the token files, which the
hand-written skill already explains.

**Amendment, 2026-08-10.** The split did not survive contact with real output. Measured
across both packages, the largest merged page is 135 lines and the median is well under
80 — small enough that the second file bought nothing. Against that, it cost a wrong guess
or a second read on every "how do I style this" question, and it forced the index to track
which styling pages existed so its links wouldn't dangle. The two-consulted-in-different-
tasks argument also assumed a boundary agents don't actually observe: a component is one
thing, and "add a variant" reads the props table and the custom properties table together.

Each component now gets exactly one page. Own API sections come first, then own CSS
sections, then a single `## Inherited` holding both kinds at `###`. `RenderResult` is gone —
the `render` hook returns `string | null` — and `renderIndex` no longer takes a
`stylingPages` set.

## Integration With Hand-Written Skills

Generated files are additive. The plugin writes only inside `references/` and never
touches `SKILL.md`.

Both hand-written skills need a one-time edit to point at the generated index and drop
the sections the generator now owns:

- `primitives/SKILL.md` — replace the "Component Catalog" section (lines ~126–192) with a
  pointer to `references/index.md`.
- `api-components/SKILL.md` — replace "What each component actually is" (lines ~36–55)
  similarly.

Everything else in those files stays. They carry knowledge the manifest does not have and
the generator must never claim to: which token file to grep, why 25 stylesheets are empty,
the `dependencies()` trap, that `ZdSelect.size` is a `number` (rows) and not the control
size the other five components take. That last one is exactly the kind of thing generated
docs get wrong by looking right — worth keeping the hand-written warning next to it.

## Build Integration

Two levels of `analyze`:

| Script | Produces | Committed? |
|---|---|---|
| `pnpm run analyze` (root) | unified `custom-elements.json` for Storybook | no, gitignored |
| `pnpm -r run analyze` (per package) | `packages/*/custom-elements.json` + agent docs | yes |

`pnpm -r` runs in topological order, so `primitives` analyzes before `api-components`.
The root `build` script runs both. `storybook` and `storybook:build` need only the root run,
so they are unchanged.

Per-package manifests are **committed**, unlike the root one. They are what a consumer gets
through the `customElements` field, and committing them keeps the docs and the manifest they
were generated from in the same reviewable diff.

Generated markdown is **committed** for the same reason: it is the artifact agents read, and
committing it is what makes the skills work on a fresh clone — and later for external
consumers.

CI freshness check: run both levels, then fail if `git diff --exit-code` reports changes
under `.claude/skills/*/references/` or `packages/*/custom-elements.json`. No new flag needed.

## Error Handling

- Component without a `tagName` → skipped silently. Base classes and mixins are expected.
- `render` throwing → fail the build, naming the component. A silently missing page is
  worse than a broken build.
- Stale files → the writer prunes any `*.md` in `outDir` not produced this run, so deleted
  or renamed components don't leave orphans. `index.md` is always produced, so it is
  always in the keep set. Pruning is confined to `outDir`, never `SKILL.md`'s directory.
- Writes are diff-suppressed: if content is byte-identical, the file isn't touched, so
  `analyze` doesn't dirty the tree on no-op runs.

## Testing

New Vitest project `tools`, node environment — the existing `client` project is scoped to
the API client and `components` is browser-only, so neither fits (`TEST-001`).

- **Type rule** — table-driven over the cases in the Type Resolution section, including
  the depth-aware union split (`{ a: 'x' | 'y' }` must not split).
- **Normalization** — attribute/property dedupe, private filtering, union dedupe, inherited
  partitioning. Driven by a small hand-written fixture manifest, not the real 1.2MB one.
- **Default renderer** — snapshot two contrasting components from the fixture: one
  primitive with variants and CSS parts, one API component with a request state machine.
- **Hooks** — a custom `filter` excludes a component; a custom `render` replaces output.
- **Pruning** — an orphaned file in `outDir` is removed; an unchanged file is not rewritten.

Real-manifest generation is verified by the CI freshness check, not by unit tests.

## Deferred

- **The api-components inheritance gap.** Every api-component extends `CharmElement`, but
  `cem-inheritance` merges nothing into them — their only `inheritedFrom` is `ZocdocError`.
  Compare `ZdButton`, which inherits 288 members from `CharmElement` alone via
  `@charm-ux/core`. Cause: `primitives` re-exports `CharmElement` from Charm
  (`index.ts:8`) rather than declaring it, so `superclass.package` points at
  `@powered-by-zocdoc/primitives` — a package whose manifest has no such declaration.
  Verified orthogonal to this work: adding the primitives manifest as an `externalManifest`
  did not fix it. Fixing it also needs `@charm-ux/core` as an explicit `api-components`
  devDependency, since it is currently linked only into `primitives`. Generated pages will
  show own API only until this is addressed, which is defensible on its own terms. **Filed
  separately; does not block.**
- **Index customization.** Generated with no hook. If a package needs a different index
  shape, that's the signal for what the third hook should be.
- **Moving skills inside their packages.** Skills stay at the repo root
  `.claude/skills/<pkg>/`, where the hand-written `SKILL.md` files already live. Claude Code
  also supports directory-scoped skills at `packages/<pkg>/.claude/skills/`, which would let
  a skill travel with its package — the natural end state once packages ship separately.
  Deferred because it relocates hand-written files for no local benefit, and only `outDir`
  changes when we do it.
- **Cross-package links.** `zd-provider-search` uses `zd-input`, but linking across skills
  assumes a shared layout that won't hold once packages ship separately.
- **npm distribution** of the plugin, and **marketplace distribution** of the skills.
  Both are packaging concerns, decidable once the output has proven useful locally.
- **Upstream bug reports** for the two `type-parser` expansion bugs.

## Open Questions

None blocking. Two calls worth confirming at review:

- **Generator placement** — `tools/cem-agent-docs/` as a private workspace package, rather
  than inside `packages/primitives/` as originally described. See "Assumption on Placement".
- **Committing per-package manifests** — they are build output, and committing build output
  is a real tradeoff. The case for it is that they ship via `customElements` and keep the
  docs reviewable next to the data they came from. The case against is diff noise on every
  component change. Gitignoring them instead costs nothing structurally; only the CI
  freshness check changes.
