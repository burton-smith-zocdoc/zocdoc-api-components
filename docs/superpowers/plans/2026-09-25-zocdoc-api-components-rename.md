# Zocdoc API Components Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the repository and its workspace packages to the Zocdoc API Components identity without changing component runtime behavior.

**Architecture:** Keep the existing pnpm monorepo and package dependency graph intact while replacing package identity strings at the metadata/import/configuration boundaries. Regenerate lockfile and CEM-derived agent documentation from the updated package metadata, then rename the GitHub repository and local directory after all tracked content validates.

**Tech Stack:** pnpm workspaces, TypeScript, Vite, Vitest, CEM generator, Astro/Starlight, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-09-25-zocdoc-api-components-rename-design.md`

## Global Constraints

- Public package names are `@zocdoc/api-components` and `@zocdoc/api-primitive-components`.
- The repository and local directory are `zocdoc-api-components`.
- The private workspace root package name is `zocdoc-api-components`; it remains private and is not made publishable.
- Preserve the dependency direction: `@zocdoc/api-primitive-components ← @zocdoc/api-components ← demo`.
- Do not add compatibility aliases for `@powered-by-zocdoc/*`.
- Do not manually edit `**/custom-elements.json` or `packages/*/dist/`; regenerate them with existing tooling.
- Leave historical `docs/superpowers/plans/**` and historical `docs/superpowers/specs/**` unchanged; exclude them from stale-reference searches.
- Do not include patient data, credentials, or tokens in commits, logs, test fixtures, or external repository operations.
- Work on `BS_RenamePackagesToZocdocScope`, branched from `main`, and keep each task’s changes focused.

## Review Focus

- Workspace resolution: a fresh install must resolve both renamed workspace dependencies rather than leaving stale `@powered-by-zocdoc/*` entries; pin this in Task 1 with lockfile/package metadata checks.
- Primitive-package redirect: the Vite bundle must redirect `@zocdoc/api-primitive-components` to the configure-only build, not the old package or the wrong package; pin this in Task 2 with a source/config search and bundle build.
- Generated agent docs: CEM output must use the new package names and remove stale generated pages; pin this in Task 4 with `pnpm run docs:check`.
- Public installation guidance: npm, pnpm, yarn, CSS, TypeScript, bundle, and repository links must all point at the new identities; pin this in Task 3 with a tracked-file stale-reference search.
- Repository rename consistency: the GitHub remote, local directory, Astro base path, and Pages/GitHub links must agree after the external rename; pin this in Task 6 with `git remote -v`, path, and link checks.

## File Map

### Package identity and dependency files

- Modify: `package.json` — root private workspace name.
- Modify: `packages/api-components/package.json` — API package name, primitive dependency, and CEM package argument.
- Modify: `packages/primitives/package.json` — primitive package name and CEM package argument; directory remains `packages/primitives` because it is an internal source path.
- Modify: `packages/demo/package.json` — workspace dependencies.
- Modify: `packages/docs/package.json` — workspace devDependencies.
- Regenerate: `pnpm-lock.yaml` — workspace importer/package identity entries.

### Runtime source and build configuration

- Modify: `packages/api-components/src/**/*.ts` — imports from the primitive package and any package-name strings.
- Modify: `packages/api-components/vite.config.ts` — bundle redirect for the renamed primitive package.
- Modify: `packages/demo/src/**/*.ts` and `packages/demo/vite.config.ts` — demo imports/configuration.
- Modify: `packages/docs/src/data/sample-data.ts`, `packages/docs/src/components/PreviewRuntime.astro`, and docs content under `packages/docs/src/content/docs/**/*.mdx` — package import and installation examples.
- Modify: `packages/api-components/README.md` and `packages/primitives/README.md` — package-specific usage and identity text.

### Live guidance and tooling tests

- Modify: `README.md`, `AGENTS.md`, `CONTRIBUTING.md` — project/package/repository identity and commands.
- Modify: `.agents/rules/internal/PBZD-001.md`, `.agents/rules/internal/PBZD-004.md`, `.agents/rules/internal/PBZD-005.md`, `.claude/rules/internal.md` — live package examples and dependency descriptions.
- Modify: `.claude/skills/client/SKILL.md`, `.claude/skills/create-component/SKILL.md`, `.claude/skills/api-components/SKILL.md`, `.claude/skills/primitives/SKILL.md` only where they contain live package metadata; regenerate their reference pages rather than hand-editing generated reference content.
- Modify: `tools/cem-agent-docs/src/generate.test.ts`, `tools/cem-agent-docs/src/render-index.test.ts`, and `tools/cem-agent-docs/src/render-component.test.ts` — package-name fixtures/assertions.
- Regenerate: `tools/cem-agent-docs/src/__snapshots__/render-index.test.ts.snap` and `render-component.test.ts.snap` through Vitest after fixture updates.
- Modify: `packages/docs/astro.config.mjs` — title, base path, and GitHub URL.

## Tasks

### Task 1: Rename workspace package identities and resolve dependencies

**Files:**
- Modify: `package.json:2`.
- Modify: `packages/api-components/package.json:2,23,27`.
- Modify: `packages/primitives/package.json:2,21`.
- Modify: `packages/demo/package.json:12-13`.
- Modify: `packages/docs/package.json:18-19`.
- Regenerate: `pnpm-lock.yaml`.

**Interfaces:**
- Consumes: Existing workspace package names and `workspace:*` dependency declarations.
- Produces: Workspace packages named `zocdoc-api-components`, `@zocdoc/api-components`, and `@zocdoc/api-primitive-components`, with all workspace edges resolving under the new names.

- [ ] **Step 1: Update package metadata and workspace dependency keys**

  Change the root `name` to `zocdoc-api-components`. Change `packages/api-components/package.json` to `@zocdoc/api-components`, change `packages/primitives/package.json` to `@zocdoc/api-primitive-components`, and replace the demo/docs dependency keys and API-components dependency key with the new names. Update each CEM script’s `--package` argument to match its package `name`.

- [ ] **Step 2: Regenerate the lockfile**

  Run:

  ```bash
  pnpm install --lockfile-only
  ```

  Expected: `pnpm-lock.yaml` changes only in workspace package/importer identity references needed by the metadata rename. If the sandbox blocks registry access, use the repository’s available pnpm cache/configuration or report the environment limitation rather than inventing lockfile entries.

- [ ] **Step 3: Verify workspace metadata before touching source imports**

  Run:

  ```bash
  pnpm -r list --depth -1
  pnpm pkg get name --filter .
  pnpm pkg get name --filter @zocdoc/api-components
  pnpm pkg get name --filter @zocdoc/api-primitive-components
  rg -n '@powered-by-zocdoc/(api-components|primitives)' package.json packages/*/package.json pnpm-lock.yaml
  ```

  Expected: recursive package listing contains the new names, package queries return the new names, and the final search returns no old package names in active manifests or the lockfile.

- [ ] **Step 4: Commit the package identity change**

  ```bash
  git add package.json packages/api-components/package.json packages/primitives/package.json packages/demo/package.json packages/docs/package.json pnpm-lock.yaml
  git commit -m "refactor: rename workspace packages" -m "Generated with AI" -m "Co-Authored-By: Claude Code"
  ```

### Task 2: Update source imports and package build resolution

**Files:**
- Modify: `packages/api-components/src/**/*.ts`.
- Modify: `packages/api-components/vite.config.ts:23-27`.
- Modify: `packages/demo/src/**/*.ts` and `packages/demo/src/**/*.css` where package names occur.
- Modify: `packages/demo/vite.config.ts` and `packages/docs/src/data/sample-data.ts` where package names occur.

**Interfaces:**
- Consumes: Renamed workspace package exports from Task 1.
- Produces: Source modules that import `@zocdoc/api-components` and `@zocdoc/api-primitive-components`, with the bundle redirect targeting `packages/primitives/dist/configure-only.js` for the new primitive specifier.

- [ ] **Step 1: Enumerate active source references**

  Run:

  ```bash
  rg -n '@powered-by-zocdoc/(api-components|primitives)' packages/api-components packages/demo packages/docs
  ```

  Use the result as the exact edit set. Do not change component behavior, event names, tag names, API paths, test data, or PHI-bearing values.

- [ ] **Step 2: Replace source package specifiers**

  Replace `@powered-by-zocdoc/api-components` with `@zocdoc/api-components` and `@powered-by-zocdoc/primitives` with `@zocdoc/api-primitive-components` in the files found above. Preserve subpaths such as `/mock` and `/theme/*.css` under the corresponding new package name.

- [ ] **Step 3: Update the Vite primitive redirect**

  In `packages/api-components/vite.config.ts`, change the `source ===` comparison to `@zocdoc/api-primitive-components` and retain the existing redirect to `../primitives/dist/configure-only.js`. Keep the log action-only and do not add package values or request data to logs.

- [ ] **Step 4: Build and typecheck the source boundary**

  Run:

  ```bash
  pnpm run build:types
  pnpm --filter @zocdoc/api-components run build:bundle
  pnpm --filter demo run build
  ```

  Expected: TypeScript resolves the new workspace imports and both Vite builds complete without unresolved package errors.

- [ ] **Step 5: Commit source and build updates**

  ```bash
  git add packages/api-components/src packages/api-components/vite.config.ts packages/demo/src packages/demo/vite.config.ts packages/docs/src/data/sample-data.ts
  git commit -m "refactor: update package imports" -m "Generated with AI" -m "Co-Authored-By: Claude Code"
  ```

### Task 3: Update live documentation, rules, and website identity

**Files:**
- Modify: `README.md`.
- Modify: `AGENTS.md`.
- Modify: `CONTRIBUTING.md`.
- Modify: `packages/api-components/README.md`.
- Modify: `packages/primitives/README.md`.
- Modify: `packages/docs/astro.config.mjs:6-16`.
- Modify: `packages/docs/src/content/docs/**/*.mdx`.
- Modify: `.agents/rules/internal/PBZD-001.md`, `.agents/rules/internal/PBZD-004.md`, `.agents/rules/internal/PBZD-005.md`, `.claude/rules/internal.md`.
- Modify: `.claude/skills/client/SKILL.md`, `.claude/skills/create-component/SKILL.md`, `.claude/skills/api-components/SKILL.md`, `.claude/skills/primitives/SKILL.md` for live identity references.

**Interfaces:**
- Consumes: New package names from Tasks 1–2.
- Produces: Live developer and user-facing guidance that installs/imports the new packages and links to the renamed repository/Pages site.

- [ ] **Step 1: Update package and repository prose**

  Change headings and live project references from Powered by Zocdoc/`powered-by-zocdoc` to Zocdoc API Components/`zocdoc-api-components` where they describe the current project. Update package tables and examples to use `@zocdoc/api-components` and `@zocdoc/api-primitive-components`.

- [ ] **Step 2: Update installation and import examples**

  In the docs MDX and package READMEs, update all npm/pnpm/yarn install commands, CSS subpath imports, TypeScript imports, bundle URLs, workspace filters, and `/mock` examples to the new package names. Keep browser-visible prose in DOM examples and do not add credentials or real-looking patient data.

- [ ] **Step 3: Update website/repository configuration**

  In `packages/docs/astro.config.mjs`, set the Starlight title to `Zocdoc API Components`, set `base: '/zocdoc-api-components'`, and change the GitHub link to `https://github.com/burton-smith-zocdoc/zocdoc-api-components`. Update the README live-demo URL to `https://burton-smith-zocdoc.github.io/zocdoc-api-components/`.

