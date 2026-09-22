# CEM Generator Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `@custom-elements-manifest/analyzer` with `@wc-toolkit/cem-generator` across the monorepo, keeping Storybook, the committed manifests, and the agent-docs references working.

**Architecture:** Five analyzer plugins (jsdoc-tags, cem-inheritance, type-parser, module-path-resolver, cem-sorter) become built-in cem-generator features. The Lit handling becomes `litPlugin()`. Two custom pieces are ported: the `zd` CSS-prefix (an in-pipeline generator plugin, because it mutates the manifest before sorting) and the agent-docs generator (a post-process CLI that reads the emitted `custom-elements.json` and calls the existing, unchanged render pipeline). New `cem-generator.config.mjs` files replace the three `custom-elements-manifest.config.mjs` files.

**Tech Stack:** pnpm workspaces, TypeScript 5.9, Lit 3, Node 24 (native TS strip / `oxnode`), `@wc-toolkit/cem-generator` + `-cli` + `-lit`.

**Spec:** `docs/superpowers/specs/2026-09-22-cem-generator-migration-design.md`

## Global Constraints

- **Branch:** `BS_MigrateToWcToolkitCemGenerator` (already created off `origin/main`). Single PR (GIT-001 deviation justified in spec). JIRA link + reviewer in PR description.
- **TS-015:** `as const`/`satisfies` for constant objects; no `enum`; explicit return types on exported/module-boundary functions; declare the module in a `.d.ts` if `@wc-toolkit/cem-generator*` ships no types rather than using `any`.
- **AI-003:** every generated change is human-reviewed; build + all consumers tested, not assumed.
- **Sandbox:** npm registry is blocked in-sandbox. Dependency install (Task 1) runs on the **user's** machine. Use `--config.verifyDepsBeforeRun=false` when running `pnpm run <script>` in-sandbox.
- **Config file style:** `.mjs` ESM, matching the existing config style. A shared base module holds common options; per-package configs differ only in `charmManifestPath`, tsconfig, and agent-docs target.
- **CSS prefix value:** `zd`. **EXCLUDE globs (unchanged):** `['**/*.stories.ts', '**/*.test.ts', '**/*.styles.ts']`.
- **agent-docs output dirs (unchanged):** primitives → `.claude/skills/primitives/references`; api-components → `.claude/skills/api-components/references`.
- **Never mutate** the agent-docs render pipeline (`normalize.ts`, `resolve-type.ts`, `render-*.ts`, `markdown.ts`, `write.ts`) except where the emitted manifest shape genuinely requires it — those files already read `parsedType.text`.

## Review Focus

Inputs the spec implies but no task's happy-path test exercises, most-likely-to-bite first:

1. **CSS prefix must be baked into the emitted root manifest, not just applied post-hoc** — Storybook reads the root `custom-elements.json` file directly, so if the prefix runs only in the agent-docs post-process (which reads a copy), Storybook shows unprefixed `part`/`--custom-prop` names. Pinned in Task 3.
2. **agent-docs CLI given a missing/malformed manifest path** — a typo'd path or a failed `cem generate` must fail loudly, not write an empty `index.md` that prunes every real reference file. Pinned in Task 5.
3. **`typeParsing` emits an object/mapped type where the old type-parser emitted a literal union** — `resolve-type.ts` routes around known type-parser object-type bugs; the new output may trip a different path. Pinned in Task 6 (regeneration diff review).
4. **A declaration with no `tagName` (base class / mixin) in the new manifest** — `selectComponents` skips these; confirm the new manifest still marks them so they aren't documented as components. Pinned in Task 6.
5. **Inherited Charm members absent from the manifest** — if `inheritance.externalManifests` isn't wired correctly, `zd-button` loses `disabled` etc. (inherited members outnumber own ~4:1). Pinned in Task 6.

---

## Task 1: Install dependencies (user-run, outside sandbox)

**Files:**
- Modify: `package.json` (root devDependencies)

**Interfaces:**
- Produces: `@wc-toolkit/cem-generator`, `@wc-toolkit/cem-generator-cli`, `@wc-toolkit/cem-generator-lit` present in `node_modules`; the `cem generate` binary on PATH.

- [ ] **Step 1: Edit root `package.json` devDependencies**

