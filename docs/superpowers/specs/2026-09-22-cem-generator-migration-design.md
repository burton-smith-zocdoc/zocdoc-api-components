# Migrate CEM tooling: analyzer → wc-toolkit cem-generator

**Date:** 2026-09-22
**Status:** Proposed (awaiting review)
**Author:** Burton Smith (via Claude)

## Purpose

Replace `@custom-elements-manifest/analyzer` (`cem analyze`) with the standalone
[`@wc-toolkit/cem-generator`](https://cem-generator.wc-toolkit.com/) across the
`powered-by-zocdoc` monorepo. The generator is a TypeScript-type-driven manifest
producer that folds most of our current analyzer plugin chain into built-in
features, leaving a smaller config surface and a single supported toolchain.

**Success looks like:** `pnpm build`, `pnpm storybook`, the docs site (wc-dox),
and `pnpm docs:check` all produce working output with the new generator, and the
analyzer is fully removed from `package.json` and configs.

## Constraints & standards

- **Scope:** Full migration (user-selected). No analyzer left behind.
- **Delivery:** Single PR (user-selected). This deviates from GIT-001's
  "small focused PRs" guidance. **Justification:** the manifest output shape
  changes, and every consumer (Storybook, wc-dox, committed manifests) breaks
  together if landed partially; a coherent single PR keeps the stack green.
  Commits are logically staged within the one PR.
- **TS-015:** any TypeScript we touch (agent-docs entry point, config types) uses
  `as const`/`satisfies`, no `enum`, explicit return types on module boundaries.
  If `@wc-toolkit/cem-generator*` ships no types, declare the module rather than
  using `any`.
- **AI-003:** all generated changes are human-reviewed; build output and every
  downstream consumer are tested, not assumed.
- **GIT-001:** branch `BS_MigrateToWcToolkitCemGenerator`, JIRA link + reviewer
  in PR description, CI green before merge.
- No CEM/wc-toolkit/Lit-specific Zocdoc standard exists (confirmed via
  zd-standards); tooling choice is governed by this repo's own conventions.

## Current state (what we're replacing)

Three analyzer configs (root, `packages/primitives`, `packages/api-components`)
share `custom-elements.config.base.mjs`, which composes this ordered plugin
chain and a TS-program override:

| Analyzer plugin | Role |
|---|---|
| `@wc-toolkit/jsdoc-tags` | parse `@tag`/`@event`/`@slot`/`@csspart`/`@example` |
| `@wc-toolkit/cem-inheritance` | merge Charm's external `custom-elements.json` |
| `@wc-toolkit/type-parser` (+ `overrideModuleCreation`/`getTsProgram`) | resolve TS types/aliases → `expandedType` |
| `@wc-toolkit/module-path-resolver` | rewrite module paths |
| `cssPrefixPlugin` (`@charm-ux/theming`, `prefix: 'zd'`) | prefix CSS parts/props — **mutates manifest** |
| `@wc-toolkit/cem-sorter` | stable ordering |
| `agentDocsPlugin` (`tools/cem-agent-docs`, per-package only) | read finished manifest → write `.claude/skills/*/references` markdown |

**Outputs:** root `custom-elements.json` (gitignored, Storybook), plus committed
`packages/{primitives,api-components}/custom-elements.json`.

**Consumers:**
- `.storybook/preview.ts` → `setCustomElementsManifest(root manifest)`;
  `@wc-toolkit/storybook-helpers` configured with `typeRef: 'expandedType'`.
- `packages/docs/src/components/Head.astro` → `setWcDoxConfig(api-components manifest)`.
- CI `docs:check` fails on drift of committed manifests + agent-docs references.

**Scripts:** root `analyze`/`build`/`storybook`/`docs:check`; per-package `analyze`.

## Target design

### Config translation

Built-in features replace five of seven plugins. New config file per scope:
`cem-generator.config.mjs` (matching the repo's existing `.mjs` config style).

| Today | cem-generator |
|---|---|
| `jsDocTagsPlugin()` | built-in JSDoc tags |
| `cemInheritancePlugin({externalManifests})` | `inheritance: { externalManifests: [charm] }` |
| `typeParserPlugin()` + `overrideModuleCreation`/`getTsProgram` | `typeParsing: 'public'` + `tsConfigPath` / `--tsconfig` |
| `modulePathResolverPlugin({})` | built-in module paths |
| `cemSorterPlugin()` | built-in sorting |
| `litelement: true` | `litPlugin()` from `@wc-toolkit/cem-generator-lit` |
| `cssPrefixPlugin({prefix:'zd'})` | **port → cem-generator plugin** (see below) |
| `agentDocsPlugin(...)` (per-package) | **port → post-process step** (see below) |

`filePath`/`--output` replaces `outdir`. `include`/`exclude` replace
`globs`/`exclude` (EXCLUDE list unchanged). A shared base module still holds the
common pieces; per-package configs differ only in `charmManifestPath`, tsconfig,
and agent-docs target — same structure as today.

### Port 1: CSS prefix plugin (stays in-pipeline)

`cssPrefixPlugin` mutates the manifest (prefixes CSS parts/props with `zd`) and
must run before sorting. cem-generator has no built-in equivalent, so port it to
a cem-generator plugin using the generator's plugin API (annotator that walks
declarations and rewrites `cssParts`/`cssProperties` names). Lives in a small
local module (e.g. `tools/cem-css-prefix/` or alongside the config). If the
generator's plugin type isn't exported, declare it (TS-015).

**Open item to verify during implementation:** confirm the generator exposes a
mutation/annotator hook that runs before built-in sorting. If ordering isn't
controllable, fall back to applying the prefix in the same post-process pass as
agent-docs (before writing), accepting that Storybook reads the prefixed root
manifest so the prefix must be baked into the emitted file, not just post-hoc.

### Port 2: agent-docs (becomes a post-process step)

`agentDocsPlugin.packageLinkPhase` already just calls the pure
`generateAgentDocs(manifest, config, fs)`. Replace the analyzer-lifecycle wrapper
with a tiny CLI entry (`tools/cem-agent-docs/src/cli.ts`) that reads the emitted
`custom-elements.json` for a package and calls the **unchanged** render pipeline.
Per-package script becomes `cem generate ... && node tools/cem-agent-docs cli`.
The `packageLinkPhase`/`CemPlugin` shim in `plugin.ts` is removed; `generate.ts`,
`render-*.ts`, `normalize.ts`, `resolve-type.ts`, `write.ts` are untouched.

**Risk:** the render pipeline reads `expandedType` (analyzer field). cem-generator
emits `parsedType.text`. `resolve-type.ts`/`normalize.ts` must be updated to read
the new field. This is the same field-rename risk as Storybook (below).

### Consumer updates

- **Storybook:** change `setStorybookHelpersConfig({ typeRef: ... })` from
  `'expandedType'` to the generator's field (`'parsedType'`), verify controls
  still render types. Root manifest still fed via `setCustomElementsManifest`.
- **wc-dox:** re-point to the regenerated api-components manifest; verify
  `<wc-props>`/`<wc-events>`/`<wc-slots>`/`<wc-css-props>` still populate.
- **Committed manifests + agent-docs references:** regenerate; the diff is
  expected (new tool, new shape) and is the reviewable artifact. `docs:check`
  must pass (no drift) after regeneration.

### Dependency changes

- **Remove:** `@custom-elements-manifest/analyzer`, `@wc-toolkit/cem-analyzer-plugin`
  (unused bridge — user-confirmed removal), and the six standalone `@wc-toolkit/*`
  analyzer plugins now built in (`cem-inheritance`, `cem-sorter`, `jsdoc-tags`,
  `module-path-resolver`, `type-parser`) — pending confirmation each is truly
  subsumed and not imported elsewhere.
- **Add:** `@wc-toolkit/cem-generator`, `@wc-toolkit/cem-generator-cli`,
  `@wc-toolkit/cem-generator-lit`. Keep `@wc-toolkit/storybook-helpers`.
- **Note (sandbox):** npm registry is blocked in-sandbox; install runs on the
  user's side. Use `--config.verifyDepsBeforeRun=false` for `pnpm run`.

### Scripts

- Root `analyze` → `cem generate --tsconfig tsconfig.json --output custom-elements.json --include "packages/*/src/**/*.ts" --exclude ...`.
- Per-package `analyze` → `cem generate` (config discovery) `&& node ../../tools/cem-agent-docs/dist/cli.js`.
- `build`/`storybook`/`docs:check` wrappers unchanged in structure; they call the same script names.

## Testing & acceptance (AI-003)

1. `pnpm build` completes; all three manifests emit.
2. Committed manifests + `.claude/skills/*/references` regenerate; `pnpm docs:check` passes.
3. `pnpm storybook` — component controls show typed args (typeRef correct).
4. Docs site builds; wc-dox tables populate for an api-component.
5. Spot-check a manifest: CSS parts/props are `zd`-prefixed; inherited Charm
   members present; types resolved.
6. No `@custom-elements-manifest/analyzer` or `cem-analyzer-plugin` references remain.

## Risks & unknowns

1. **Field rename `expandedType` → `parsedType`** ripples to Storybook config AND
   the agent-docs render pipeline. Highest-touch risk; verified by tests 3 & 2.
2. **CSS-prefix ordering** — depends on generator hook ordering (see Port 1 open item).
3. **Manifest shape differences** beyond the type field could subtly change
   wc-dox/Storybook rendering; caught by tests 3–5.
4. **Sandbox install** — deps installed outside sandbox by user before verification.

## Out of scope

- Changing what components are documented, JSDoc tag conventions, or the
  agent-docs markdown format/output location.
- Refactoring the render pipeline beyond the `expandedType`→`parsedType` read.
- ARCH-001 stack-exception documentation (Lit is a pre-existing documented exception).