- [ ] **Step 4: Verify live references and historical exclusions**

  Run:

  ```bash
  rg -n 'powered-by-zocdoc|@powered-by-zocdoc' README.md AGENTS.md CONTRIBUTING.md packages .agents .claude --glob '!**/dist/**' --glob '!**/custom-elements.json' --glob '!packages/*/src/**/*.test.ts'
  ```

  Expected: no old identity remains in live guidance, source, or configuration. Do not edit the approved rename spec or historical plans/specs merely because they document the old identity.

- [ ] **Step 5: Commit live documentation updates**

  ```bash
  git add README.md AGENTS.md CONTRIBUTING.md packages/api-components/README.md packages/primitives/README.md packages/docs/astro.config.mjs packages/docs/src/content/docs .agents/rules/internal .claude/rules/internal.md .claude/skills/client/SKILL.md .claude/skills/create-component/SKILL.md .claude/skills/api-components/SKILL.md .claude/skills/primitives/SKILL.md
  git commit -m "docs: update api components identity" -m "Generated with AI" -m "Co-Authored-By: Claude Code"
  ```

### Task 4: Update CEM tooling fixtures and regenerate agent documentation

**Files:**
- Modify: `tools/cem-agent-docs/src/generate.test.ts:8,108`.
- Modify: `tools/cem-agent-docs/src/render-index.test.ts:7,58`.
- Modify: `tools/cem-agent-docs/src/render-component.test.ts:11`.
- Regenerate: `tools/cem-agent-docs/src/__snapshots__/render-index.test.ts.snap` and `render-component.test.ts.snap`.
- Regenerate: `.claude/skills/api-components/references/**`, `.claude/skills/primitives/references/**`, and package custom-element manifests through CEM tooling; do not hand-edit them.