Remove these lines:
```json
"@custom-elements-manifest/analyzer": "0.11.0",
"@wc-toolkit/cem-analyzer-plugin": "^1.0.2",
"@wc-toolkit/cem-inheritance": "^1.2.0",
"@wc-toolkit/cem-sorter": "^1.0.1",
"@wc-toolkit/jsdoc-tags": "^1.2.1",
"@wc-toolkit/module-path-resolver": "^1.0.1",
"@wc-toolkit/type-parser": "^1.3.1",
```
Add (keep `@wc-toolkit/storybook-helpers`):
```json
"@wc-toolkit/cem-generator": "^1.0.0",
"@wc-toolkit/cem-generator-cli": "^1.0.0",
"@wc-toolkit/cem-generator-lit": "^1.0.0",
```
> Version floors are placeholders — Step 2 pins whatever `pnpm add` resolves. Keep `@wc-toolkit/type-parser`'s `getTsProgram` in mind: if the generator's built-in tsconfig handling covers alias resolution (Task 2 verifies), it stays removed; if not, it goes back.

- [ ] **Step 2: Ask the user to install (sandbox cannot reach the registry)**

Tell the user to run, from the repo root, on their machine:
```bash
pnpm install
```
Wait for confirmation and an updated `pnpm-lock.yaml` before continuing. Do not attempt the install in-sandbox.

- [ ] **Step 3: Verify the binary resolves**

