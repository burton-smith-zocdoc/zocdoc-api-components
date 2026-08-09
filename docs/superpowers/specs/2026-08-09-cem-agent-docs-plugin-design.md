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

The generator is a CEM analyzer plugin that runs **last** in the chain, in
`packageLinkPhase`. By that point `jsdoc-tags`, `cem-inheritance`, `type-parser`,
`module-path-resolver`, `css-prefix`, and `cem-sorter` have all finished mutating the
manifest, so the plugin reads a finished artifact and writes files. It never mutates the
manifest.

Registration in `custom-elements-manifest.config.mjs`, after `cemSorterPlugin()`:

```js
agentDocsPlugin({
  packages: [
    { name: '@powered-by-zocdoc/primitives',     srcDir: 'packages/primitives/src',
      outDir: '.claude/skills/primitives/references' },
    { name: '@powered-by-zocdoc/api-components', srcDir: 'packages/api-components/src',
      outDir: '.claude/skills/api-components/references' },
  ],
})
```

Components are routed to a package by `module.path` prefix matching `srcDir`. A component
whose module path matches no configured package is skipped with a warning — silence here
would let a new package's docs quietly never generate.

### Data flow

```
cem analyze
  → plugins mutate manifest
  → agentDocsPlugin.packageLinkPhase(manifest)
      → for each configured package
          → select components (has tagName, passes filter)
          → normalize (dedupe, filter private, resolve types)
          → render (default renderer, or user override)
          → write files, prune orphans
```

## Plugin API

Two hooks. Everything else is configuration.

```ts
interface PackageTarget {
  /** Package name, used in generated import examples. */
  name: string;
  /** Source dir prefix used to route components to this package. */
  srcDir: string;
  /** Where generated markdown goes. */
  outDir: string;
  /** Decide which components get a page. Default: every component with a tagName. */
  filter?: (component: Component) => boolean;
  /** Produce the files for one component. Default: the built-in renderer. */
  render?: (component: Component, ctx: RenderContext) => RenderResult | null;
}
```

`Component` is the CEM declaration object, unmodified — so anything a custom `@jsdoc` tag
or another plugin attached to it is reachable. That is the extension point: customization
happens by reading richer data off the component, not by adding more hooks.

```ts
interface RenderContext {
  /** Package this component belongs to. */
  pkg: PackageTarget;
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

```
.claude/skills/primitives/
  SKILL.md                     hand-written, never generated
  references/
    index.md                   generated — the catalog
    zd-button.md               generated — API
    zd-button.styling.md       generated — CSS parts, custom properties, states
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

The plugin runs inside the existing `pnpm run analyze`, so `build`, `storybook`, and
`storybook:build` all regenerate as a side effect. No new script.

Generated markdown is **committed**. It's the artifact agents read, and committing it is
what makes the skills work for anyone who clones the repo — and, later, for external
consumers.

CI freshness check: run `pnpm run analyze` and fail if `git diff --exit-code` reports
changes under `.claude/skills/*/references/`. No new flag needed.

## Error Handling

- Component without a `tagName` → skipped silently. Base classes and mixins are expected.
- Component matching no configured package → skipped with a warning naming the module path.
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

- **Index customization.** Generated with no hook. If a package needs a different index
  shape, that's the signal for what the third hook should be.
- **Cross-package links.** `zd-provider-search` uses `zd-input`, but linking across skills
  assumes a shared layout that won't hold once packages ship separately.
- **npm distribution** of the plugin, and **marketplace distribution** of the skills.
  Both are packaging concerns, decidable once the output has proven useful locally.
- **Upstream bug reports** for the two `type-parser` expansion bugs.

## Open Questions

None blocking. The placement assumption above is the one call worth confirming.