**Interfaces:**
- Consumes: Updated `package.json` CEM package arguments and source metadata from Tasks 1–3.
- Produces: CEM tests and generated agent docs whose package metadata uses the new identities.

- [ ] **Step 1: Update CEM test package fixtures and assertions**

  Change the `AgentDocsConfig.packageName` fixture and the assertion in `generate.test.ts`, the `render-index.test.ts` config/assertion, and the `render-component.test.ts` context config to `@zocdoc/api-primitive-components`. Preserve all component API fixture behavior.

- [ ] **Step 2: Run the focused CEM tests and update snapshots**

  Run:

  ```bash
  pnpm vitest run tools/cem-agent-docs/src/generate.test.ts tools/cem-agent-docs/src/render-index.test.ts tools/cem-agent-docs/src/render-component.test.ts -u
  ```

  Expected: tests pass and only the expected package-name snapshot lines change. Review the snapshot diff for stale old package names before staging it.

- [ ] **Step 3: Regenerate CEM manifests and agent references**

  Run:

  ```bash
  pnpm run cem
  pnpm -r run cem
  ```

  Expected: generated manifests and `.claude/skills/*/references/**` reflect `@zocdoc/api-components` and `@zocdoc/api-primitive-components`. Never edit generated manifests or `dist/` by hand.