Run: `pnpm exec cem --help`
Expected: cem-generator CLI help listing `generate` and `init` (NOT the analyzer's `analyze`). If it still shows `analyze`, the analyzer wasn't removed from `node_modules` — re-run install.

- [ ] **Step 4: Commit**
```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: swap analyzer deps for @wc-toolkit/cem-generator"
```

---

## Task 2: Verify the generator's real API and pin config shape

**Files:**
- Create: `tools/cem-generator/PROBE_NOTES.md` (throwaway; deleted in Step 5)

**Interfaces:**
- Produces: confirmed answers to the three doc-vs-reality unknowns that every later task depends on: (a) exact config field names for output/include/exclude/inheritance/typeParsing/tsconfig, (b) the `litPlugin` import path and call, (c) the plugin object shape — which lifecycle hook mutates declarations and whether it runs before built-in sorting (decides Task 3's approach), (d) whether alias resolution needs an explicit TS program or the built-in `tsConfigPath` suffices.

> **Why this task exists:** the config/plugin details in the spec come from the tool's website, not the installed package. The generator's real exports must be confirmed before writing configs and the CSS-prefix port, or every later task risks building on wrong field names.

- [ ] **Step 1: Inspect the installed package's exports and types**

Run:
```bash
cat node_modules/@wc-toolkit/cem-generator/package.json
ls node_modules/@wc-toolkit/cem-generator/dist
cat node_modules/@wc-toolkit/cem-generator/dist/*.d.ts | head -200
cat node_modules/@wc-toolkit/cem-generator-lit/package.json
```
Record in `PROBE_NOTES.md`: the `GeneratorConfig` type fields, the `generateCem` signature, the exported plugin type (name + hook signature), and the `litPlugin` export.

- [ ] **Step 2: Confirm the plugin hook that can mutate declarations**

From the `.d.ts`, identify the hook a plugin uses to rewrite `cssParts`/`cssProperties` names, and whether built-in sorting runs after plugins. Record the exact hook name and signature. This is the input to Task 3.

- [ ] **Step 3: Confirm CLI flags**

Run: `pnpm exec cem generate --help`
Record actual flags for output, include, exclude, tsconfig, config, plugin, conflict-policy. Confirm `--tsconfig` exists (needed for alias resolution).

- [ ] **Step 4: Smoke-test a bare generate on primitives**

Run (temporary, no config):
```bash
pnpm exec cem generate --tsconfig packages/primitives/tsconfig.build.json --include "packages/primitives/src/**/*.ts" --output /tmp/probe-cem.json
```
Confirm it emits a manifest with declarations that have `tagName` and members. Record whether types appear as `parsedType.text`. If it errors on alias resolution without extra config, note that `getTsProgram`/type-parser may still be needed.

- [ ] **Step 5: Record findings, delete the probe, no commit**

Fold the confirmed field/hook names into this plan's later tasks (edit inline if they differ from the doc-derived names below). Then:
```bash
rm -rf tools/cem-generator/PROBE_NOTES.md /tmp/probe-cem.json
```
No commit — this task produces knowledge, not code. If reality differs materially from the spec, STOP and report before continuing.

---

## Task 3: Port the CSS-prefix plugin to a cem-generator plugin

**Files:**
- Create: `tools/cem-css-prefix/src/index.ts`
- Create: `tools/cem-css-prefix/src/index.test.ts`
- Create: `tools/cem-css-prefix/tsconfig.json` (copy the shape of `tools/cem-agent-docs/tsconfig.json`)

**Interfaces:**
- Consumes: the generator plugin type + mutation hook name confirmed in Task 2.
- Produces: `cssPrefixPlugin({ prefix }: { prefix: string }): <GeneratorPlugin>` — a plugin that, in the mutation hook, walks every declaration and prefixes each `cssParts[].name` and `cssProperties[].name` (custom-prop names, preserving the leading `--`) with `${prefix}-` / `--${prefix}-`, idempotently (never double-prefix an already-prefixed name).

> Replaces `cssPrefixPlugin` from `@charm-ux/theming`, which is analyzer-specific. Prefix logic mirrors the `zd` prefix that theming applied. Must run in-pipeline so the emitted root manifest (read by Storybook) carries prefixed names — see Review Focus #1.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { cssPrefixPlugin } from './index.ts';

// Minimal fake matching the hook shape confirmed in Task 2. Adjust the invocation
// to the real hook once known; the assertion on output is what matters.
const manifest = () => ({
  schemaVersion: '2.1.0',
  modules: [{
    kind: 'javascript-module', path: 'x.ts',
    declarations: [{
      kind: 'class', name: 'ZdButton', tagName: 'zd-button',
      cssParts: [{ name: 'base' }],
      cssProperties: [{ name: '--button-bg' }, { name: '--zd-already' }],
    }],
  }],
});

describe('cssPrefixPlugin', () => {
  it('prefixes css parts and custom properties with the given prefix', () => {
    const m = manifest();
    applyPlugin(cssPrefixPlugin({ prefix: 'zd' }), m); // helper invokes the real hook
    const decl = m.modules[0].declarations[0];
    expect(decl.cssParts[0].name).toBe('zd-base');
    expect(decl.cssProperties[0].name).toBe('--zd-button-bg');
  });

  it('does not double-prefix already-prefixed names', () => {
    const m = manifest();
    applyPlugin(cssPrefixPlugin({ prefix: 'zd' }), m);
    expect(m.modules[0].declarations[0].cssProperties[1].name).toBe('--zd-already');
  });
});
```
> Replace `applyPlugin` with a direct call to the real hook (from Task 2). Keep the two assertions.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tools/cem-css-prefix --project=... ` (use the node project; see Task 8 note if a project entry is needed)
Expected: FAIL — `cssPrefixPlugin` not defined.

- [ ] **Step 3: Implement the plugin**

```ts
interface Named { name: string }
interface Declaration { cssParts?: Named[]; cssProperties?: Named[] }

function prefixPart(name: string, prefix: string): string {
  return name.startsWith(`${prefix}-`) ? name : `${prefix}-${name}`;
}

function prefixCustomProp(name: string, prefix: string): string {
  // name is like `--button-bg`; produce `--zd-button-bg`, idempotently.
  if (!name.startsWith('--')) return name;
  const body = name.slice(2);
  return body.startsWith(`${prefix}-`) ? name : `--${prefix}-${body}`;
}

export function cssPrefixPlugin({ prefix }: { prefix: string }) {
  return {
    name: 'zd-css-prefix',
    // Hook name/signature from Task 2 — this is the declaration-mutation phase.
    <hook>(<params with declarations>) {
      for (const decl of <declarations>) {
        for (const part of decl.cssParts ?? []) part.name = prefixPart(part.name, prefix);
        for (const prop of decl.cssProperties ?? []) prop.name = prefixCustomProp(prop.name, prefix);
      }
    },
  };
}
```
> Fill `<hook>`/`<params>`/`<declarations>` with the exact shape from Task 2. If the generator's plugin type is exported, annotate the return `: GeneratorPlugin` (TS-015 explicit boundary type); if not, declare the module.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tools/cem-css-prefix`
Expected: PASS (both cases).

- [ ] **Step 5: Commit**
```bash
git add tools/cem-css-prefix
git commit -m "feat(tooling): port zd css-prefix to a cem-generator plugin"
```

---

## Task 4: Add a CLI entry to agent-docs that reads an emitted manifest

**Files:**
- Create: `tools/cem-agent-docs/src/cli.ts`
- Create: `tools/cem-agent-docs/src/cli.test.ts`
- Modify: `tools/cem-agent-docs/src/index.ts` (export `runCli`)
- Remove (later, in Task 7): `tools/cem-agent-docs/src/plugin.ts` + `plugin.test.ts`

**Interfaces:**
- Consumes: the existing pure `generateAgentDocs(manifest, config, fs): WriteReport` (`generate.ts:46`) and `AgentDocsConfig` (`types.ts:145`) — both unchanged.
- Produces: `runCli(argv: string[]): WriteReport` — reads a manifest JSON file, parses it, and calls `generateAgentDocs`. Signature: `runCli(argv: string[]): WriteReport`. CLI shape: `node cli.js --manifest <path> --package <name> --out <dir>`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { memoryFileSystem } from './write.ts';
import { runCli } from './cli.ts';

const MANIFEST = JSON.stringify({
  schemaVersion: '2.1.0',
  modules: [{ kind: 'javascript-module', path: 'button.ts', declarations: [
    { kind: 'class', name: 'ZdButton', tagName: 'zd-button', customElement: true },
  ]}],
});

describe('runCli', () => {
  it('reads the manifest file and writes a page per component', () => {
    const fs = memoryFileSystem({ '/tmp/cem.json': MANIFEST });
    const report = runCli(
      ['--manifest', '/tmp/cem.json', '--package', '@x/pkg', '--out', '/out'],
      fs,
    );
    expect(report.written).toContain('/out/zd-button.md');
    expect(fs.files.get('/out/index.md')).toBeTruthy();
  });

  it('throws on a missing manifest instead of writing an empty index', () => {
    const fs = memoryFileSystem({});
    expect(() => runCli(['--manifest', '/nope.json', '--package', '@x/pkg', '--out', '/out'], fs))
      .toThrow(/manifest/i);
    expect(fs.files.size).toBe(0); // nothing written — Review Focus #2
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tools/cem-agent-docs/src/cli.test.ts`
Expected: FAIL — `runCli` not defined.

- [ ] **Step 3: Implement `runCli`**

```ts
import { generateAgentDocs } from './generate.ts';
import type { Package } from './types.ts';
import { nodeFileSystem, type FileSystem, type WriteReport } from './write.ts';

function parseArgs(argv: string[]): { manifest: string; packageName: string; out: string } {
  const get = (flag: string): string => {
    const i = argv.indexOf(flag);
    if (i === -1 || i + 1 >= argv.length) throw new Error(`agent-docs: missing ${flag}`);
    return argv[i + 1];
  };
  return { manifest: get('--manifest'), packageName: get('--package'), out: get('--out') };
}

export function runCli(argv: string[], fs: FileSystem = nodeFileSystem): WriteReport {
  const { manifest, packageName, out } = parseArgs(argv);
  const raw = fs.read(manifest);
  if (raw === null) throw new Error(`agent-docs: manifest not found at "${manifest}"`);
  const parsed = JSON.parse(raw) as Package;
  return generateAgentDocs(parsed, { packageName, outDir: out }, fs);
}
```
> `generateAgentDocs`, `AgentDocsConfig`, `FileSystem`, `Package` are all unchanged. Explicit return type per TS-015.

- [ ] **Step 4: Add the executable shim at the bottom of `cli.ts`**

```ts
// Direct-run entry: `node cli.js --manifest ... --package ... --out ...`
if (import.meta.url === `file://${process.argv[1]}`) {
  const report = runCli(process.argv.slice(2));
  console.log(`agent-docs: ${report.written.length} written, ${report.pruned.length} pruned`);
}
```
> Logs counts only — never component data (PHI-001 hygiene, though this is build metadata).

- [ ] **Step 5: Export from `index.ts`**

Add: `export { runCli } from './cli.ts';`

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run tools/cem-agent-docs/src/cli.test.ts`
Expected: PASS (both cases; the missing-manifest case writes nothing).

- [ ] **Step 7: Commit**
```bash
git add tools/cem-agent-docs/src/cli.ts tools/cem-agent-docs/src/cli.test.ts tools/cem-agent-docs/src/index.ts
git commit -m "feat(cem-agent-docs): add CLI entry reading an emitted manifest"
```

---

## Task 5: Write the new cem-generator configs

**Files:**
- Create: `cem-generator.config.base.mjs`
- Create: `cem-generator.config.mjs` (root)
- Create: `packages/primitives/cem-generator.config.mjs`
- Create: `packages/api-components/cem-generator.config.mjs`
- Remove (in Task 7): the three `custom-elements-manifest.config.mjs` + `custom-elements.config.base.mjs`

**Interfaces:**
- Consumes: `cssPrefixPlugin` (Task 3), `litPlugin` (`@wc-toolkit/cem-generator-lit`), confirmed config field names (Task 2).
- Produces: three working configs discoverable by `cem generate`.

> Field names below are doc-derived; reconcile with Task 2 findings before writing. agent-docs is NOT a plugin here — it runs as a post-process step (Task 6 scripts).

- [ ] **Step 1: Write the base module**

```js
// cem-generator.config.base.mjs
import fs from 'node:fs';
import { litPlugin } from '@wc-toolkit/cem-generator-lit';
import { cssPrefixPlugin } from './tools/cem-css-prefix/src/index.ts';

export const EXCLUDE = ['**/*.stories.ts', '**/*.test.ts', '**/*.styles.ts'];

/** Options shared by every run. `charmManifestPath` and `tsConfigPath` differ per scope. */
export function sharedConfig({ charmManifestPath, tsConfigPath, include }) {
  const charmManifest = JSON.parse(fs.readFileSync(charmManifestPath, 'utf-8'));
  return {
    include,
    exclude: EXCLUDE,
    tsConfigPath,
    typeParsing: 'public',
    inheritance: { externalManifests: [charmManifest] },
    // cssPrefix runs before built-in sorting so the emitted manifest carries prefixed names.
    plugins: [litPlugin(), cssPrefixPlugin({ prefix: 'zd' })],
  };
}
```
> If Task 2 shows `cssPrefixPlugin` must be ordered explicitly vs. sorting, set the option that controls it. If the base import of a `.ts` plugin from an `.mjs` config triggers Node type-stripping errors (as the old configs hit for agent-docs), import from a built `dist/` path instead and add a build step — mirror whatever Task 3's build produces.

- [ ] **Step 2: Write the root config**

```js
// cem-generator.config.mjs
import { sharedConfig } from './cem-generator.config.base.mjs';

// Unified manifest consumed by Storybook. No agent-docs here (root covers both packages).
export default {
  ...sharedConfig({
    charmManifestPath: 'packages/primitives/node_modules/@charm-ux/core/custom-elements.json',
    tsConfigPath: 'tsconfig.json',
    include: ['packages/*/src/**/*.ts'],
  }),
  filePath: 'custom-elements.json',
};
```

- [ ] **Step 3: Write the primitives config**

```js
// packages/primitives/cem-generator.config.mjs
import { sharedConfig } from '../../cem-generator.config.base.mjs';

export default {
  ...sharedConfig({
    charmManifestPath: 'node_modules/@charm-ux/core/custom-elements.json',
    tsConfigPath: 'tsconfig.build.json',
    include: ['src/**/*.ts'],
  }),
  filePath: 'custom-elements.json',
};
```

- [ ] **Step 4: Write the api-components config**

```js
// packages/api-components/cem-generator.config.mjs
import { sharedConfig } from '../../cem-generator.config.base.mjs';

export default {
  ...sharedConfig({
    charmManifestPath: '../primitives/node_modules/@charm-ux/core/custom-elements.json',
    tsConfigPath: 'tsconfig.build.json',
    include: ['src/**/*.ts'],
  }),
  filePath: 'custom-elements.json',
};
```

- [ ] **Step 5: Smoke-test each config discovers and generates**

Run:
```bash
pnpm exec cem generate --config cem-generator.config.mjs
pnpm --filter @powered-by-zocdoc/primitives exec cem generate
pnpm --filter @powered-by-zocdoc/api-components exec cem generate
```
Expected: three `custom-elements.json` files emit without error. (Don't commit the generated JSON yet — Task 6 regenerates and reviews.)

- [ ] **Step 6: Commit the configs**
```bash
git add cem-generator.config.base.mjs cem-generator.config.mjs packages/*/cem-generator.config.mjs
git commit -m "feat(tooling): add cem-generator configs (root + per-package)"
```

---

## Task 6: Wire scripts, regenerate, and verify no drift

**Files:**
- Modify: `package.json` (root scripts)
- Modify: `packages/primitives/package.json` (analyze script)
- Modify: `packages/api-components/package.json` (analyze script)
- Regenerate: root (gitignored) + `packages/*/custom-elements.json` + `.claude/skills/*/references/*.md`

**Interfaces:**
- Consumes: configs (Task 5), `runCli` via `tools/cem-agent-docs/src/cli.ts` (Task 4).

- [ ] **Step 1: Update the root `analyze` + wrapper scripts**

In root `package.json`:
```json
"analyze": "cem generate --config cem-generator.config.mjs",
```
Leave `build`, `storybook`, `storybook:build`, `docs:check` structurally as-is — they call `pnpm run analyze` and `pnpm -r run analyze`, which still work. Confirm `docs:check`'s `git status --porcelain` paths (`.claude/skills/*/references packages/*/custom-elements.json`) are unchanged.

- [ ] **Step 2: Update each package's `analyze` to generate then build docs**

primitives `package.json`:
```json
"analyze": "cem generate && oxnode ../../tools/cem-agent-docs/src/cli.ts --manifest custom-elements.json --package @powered-by-zocdoc/primitives --out ../../.claude/skills/primitives/references"
```
api-components `package.json`:
```json
"analyze": "cem generate && oxnode ../../tools/cem-agent-docs/src/cli.ts --manifest custom-elements.json --package @powered-by-zocdoc/api-components --out ../../.claude/skills/api-components/references"
```
> `oxnode` (already a devDep, used by `build:theme`) runs the `.ts` CLI directly. If `oxnode` isn't resolvable from the package cwd, use `pnpm exec oxnode`.

- [ ] **Step 3: Regenerate everything**

Run:
```bash
pnpm run build:types
pnpm run analyze && pnpm -r run analyze
```
Expected: root + both package manifests emit; `.claude/skills/*/references/*.md` written.

- [ ] **Step 4: Review the regenerated diff (Review Focus #3, #4, #5)**

Run: `git status --porcelain -- .claude/skills packages/*/custom-elements.json` then `git diff -- packages/primitives/custom-elements.json | head -100`
Check by eye:
- **#5 inheritance:** `zd-button` (and peers) still list inherited Charm members (`disabled`, etc.). If empty, `inheritance.externalManifests` is misconfigured — fix Task 5.
- **#4 base classes:** declarations without `tagName` did not get a `.md` page.
- **#3 types:** spot-check a component with a union/object prop — types read sanely (no `{ }` collapse, no wrong literals). If `resolve-type.ts`'s rule mishandles the new `parsedType` shape, note it; only then touch `resolve-type.ts`.
This diff is expected and is the reviewable artifact. Human review here per AI-003.

- [ ] **Step 5: Confirm `docs:check` passes after committing generated output**

Run:
```bash
git add packages/*/custom-elements.json .claude/skills/*/references
git commit -m "chore: regenerate manifests and agent-docs via cem-generator"
pnpm run docs:check
```
Expected: exit 0 (no drift — a second generation produces byte-identical output; `writeDocs` skips unchanged files).

- [ ] **Step 6: Commit the script changes**
```bash
git add package.json packages/*/package.json
git commit -m "feat(tooling): run cem generate + agent-docs cli in analyze scripts"
```

---

## Task 7: Remove the analyzer configs and the plugin shim

**Files:**
- Remove: `custom-elements.config.base.mjs`, `custom-elements-manifest.config.mjs`, `packages/primitives/custom-elements-manifest.config.mjs`, `packages/api-components/custom-elements-manifest.config.mjs`
- Remove: `tools/cem-agent-docs/src/plugin.ts`, `tools/cem-agent-docs/src/plugin.test.ts`
- Modify: `tools/cem-agent-docs/src/index.ts` (drop `agentDocsPlugin`/`CemPlugin` export)

**Interfaces:**
- Consumes: nothing new. This is deletion + export cleanup.

- [ ] **Step 1: Confirm nothing still imports the removed modules**

Run:
```bash
git grep -n "custom-elements.config.base\|custom-elements-manifest.config\|agentDocsPlugin\|packageLinkPhase\|CemPlugin"
```
Expected: only hits inside the files being deleted. If anything else references them, resolve it first.

- [ ] **Step 2: Delete the analyzer configs and the plugin shim**

Run:
```bash
git rm custom-elements.config.base.mjs custom-elements-manifest.config.mjs \
  packages/primitives/custom-elements-manifest.config.mjs \
  packages/api-components/custom-elements-manifest.config.mjs \
  tools/cem-agent-docs/src/plugin.ts tools/cem-agent-docs/src/plugin.test.ts
```

- [ ] **Step 3: Drop the plugin export from `index.ts`**

Remove the line:
```ts
export { agentDocsPlugin, type CemPlugin } from './plugin.ts';
```

- [ ] **Step 4: Run the agent-docs test suite**

Run: `pnpm vitest run tools/cem-agent-docs`
Expected: PASS — remaining tests (generate, normalize, render-*, resolve-type, write, cli) are green; no reference to the deleted plugin.

- [ ] **Step 5: Commit**
```bash
git add -A tools/cem-agent-docs/src/index.ts
git commit -m "chore: remove analyzer configs and agent-docs plugin shim"
```

---

## Task 8: Update Storybook and run the full verification

**Files:**
- Modify: `.storybook/preview.ts:23`

**Interfaces:**
- Consumes: the regenerated root manifest and the confirmed generator type field (`parsedType`, per Task 2).

- [ ] **Step 1: Update the storybook-helpers typeRef**

In `.storybook/preview.ts`, change:
```ts
setStorybookHelpersConfig({ typeRef: 'expandedType' });
```
to:
```ts
setStorybookHelpersConfig({ typeRef: 'parsedType' });
```
> `parsedType` is cem-generator's field; `expandedType` was the analyzer's type-parser field. Confirm the exact string against Task 2 / storybook-helpers' expected key.

- [ ] **Step 2: Full build**

Run: `pnpm run build`
Expected: `build:types`, `build:theme`, root `analyze`, and per-package `analyze` all succeed.

- [ ] **Step 3: Storybook smoke test**

Run: `pnpm run storybook` (or `storybook:build` for a headless check)
Expected: it starts; open a component (e.g. `zd-button`) and confirm the Controls panel shows typed args (enum/union props render as selects, not raw strings). If types are missing, `typeRef` is wrong — reconcile with Task 2.

- [ ] **Step 4: Full test + lint + docs:check**

Run:
```bash
pnpm run test
pnpm run lint
pnpm run docs:check
```
Expected: all green; `docs:check` reports no drift.

- [ ] **Step 5: Final grep — no analyzer references remain**

Run:
```bash
git grep -n "custom-elements-manifest/analyzer\|cem-analyzer-plugin\|cem analyze\|expandedType\|@wc-toolkit/type-parser\|@wc-toolkit/cem-inheritance\|@wc-toolkit/cem-sorter\|@wc-toolkit/jsdoc-tags\|@wc-toolkit/module-path-resolver"
```
Expected: no hits outside historical `docs/superpowers/` spec/plan files.

- [ ] **Step 6: Commit**
```bash
git add .storybook/preview.ts
git commit -m "feat(storybook): point storybook-helpers at cem-generator parsedType"
```

---

## Done criteria

- `pnpm run build`, `pnpm run test`, `pnpm run lint`, `pnpm run docs:check`, and `pnpm run storybook` all succeed.
- No `@custom-elements-manifest/analyzer` or `@wc-toolkit/cem-analyzer-plugin` references anywhere but historical spec/plan docs.
- Committed `packages/*/custom-elements.json` and `.claude/skills/*/references` reflect cem-generator output; a re-run produces no drift.
- CSS parts/props in the manifest are `zd`-prefixed; inherited Charm members present; types resolved.
- PR description: JIRA link, reviewer tagged, single-PR-deviation note, and the AI-003 review confirmation.