- [ ] **Step 4: Run the repository drift check**

  Run:

  ```bash
  pnpm run docs:check
  ```

  Expected: the command exits successfully with no generated-doc drift. If it reports changes, inspect that they are generated identity updates, then stage the generated references and manifests required by the repository’s normal workflow.

- [ ] **Step 5: Commit tooling and generated documentation**

  ```bash
  git add tools/cem-agent-docs/src packages/*/custom-elements.json .claude/skills/*/references
  git commit -m "test: regenerate renamed package docs" -m "Generated with AI" -m "Co-Authored-By: Claude Code"
  ```

### Task 5: Run full validation and eliminate stale live references

**Files:**
- Modify: any remaining live file found by the stale-reference search; do not modify historical plans/specs, generated `dist/`, or excluded historical records.

**Interfaces:**
- Consumes: All rename changes from Tasks 1–4.
- Produces: A validated branch with no stale old identity in active tracked content.

- [ ] **Step 1: Search all tracked active files**

  Run:

  ```bash
  git grep -n -E 'powered-by-zocdoc|@powered-by-zocdoc' -- ':!docs/superpowers/plans/**' ':!docs/superpowers/specs/**' ':!**/dist/**' ':!**/custom-elements.json'
  ```

  Expected: no output. The current rename spec is intentionally an approved historical design record under `docs/superpowers/specs/`; exclude it as part of the historical-record rule if it is still present in the result.

- [ ] **Step 2: Run formatting and lint checks**

  Run:

  ```bash
  pnpm run format:check
  pnpm run lint
  ```

  Expected: both commands pass. Fix only formatting/lint issues caused by the rename, preserving surrounding code style.

- [ ] **Step 3: Run typecheck, build, and tests**

  Run:

  ```bash
  pnpm run typecheck
  pnpm run build
  pnpm test:client
  pnpm test:components
  pnpm test
  ```

  Expected: all commands pass. Component tests must run in the configured browser project; do not replace them with node-only tests or network calls. If the sandbox blocks the configured browser binary or package registry, report the exact command and environment limitation.

- [ ] **Step 4: Inspect the final pre-rename diff**

  Run:

  ```bash
  git diff main --stat
  git diff main --check
  git status --short
  ```

  Expected: the diff contains only the package/repository identity rename, generated outputs required by the existing workflow, and the approved design/plan documents; the working tree is clean after committing any remaining fixes.

- [ ] **Step 5: Commit final validation fixes**

  ```bash
  git add -A
  git commit -m "chore: finish api components rename" -m "Generated with AI" -m "Co-Authored-By: Claude Code"
  ```

### Task 6: Rename the GitHub repository and local working directory

**Files/locations:**
- Modify external repository identity: GitHub repository `burton-smith-zocdoc/powered-by-zocdoc` → `burton-smith-zocdoc/zocdoc-api-components`.
- Modify local path: `../powered-by-zocdoc` → `../zocdoc-api-components`.
- Modify Git remote: `origin` URL to `https://github.com/burton-smith-zocdoc/zocdoc-api-components.git`.

**Interfaces:**
- Consumes: Clean, fully validated rename branch from Task 5.
- Produces: A repository whose GitHub name, local directory, remote, Astro base URL, README link, and docs link agree.

- [ ] **Step 1: Verify the precondition before external changes**

  Run:

  ```bash
  git status --porcelain
  git branch --show-current
  git remote -v
  ```

  Expected: clean working tree, branch `BS_RenamePackagesToZocdocScope`, and the old origin URL. Do not proceed if uncommitted changes or unexpected remotes are present.

- [ ] **Step 2: Rename the GitHub repository**

  Run:

  ```bash
  gh repo rename zocdoc-api-components --repo burton-smith-zocdoc/powered-by-zocdoc
  ```

  Expected: GitHub reports the repository was renamed. This is an outward-facing operation; stop and report if authentication or repository permissions are unavailable.

- [ ] **Step 3: Rename the local directory and update origin**

  From the parent directory, run:

  ```bash
  cd ..
  mv powered-by-zocdoc zocdoc-api-components
  cd zocdoc-api-components
  git remote set-url origin https://github.com/burton-smith-zocdoc/zocdoc-api-components.git
  ```

  Expected: the current working directory ends in `/zocdoc-api-components` and `origin` points at the renamed GitHub repository.

- [ ] **Step 4: Verify repository identity and links**

  Run:

  ```bash
  pwd
  git remote -v
  git status --short --branch
  git grep -n -E 'powered-by-zocdoc|@powered-by-zocdoc' -- ':!docs/superpowers/plans/**' ':!docs/superpowers/specs/**' ':!**/dist/**' ':!**/custom-elements.json' || true
  ```

  Expected: path and remote use `zocdoc-api-components`, the branch remains clean, and the only old-name matches are intentionally excluded historical records.

- [ ] **Step 5: Push the branch only if explicitly requested**

  Do not push automatically. If the user requests a remote branch, run:

  ```bash
  git push -u origin BS_RenamePackagesToZocdocScope
  ```

  Do not create a pull request or post external comments without separate user authorization.
