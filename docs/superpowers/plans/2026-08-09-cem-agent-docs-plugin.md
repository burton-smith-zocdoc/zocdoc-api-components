# CEM Agent Docs Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate per-component markdown reference from the Custom Elements Manifest, written into each package's skill `references/` directory, so agent-facing API docs cannot drift from source.

**Architecture:** A pure core (`generateAgentDocs(manifest, config)`) does selection, normalization, rendering, and writing. A thin CEM-analyzer adapter (`agentDocsPlugin(config)`) calls it from `packageLinkPhase`, last in the plugin chain, so it reads a finished manifest and never mutates it. Each package gets its own analyzer config that registers the plugin once with a single `outDir`; the existing root analyzer run is untouched and keeps serving Storybook.

**Tech Stack:** TypeScript (run directly by Node 24 type stripping — no build step), `@custom-elements-manifest/analyzer` 0.11.0, `@wc-toolkit/*` plugin suite, Vitest 4, pnpm workspaces.

## Global Constraints

- **Type resolution rule (verbatim from spec):** "Use `parsedType` only when it is a union of string or number literals, **and** `type.text` is not already a literal union. Otherwise use `type.text`."
- Union splitting must be depth-aware — split on `|` only at nesting depth zero and outside quotes, or `{ a: 'x' | 'y' }` splits wrong.
- The plugin runs **last** in `packageLinkPhase` and **never mutates the manifest**.
- The docs plugin is registered **only in the package configs, never at root** — otherwise every component generates twice.
- The plugin writes only inside `outDir` and **never touches `SKILL.md`**.
- Component without a `tagName` → skipped silently.
- `render` throwing → fail the build, naming the component.
- Stale files → prune any `*.md` in `outDir` not produced this run. `index.md` is always produced, so it is always in the keep set. Pruning is confined to `outDir`.
- Writes are diff-suppressed: byte-identical content must not touch the file, so `analyze` doesn't dirty the tree on no-op runs.
- Inherited members are **kept**, annotated with their origin, and rendered in a separate section so own API reads first.
- Private filtering: drop members that are `private`/`protected`, `static`, or whose name starts with `_`.
- **No new npm dependencies.** The Zocdoc sandbox blocks the registry (HTTP 567), so `pnpm install` cannot run. Every task below uses only what is already in `node_modules`.
- **No `enum`, `namespace`, or parameter properties** anywhere in `tools/` — Node's type stripper rejects them. All relative imports inside `tools/` must carry an explicit `.ts` extension.
- Node ≥ 24 (verified v24.11.0). Type stripping is on by default.
- Test data, if any is ever needed, comes only from `https://api-docs.zocdoc.com/guides/testing-data` (PHI-002/TEST-003). No PHI in logs or error messages (PHI-001) — generator errors name components and files, never data values.

### Verified facts this plan depends on

These were measured against the repo before writing. Do not re-litigate them.

| Fact | Evidence |
|---|---|
| `.mjs` importing a **relative** `.ts` path works under Node 24 | prints `hi relative` |
| `.mjs` importing a `.ts` file **through `node_modules`** hard-fails | `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` |
| ⇒ configs must import the tool by **relative path**, not package name | follows from the two above |
| `cem` binary resolves from a package script; CWD is the package dir | `pnpm --filter primitives run <probe>` printed `.../packages/primitives` |
| Public inherited API per tag is small | median 9, max 59 (`zd-input`); 46 tags total |
| Most useful API is inherited | own public attrs 64 vs inherited 286 across all tags |
| No `enum` or `namespace` anywhere in `packages/*/src`, `scripts`, `.storybook` | grep returned nothing — so adding `erasableSyntaxOnly` to the root tsconfig is safe for existing sources |
| TypeScript is 5.9.3 | `erasableSyntaxOnly` needs ≥ 5.8 |
| `pnpm exec <bin>` triggers a dependency check that tries to install and fails | use `./node_modules/.bin/<bin>` directly, or `pnpm --config.verifyDepsBeforeRun=false run <script>` |

### Deliberate amendments to the spec

Three details in the spec are wrong or unbuildable as written. Implement the amended version.

1. **`outDir` resolution.** Spec: "Resolved from the repo root, not the package dir." The analyzer runs with CWD = package dir, so `outDir` is resolved **relative to the analyzer's working directory (the package root)**. Package configs therefore pass `../../.claude/skills/<pkg>/references`.
2. **Index grouping.** Spec: "grouping by category." Nothing in the manifest carries a category, and inventing a taxonomy the generator cannot know is worse than no taxonomy. `index.md` is a **flat, tag-sorted list**, one line per component. 46 tags → 46 lines, inside the "under 100 lines" target.
3. **`resolveType` parameter type.** Spec types it `(member: Member) => string`. Attributes and events need it too, so it is typed `(typed: Typed) => string` where `Typed` is `{ type?: TypeRef; parsedType?: TypeRef }`. `Member`, `Attribute`, and `EventDoc` all satisfy it.
4. **No `pnpm-workspace.yaml` entry.** Spec: "This requires adding `'./tools/*'` to `pnpm-workspace.yaml`." Do **not**. Making it a workspace package is what would let a config import it by name, and that path is broken (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`, table above). It also needs a `pnpm install`, which the sandbox cannot run. `tools/` is a plain directory; the nearest `package.json` is the root one, which already declares `"type": "module"`, so the tool needs no `package.json` of its own.

## File Structure

```
tools/cem-agent-docs/
  tsconfig.json                     extends base; allowImportingTsExtensions + erasableSyntaxOnly
  src/
    types.ts                        CEM shapes, normalized shapes, config/context/result
    resolve-type.ts                 depth-aware union split, literal-union rule
    normalize.ts                    attr/prop dedupe, private filtering, own vs inherited
    render-component.ts             <tag>.md — the callable surface
    render-styling.ts               <tag>.styling.md — CSS parts, properties, states
    render-index.ts                 index.md — the catalog
    render.ts                       defaultRender, composing the two page renderers
    write.ts                        FileSystem port, diff-suppressed writes, pruning
    generate.ts                     generateAgentDocs — selection, orchestration
    plugin.ts                       agentDocsPlugin — packageLinkPhase adapter
    index.ts                        public exports
    test/fixtures.ts                hand-written fixture manifest
    *.test.ts                       co-located, one per module

custom-elements.config.base.mjs                            shared plugin factory (new)
custom-elements-manifest.config.mjs                        root — rewired to the factory
packages/primitives/custom-elements-manifest.config.mjs    new
packages/api-components/custom-elements-manifest.config.mjs new
vitest.config.ts                                           + third `tools` project
tsconfig.json                                              + tools/ in include
.gitignore                                                 un-ignore per-package manifests
```

Each `src/` module has one responsibility and is importable on its own. `generate.ts` takes an injectable `FileSystem` so every test runs in memory — no temp dirs, no cleanup.

---

### Task 1: Scaffold, types, and type resolution

**Files:**
- Create: `tools/cem-agent-docs/tsconfig.json`
- Create: `tools/cem-agent-docs/src/types.ts`
- Create: `tools/cem-agent-docs/src/resolve-type.ts`
- Test: `tools/cem-agent-docs/src/resolve-type.test.ts`
- Modify: `vitest.config.ts` (add a third project)
- Modify: `tsconfig.json` (root — add `tools/` to `include`)

**Interfaces:**
- Consumes: nothing.
- Produces: every type in `types.ts` (used by all later tasks); `splitUnion(text: string): string[]`; `isLiteralUnion(text: string): boolean`; `normalizeUnion(text: string): string`; `resolveType(typed: Typed): string`.

**Why a third Vitest project:** the `client` project is a deliberate catch-all but is scoped to `packages/*/src/**/*.test.ts`, so nothing under `tools/` is collected by either existing project — the tests would silently not run (TEST-001).

- [ ] **Step 1: Create the tsconfig and wire up the toolchain**

`tools/cem-agent-docs/tsconfig.json`:

```json
{
  // Node runs these files directly via type stripping — there is no emit and no build step
  // before `analyze`. `allowImportingTsExtensions` is what lets the source write the explicit
  // `./foo.ts` specifiers that Node's ESM resolver requires, and `erasableSyntaxOnly` makes
  // `tsc` reject the syntax the stripper cannot handle (enum, namespace, parameter properties)
  // instead of letting it fail at analyze time.
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

Root `tsconfig.json` — add `tools/` and the two options, so `pnpm typecheck` covers the tool. The package `tsconfig.build.json` files do not include `tools/`, so their `noEmit: false` is unaffected:

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true
  },
  "include": [
    "packages/*/src/**/*.ts",
    "scripts/**/*.ts",
    ".storybook/**/*.ts",
    "tools/*/src/**/*.ts"
  ]
}
```

`vitest.config.ts` — add a third project after the `components` project, inside the `projects` array:

```ts
      {
        test: {
          clearMocks,
          /**
           * Build tooling under `tools/`. Needs its own project because `client` — the
           * catch-all — is scoped to `packages/*`, so without this these tests are collected
           * by nothing and pass vacuously.
           */
          name: 'tools',
          environment: 'node',
          include: ['tools/*/src/**/*.test.ts'],
        },
      },
```

- [ ] **Step 2: Write `types.ts`**

```ts
/**
 * The slice of the Custom Elements Manifest schema this generator reads, plus the shapes
 * `@wc-toolkit` plugins add to it (`parsedType`, `modulePath`, `inheritedFrom`).
 *
 * `Component` keeps an index signature on purpose: a custom `@jsdoc` tag or another plugin
 * may have attached anything, and a custom `render` must be able to reach it. That is the
 * extension point — customization reads richer data off the component rather than adding
 * more hooks.
 */

export interface TypeRef {
  text: string;
}

/** Anything carrying a type the literal-union rule can be applied to. */
export interface Typed {
  type?: TypeRef;
  parsedType?: TypeRef;
}

export interface InheritedFrom {
  name: string;
  module?: string;
  package?: string;
}

export interface Named {
  name: string;
  description?: string;
  inheritedFrom?: InheritedFrom;
}

export interface Attribute extends Named, Typed {
  default?: string;
  fieldName?: string;
}

export interface Parameter extends Typed {
  name: string;
  optional?: boolean;
  description?: string;
}

export interface Member extends Named, Typed {
  kind: 'field' | 'method';
  privacy?: 'public' | 'private' | 'protected';
  static?: boolean;
  readonly?: boolean;
  default?: string;
  parameters?: Parameter[];
  return?: { type?: TypeRef };
}

export interface EventDoc extends Named, Typed {}

export interface CssProperty extends Named {
  syntax?: string;
  default?: string;
}

export interface Component {
  kind: string;
  name: string;
  tagName?: string;
  customElement?: boolean;
  description?: string;
  summary?: string;
  modulePath?: string;
  superclass?: { name: string; package?: string; module?: string };
  attributes?: Attribute[];
  members?: Member[];
  events?: EventDoc[];
  slots?: Named[];
  cssParts?: Named[];
  cssStates?: Named[];
  cssProperties?: CssProperty[];
  [key: string]: unknown;
}

export interface Module {
  kind: string;
  path: string;
  declarations?: Component[];
}

export interface Package {
  schemaVersion: string;
  modules: Module[];
}

/** One logical prop — the attribute and the property collapsed into a single row. */
export interface PropRow {
  attribute?: string;
  property?: string;
  type: string;
  default?: string;
  description?: string;
  readonly?: boolean;
  inheritedFrom?: string;
}

export interface MethodRow {
  name: string;
  signature: string;
  description?: string;
  inheritedFrom?: string;
}

export interface EventRow {
  name: string;
  type: string;
  description?: string;
  inheritedFrom?: string;
}

export interface SlotRow {
  name: string;
  description?: string;
  inheritedFrom?: string;
}

export interface CssPropRow {
  name: string;
  syntax?: string;
  default?: string;
  description?: string;
  inheritedFrom?: string;
}

export interface ApiGroups {
  props: PropRow[];
  methods: MethodRow[];
  events: EventRow[];
  slots: SlotRow[];
  cssParts: SlotRow[];
  cssStates: SlotRow[];
  cssProperties: CssPropRow[];
}

export interface NormalizedApi {
  own: ApiGroups;
  inherited: ApiGroups;
}

export interface AgentDocsConfig {
  /** Package name, used in generated import examples. */
  packageName: string;
  /** Where generated markdown goes, resolved relative to the analyzer's working directory. */
  outDir: string;
  /** Decide which components get a page. Default: every component with a tagName. */
  filter?: (component: Component) => boolean;
  /** Produce the files for one component. Default: the built-in renderer. */
  render?: (component: Component, ctx: RenderContext) => RenderResult | null;
}

export interface RenderContext {
  /** The resolved config for this package. */
  config: AgentDocsConfig;
  /** Normalized, deduped, private-filtered API groups. */
  api: NormalizedApi;
  /** Apply the literal-union rule to any typed member. */
  resolveType: (typed: Typed) => string;
  /** Every component in this package, for cross-links and the index. */
  siblings: Component[];
  /** Full manifest. Escape hatch for anything the above doesn't cover. */
  manifest: Package;
}

export interface RenderResult {
  /** Written to <outDir>/<tag>.md */
  api: string;
  /** Written to <outDir>/<tag>.styling.md — omit if there is no styling surface. */
  styling?: string;
}
```

- [ ] **Step 3: Write the failing test**

`tools/cem-agent-docs/src/resolve-type.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isLiteralUnion, normalizeUnion, resolveType, splitUnion } from './resolve-type.ts';

describe('splitUnion', () => {
  it('splits a flat union', () => {
    expect(splitUnion("'a' | 'b' | undefined")).toEqual(["'a'", "'b'", 'undefined']);
  });

  it('does not split inside braces', () => {
    expect(splitUnion("{ a: 'x' | 'y' }")).toEqual(["{ a: 'x' | 'y' }"]);
  });

  it('does not split inside generics', () => {
    expect(splitUnion('Record<string, A | B> | undefined')).toEqual([
      'Record<string, A | B>',
      'undefined',
    ]);
  });

  it('does not split inside a quoted literal', () => {
    expect(splitUnion("'a|b' | 'c'")).toEqual(["'a|b'", "'c'"]);
  });

  it('returns an empty array for empty input', () => {
    expect(splitUnion('   ')).toEqual([]);
  });
});

describe('isLiteralUnion', () => {
  it.each([
    ["'default' | 'small'", true],
    ["'a' | 'b' | undefined", true],
    ['1 | 2 | -3.5', true],
    ['false | true', false],
    ['true | undefined', false],
    ['ProviderLocation', false],
    ["'a' | SomeType", false],
    ['undefined', false],
    ['', false],
  ])('%s -> %s', (text, expected) => {
    expect(isLiteralUnion(text)).toBe(expected);
  });
});

describe('normalizeUnion', () => {
  it('dedupes repeated members', () => {
    expect(normalizeUnion('PopupPlacement | undefined | undefined')).toBe(
      'PopupPlacement | undefined'
    );
  });

  it('sorts nullish members last', () => {
    expect(normalizeUnion("undefined | 'a' | null | 'b'")).toBe("'a' | 'b' | undefined | null");
  });

  it('leaves a non-union untouched', () => {
    expect(normalizeUnion('Record<string, string>')).toBe('Record<string, string>');
  });
});

describe('resolveType', () => {
  it('prefers parsedType for an opaque alias that expands to a literal union', () => {
    expect(
      resolveType({
        type: { text: 'ZdControlSize | undefined' },
        parsedType: { text: "'default' | 'small' | undefined" },
      })
    ).toBe("'default' | 'small' | undefined");
  });

  it('keeps text when it is already a literal union', () => {
    expect(
      resolveType({
        type: { text: "'strip' | 'stacked'" },
        parsedType: { text: "'stacked' | 'strip'" },
      })
    ).toBe("'strip' | 'stacked'");
  });

  it('rejects boolean expansion', () => {
    expect(resolveType({ type: { text: 'boolean' }, parsedType: { text: 'false | true' } })).toBe(
      'boolean'
    );
  });

  it('rejects an object expansion', () => {
    expect(
      resolveType({
        type: { text: 'ProviderLocation' },
        parsedType: { text: '{ id: string, name: string }' },
      })
    ).toBe('ProviderLocation');
  });

  it('rejects the collapsed index signature', () => {
    expect(
      resolveType({ type: { text: 'Record<string, string>' }, parsedType: { text: '{ }' } })
    ).toBe('Record<string, string>');
  });

  it('falls back to text when parsedType is absent', () => {
    expect(resolveType({ type: { text: 'HTMLFormElement' } })).toBe('HTMLFormElement');
  });

  it('reports unknown when there is no type at all', () => {
    expect(resolveType({})).toBe('unknown');
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools`
Expected: FAIL — `Failed to resolve import "./resolve-type.ts"`

- [ ] **Step 5: Write `resolve-type.ts`**

```ts
import type { Typed } from './types.ts';

const STRING_LITERAL = /^'[^']*'$/;
const NUMBER_LITERAL = /^-?\d+(\.\d+)?$/;
const NULLISH = new Set(['undefined', 'null']);
const BOOLEANISH = new Set(['true', 'false']);

const OPENERS = '{[<(';
const CLOSERS = '}]>)';

/**
 * Split a union at the top level only — never inside `{}`, `[]`, `<>`, `()`, or quotes.
 * A naive `text.split('|')` turns `{ a: 'x' | 'y' }` into two garbage members, and that
 * shape is common enough in this manifest to matter.
 */
export function splitUnion(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let buf = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quote) {
      buf += char;
      if (char === quote && text[i - 1] !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      buf += char;
      continue;
    }
    if (OPENERS.includes(char)) depth++;
    if (CLOSERS.includes(char)) depth--;
    if (char === '|' && depth === 0) {
      if (buf.trim()) parts.push(buf.trim());
      buf = '';
      continue;
    }
    buf += char;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

/** True when every meaningful member is a string or number literal. */
export function isLiteralUnion(text: string): boolean {
  const meaningful = splitUnion(text).filter((member) => !NULLISH.has(member));
  if (meaningful.length === 0) return false;
  // `boolean` expanding to `false | true` is noise, not information.
  if (meaningful.every((member) => BOOLEANISH.has(member))) return false;
  return meaningful.every(
    (member) => STRING_LITERAL.test(member) || NUMBER_LITERAL.test(member)
  );
}

/** Dedupe union members, preserving first-seen order, with nullish members last. */
export function normalizeUnion(text: string): string {
  const members = splitUnion(text);
  if (members.length <= 1) return text.trim();

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const member of members) {
    if (seen.has(member)) continue;
    seen.add(member);
    ordered.push(member);
  }
  const nullish = ordered.filter((member) => NULLISH.has(member));
  const rest = ordered.filter((member) => !NULLISH.has(member));
  return [...rest, ...nullish].join(' | ');
}

/**
 * Use `parsedType` only when it is a union of string or number literals, and `type.text` is
 * not already a literal union. Otherwise use `type.text`.
 *
 * `parsedType` is better for opaque aliases and actively worse for object types: it collapses
 * index signatures to `{ }` and expands mapped types with the wrong property values. Both are
 * upstream bugs in @wc-toolkit/type-parser; this rule routes around them rather than waiting.
 */
export function resolveType(typed: Typed): string {
  const text = typed.type?.text?.trim() ?? '';
  const parsed = typed.parsedType?.text?.trim();

  if (!text) return 'unknown';
  if (!parsed || parsed === text) return normalizeUnion(text);
  // parsedType would only reorder members, and not into source order.
  if (isLiteralUnion(text)) return normalizeUnion(text);
  if (!isLiteralUnion(parsed)) return normalizeUnion(text);
  return normalizeUnion(parsed);
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `./node_modules/.bin/vitest run --project tools`
Expected: PASS, all of `resolve-type.test.ts` green

- [ ] **Step 7: Verify typecheck is clean**

Run: `./node_modules/.bin/tsc --noEmit -p tools/cem-agent-docs/tsconfig.json`
Expected: no output

- [ ] **Step 8: Commit**

```bash
git add tools/cem-agent-docs vitest.config.ts tsconfig.json
git commit -m "feat(cem-agent-docs): scaffold generator with literal-union type resolution"
```

---

### Task 2: Normalization

**Files:**
- Create: `tools/cem-agent-docs/src/normalize.ts`
- Create: `tools/cem-agent-docs/src/test/fixtures.ts`
- Test: `tools/cem-agent-docs/src/normalize.test.ts`

**Interfaces:**
- Consumes: `Component`, `NormalizedApi`, `ApiGroups`, `PropRow`, `MethodRow`, `EventRow`, `SlotRow`, `CssPropRow` from `./types.ts`; `resolveType` from `./resolve-type.ts`.
- Produces: `normalizeApi(component: Component): NormalizedApi`; `isPublicMember(member: Member): boolean`; and the fixture helpers `fixtureManifest(): Package`, `widgetComponent(): Component`, `thingComponent(): Component`.

- [ ] **Step 1: Write the fixture**

`tools/cem-agent-docs/src/test/fixtures.ts`. A small hand-written manifest, not the real 1.2 MB one — it must stay readable and it must contain every case the normalizer handles:

```ts
import type { Component, Package } from '../types.ts';

/**
 * A primitive-shaped component: reflected props, a private backing field, an inherited
 * attribute, a styling surface, and a method.
 */
export function widgetComponent(): Component {
  return {
    kind: 'class',
    name: 'ZdWidget',
    tagName: 'zd-widget',
    customElement: true,
    modulePath: 'src/components/widget/widget.ts',
    description: 'A widget. Renders a labelled control.',
    superclass: { name: 'CoreWidget', package: '@charm-ux/core' },
    attributes: [
      {
        name: 'size',
        fieldName: 'size',
        type: { text: 'ZdControlSize | undefined' },
        parsedType: { text: "'default' | 'small' | undefined" },
        default: "'default'",
        description: 'Control size.',
      },
      {
        name: 'patient-type',
        fieldName: 'patientType',
        type: { text: "'new' | 'existing'" },
        description: 'Which booking path to show.',
      },
      {
        name: 'disabled',
        fieldName: 'disabled',
        type: { text: 'boolean' },
        parsedType: { text: 'false | true' },
        default: 'false',
        description: 'Disables the control.',
        inheritedFrom: { name: 'CoreWidget', package: '@charm-ux/core' },
      },
    ],
    members: [
      { kind: 'field', name: 'size', type: { text: 'ZdControlSize | undefined' }, privacy: 'public' },
      { kind: 'field', name: 'patientType', type: { text: "'new' | 'existing'" }, privacy: 'public' },
      {
        kind: 'field',
        name: 'disabled',
        type: { text: 'boolean' },
        privacy: 'public',
        inheritedFrom: { name: 'CoreWidget', package: '@charm-ux/core' },
      },
      { kind: 'field', name: '_internal', type: { text: 'string' }, privacy: 'public' },
      { kind: 'field', name: 'hidden', type: { text: 'boolean' }, privacy: 'private' },
      { kind: 'field', name: 'baseName', type: { text: 'string' }, privacy: 'public', static: true },
      {
        kind: 'field',
        name: 'form',
        type: { text: 'HTMLFormElement | null' },
        privacy: 'public',
        readonly: true,
        description: 'The associated form.',
      },
      {
        kind: 'method',
        name: 'focus',
        privacy: 'public',
        description: 'Moves focus to the control.',
        parameters: [{ name: 'options', type: { text: 'FocusOptions' }, optional: true }],
        return: { type: { text: 'void' } },
      },
      { kind: 'method', name: '_sync', privacy: 'public' },
    ],
    events: [
      {
        name: 'zd-widget-change',
        type: { text: 'ZdWidgetChangeEvent' },
        parsedType: { text: '{ value: string }' },
        description: 'Fired when the value changes.',
      },
    ],
    slots: [
      { name: '', description: 'Widget content.' },
      { name: 'icon', description: 'Leading icon.', inheritedFrom: { name: 'CoreWidget' } },
    ],
    cssParts: [{ name: 'base', description: 'The outer wrapper.' }],
    cssStates: [{ name: 'invalid', description: 'Applied when validation fails.' }],
    cssProperties: [
      {
        name: '--zd-widget-gap',
        syntax: '<length>',
        default: '8px',
        description: 'Gap between icon and label.',
      },
    ],
  };
}

/** An API-component-shaped component: object-typed props, no styling surface. */
export function thingComponent(): Component {
  return {
    kind: 'class',
    name: 'ZdThing',
    tagName: 'zd-thing',
    customElement: true,
    modulePath: 'src/components/thing/thing.ts',
    description: 'Fetches and renders a thing.',
    attributes: [],
    members: [
      {
        kind: 'field',
        name: 'values',
        type: { text: 'Record<string, string>' },
        parsedType: { text: '{ }' },
        privacy: 'public',
        description: 'Current field values.',
      },
      {
        kind: 'field',
        name: 'state',
        type: { text: "'idle' | 'loading' | 'success' | 'empty' | 'error'" },
        privacy: 'public',
        default: "'idle'",
      },
    ],
    events: [{ name: 'zd-thing-error', type: { text: 'ZocdocErrorEvent' } }],
  };
}

/** A declaration with no tagName — a base class the generator must skip silently. */
function baseClass(): Component {
  return { kind: 'class', name: 'ThingBase', description: 'Not a custom element.' };
}

export function fixtureManifest(): Package {
  return {
    schemaVersion: '2.1.0',
    modules: [
      {
        kind: 'javascript-module',
        path: 'src/components/widget/widget.ts',
        declarations: [widgetComponent()],
      },
      {
        kind: 'javascript-module',
        path: 'src/components/thing/thing.ts',
        declarations: [thingComponent(), baseClass()],
      },
    ],
  };
}
```

- [ ] **Step 2: Write the failing test**

`tools/cem-agent-docs/src/normalize.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { thingComponent, widgetComponent } from './test/fixtures.ts';

describe('normalizeApi', () => {
  it('collapses an attribute and its backing property into one row', () => {
    const { own } = normalizeApi(widgetComponent());
    const size = own.props.find((prop) => prop.attribute === 'size');
    expect(size).toEqual({
      attribute: 'size',
      property: 'size',
      type: "'default' | 'small' | undefined",
      default: "'default'",
      description: 'Control size.',
      readonly: false,
    });
    expect(own.props.filter((prop) => prop.property === 'size')).toHaveLength(1);
  });

  it('keeps both names when attribute and property differ', () => {
    const { own } = normalizeApi(widgetComponent());
    const row = own.props.find((prop) => prop.property === 'patientType');
    expect(row?.attribute).toBe('patient-type');
  });

  it('includes a property that has no attribute', () => {
    const { own } = normalizeApi(widgetComponent());
    const form = own.props.find((prop) => prop.property === 'form');
    expect(form?.attribute).toBeUndefined();
    expect(form?.readonly).toBe(true);
  });

  it('drops private, underscore-prefixed, and static members', () => {
    const { own } = normalizeApi(widgetComponent());
    const names = own.props.map((prop) => prop.property);
    expect(names).not.toContain('_internal');
    expect(names).not.toContain('hidden');
    expect(names).not.toContain('baseName');
    expect(own.methods.map((method) => method.name)).not.toContain('_sync');
  });

  it('partitions inherited members out of own', () => {
    const { own, inherited } = normalizeApi(widgetComponent());
    expect(own.props.map((prop) => prop.property)).not.toContain('disabled');
    expect(inherited.props.map((prop) => prop.property)).toContain('disabled');
    expect(inherited.props.find((prop) => prop.property === 'disabled')?.inheritedFrom).toBe(
      'CoreWidget'
    );
    expect(inherited.slots.map((slot) => slot.name)).toEqual(['icon']);
  });

  it('applies the literal-union rule to props and events', () => {
    const { own, inherited } = normalizeApi(widgetComponent());
    // `boolean` must not become `false | true`.
    expect(inherited.props.find((prop) => prop.attribute === 'disabled')?.type).toBe('boolean');
    // An event whose parsedType is an object keeps the event class name.
    expect(own.events[0]).toEqual({
      name: 'zd-widget-change',
      type: 'ZdWidgetChangeEvent',
      description: 'Fired when the value changes.',
    });
  });

  it('rejects the collapsed index signature on a property', () => {
    const { own } = normalizeApi(thingComponent());
    expect(own.props.find((prop) => prop.property === 'values')?.type).toBe(
      'Record<string, string>'
    );
  });

  it('renders a method signature with optional parameters and a return type', () => {
    const { own } = normalizeApi(widgetComponent());
    expect(own.methods).toEqual([
      {
        name: 'focus',
        signature: 'focus(options?: FocusOptions): void',
        description: 'Moves focus to the control.',
      },
    ]);
  });

  it('carries the styling surface through', () => {
    const { own } = normalizeApi(widgetComponent());
    expect(own.cssParts.map((part) => part.name)).toEqual(['base']);
    expect(own.cssStates.map((state) => state.name)).toEqual(['invalid']);
    expect(own.cssProperties[0]).toEqual({
      name: '--zd-widget-gap',
      syntax: '<length>',
      default: '8px',
      description: 'Gap between icon and label.',
    });
  });

  it('produces empty groups for a component with no styling surface', () => {
    const { own } = normalizeApi(thingComponent());
    expect(own.cssParts).toEqual([]);
    expect(own.cssProperties).toEqual([]);
    expect(own.cssStates).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools normalize`
Expected: FAIL — `Failed to resolve import "./normalize.ts"`

- [ ] **Step 4: Write `normalize.ts`**

```ts
import { resolveType } from './resolve-type.ts';
import type {
  ApiGroups,
  Attribute,
  Component,
  CssPropRow,
  EventRow,
  Member,
  MethodRow,
  Named,
  NormalizedApi,
  PropRow,
  SlotRow,
} from './types.ts';

/**
 * Static members, privates, and underscore-prefixed backing fields are implementation.
 * `ZdAlert._politeness` and `ZdTooltip._placement` are public-by-privacy but private by
 * convention, so the name check is not redundant with the privacy check.
 */
export function isPublicMember(member: Member): boolean {
  if (member.static) return false;
  if (member.privacy === 'private' || member.privacy === 'protected') return false;
  return !member.name.startsWith('_');
}

function emptyGroups(): ApiGroups {
  return {
    props: [],
    methods: [],
    events: [],
    slots: [],
    cssParts: [],
    cssStates: [],
    cssProperties: [],
  };
}

function originOf(item: { inheritedFrom?: { name: string } }): string | undefined {
  return item.inheritedFrom?.name;
}

function methodSignature(member: Member): string {
  const params = (member.parameters ?? [])
    .map((param) => `${param.name}${param.optional ? '?' : ''}: ${resolveType(param)}`)
    .join(', ');
  const returns = member.return?.type?.text ?? 'void';
  return `${member.name}(${params}): ${returns}`;
}

/**
 * Every reflected prop appears twice in the manifest — once in `attributes`, once in
 * `members`. Emit one row per logical prop, preferring the attribute's documentation and
 * falling back to the field's, so a prop documented on only one side still reads.
 */
function propRows(component: Component): PropRow[] {
  const fields = new Map<string, Member>();
  for (const member of component.members ?? []) {
    if (member.kind === 'field' && isPublicMember(member)) fields.set(member.name, member);
  }

  const rows: PropRow[] = [];
  const claimed = new Set<string>();

  for (const attribute of component.attributes ?? []) {
    if (attribute.name.startsWith('_')) continue;
    const fieldName = attribute.fieldName ?? attribute.name;
    const field = fields.get(fieldName);
    if (field) claimed.add(fieldName);

    rows.push({
      attribute: attribute.name,
      property: field ? fieldName : undefined,
      type: resolveType(hasType(attribute) ? attribute : (field ?? attribute)),
      default: attribute.default ?? field?.default,
      description: attribute.description ?? field?.description,
      readonly: field?.readonly ?? false,
      inheritedFrom: originOf(attribute) ?? (field ? originOf(field) : undefined),
    });
  }

  for (const [name, field] of fields) {
    if (claimed.has(name)) continue;
    rows.push({
      property: name,
      type: resolveType(field),
      default: field.default,
      description: field.description,
      readonly: field.readonly ?? false,
      inheritedFrom: originOf(field),
    });
  }

  return rows;
}

function hasType(attribute: Attribute): boolean {
  return Boolean(attribute.type?.text);
}

function slotRows(items: Named[] | undefined): SlotRow[] {
  return (items ?? []).map((item) => ({
    name: item.name,
    description: item.description,
    inheritedFrom: originOf(item),
  }));
}

/**
 * Split every group into own and inherited. Inherited API is kept — an agent does need to
 * know `zd-button` takes `disabled` even though `CoreButton` declares it, and across this
 * repo inherited public members outnumber own ones roughly four to one.
 */
export function normalizeApi(component: Component): NormalizedApi {
  const own = emptyGroups();
  const inherited = emptyGroups();

  const place = <T extends { inheritedFrom?: string }>(
    row: T,
    pick: (groups: ApiGroups) => T[]
  ): void => {
    pick(row.inheritedFrom ? inherited : own).push(row);
  };

  for (const row of propRows(component)) place(row, (groups) => groups.props);

  for (const member of component.members ?? []) {
    if (member.kind !== 'method' || !isPublicMember(member)) continue;
    const row: MethodRow = {
      name: member.name,
      signature: methodSignature(member),
      description: member.description,
      inheritedFrom: originOf(member),
    };
    place(row, (groups) => groups.methods);
  }

  for (const event of component.events ?? []) {
    const row: EventRow = {
      name: event.name,
      type: resolveType(event),
      description: event.description,
      inheritedFrom: originOf(event),
    };
    place(row, (groups) => groups.events);
  }

  for (const row of slotRows(component.slots)) place(row, (groups) => groups.slots);
  for (const row of slotRows(component.cssParts)) place(row, (groups) => groups.cssParts);
  for (const row of slotRows(component.cssStates)) place(row, (groups) => groups.cssStates);

  for (const property of component.cssProperties ?? []) {
    const row: CssPropRow = {
      name: property.name,
      syntax: property.syntax,
      default: property.default,
      description: property.description,
      inheritedFrom: originOf(property),
    };
    place(row, (groups) => groups.cssProperties);
  }

  return { own, inherited };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `./node_modules/.bin/vitest run --project tools`
Expected: PASS

Note: the assertions use `toEqual` against object literals, which fails on an extra `undefined`-valued key only if the key is *present*. `toEqual` ignores `undefined` properties, so `inheritedFrom: undefined` on an own row is fine and intentional — it keeps the row shape uniform.

- [ ] **Step 6: Commit**

```bash
git add tools/cem-agent-docs/src/normalize.ts tools/cem-agent-docs/src/normalize.test.ts tools/cem-agent-docs/src/test/fixtures.ts
git commit -m "feat(cem-agent-docs): normalize manifest into own and inherited API groups"
```

---

### Task 3: API page renderer

**Files:**
- Create: `tools/cem-agent-docs/src/render-component.ts`
- Test: `tools/cem-agent-docs/src/render-component.test.ts`

**Interfaces:**
- Consumes: `normalizeApi` from `./normalize.ts`; `resolveType` from `./resolve-type.ts`; types from `./types.ts`.
- Produces: `renderComponentApi(component: Component, ctx: RenderContext): string`; the markdown helpers `cell(value?: string): string`, `code(value?: string): string`, `table(headers: string[], rows: string[][]): string`.

- [ ] **Step 1: Write the failing test**

`tools/cem-agent-docs/src/render-component.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { renderComponentApi } from './render-component.ts';
import { resolveType } from './resolve-type.ts';
import { fixtureManifest, thingComponent, widgetComponent } from './test/fixtures.ts';
import type { Component, RenderContext } from './types.ts';

function context(component: Component): RenderContext {
  const manifest = fixtureManifest();
  return {
    config: { packageName: '@powered-by-zocdoc/primitives', outDir: 'out' },
    api: normalizeApi(component),
    resolveType,
    siblings: [widgetComponent(), thingComponent()],
    manifest,
  };
}

describe('renderComponentApi', () => {
  it('matches the snapshot for a component with a full surface', () => {
    expect(renderComponentApi(widgetComponent(), context(widgetComponent()))).toMatchSnapshot();
  });

  it('matches the snapshot for a component with no inherited API and no slots', () => {
    expect(renderComponentApi(thingComponent(), context(thingComponent()))).toMatchSnapshot();
  });

  it('leads with the tag name', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md.split('\n')[0]).toBe('# zd-widget');
  });

  it('escapes pipes inside union types so the table survives', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md).toContain("`'default' \\| 'small' \\| undefined`");
  });

  it('labels the default slot rather than emitting an empty cell', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md).toContain('| _(default)_ | Widget content. |');
  });

  it('puts inherited API after own API under its own heading', () => {
    const md = renderComponentApi(widgetComponent(), context(widgetComponent()));
    expect(md.indexOf('## Attributes & Properties')).toBeLessThan(md.indexOf('## Inherited'));
    expect(md).toContain('`CoreWidget`');
  });

  it('omits sections that have no rows', () => {
    const md = renderComponentApi(thingComponent(), context(thingComponent()));
    expect(md).not.toContain('## Slots');
    expect(md).not.toContain('## Methods');
    expect(md).not.toContain('## Inherited');
  });

  it('ends with exactly one trailing newline', () => {
    const md = renderComponentApi(thingComponent(), context(thingComponent()));
    expect(md.endsWith('\n')).toBe(true);
    expect(md.endsWith('\n\n')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools render-component`
Expected: FAIL — `Failed to resolve import "./render-component.ts"`

- [ ] **Step 3: Write `render-component.ts`**

```ts
import type { ApiGroups, Component, RenderContext } from './types.ts';

/** A table cell: pipes escaped, newlines flattened, empty rendered as an em dash. */
export function cell(value?: string): string {
  if (!value) return '—';
  const flat = value.replace(/\s*\n+\s*/g, ' ').replace(/\|/g, '\\|').trim();
  return flat || '—';
}

/** A code-formatted table cell. */
export function code(value?: string): string {
  if (!value) return '—';
  return `\`${value.replace(/\|/g, '\\|')}\``;
}

export function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function slotName(name: string): string {
  return name ? code(name) : '_(default)_';
}

/**
 * Render the shared groups at a given heading level, with an origin column when these are
 * inherited. Sections with no rows are omitted entirely — an empty table is pure noise in a
 * file whose whole purpose is to stay small.
 */
function sections(groups: ApiGroups, level: string, withOrigin: boolean): string[] {
  const out: string[] = [];
  const extend = (headers: string[]) => (withOrigin ? [...headers, 'From'] : headers);
  const origin = (value?: string) => (withOrigin ? [code(value)] : []);

  if (groups.props.length) {
    out.push(`${level} Attributes & Properties`);
    out.push(
      table(
        extend(['Attribute', 'Property', 'Type', 'Default', 'Description']),
        groups.props.map((prop) => [
          code(prop.attribute),
          code(prop.property),
          code(prop.type),
          code(prop.default),
          cell(prop.readonly ? `${prop.description ?? ''} (readonly)`.trim() : prop.description),
          ...origin(prop.inheritedFrom),
        ])
      )
    );
  }

  if (groups.events.length) {
    out.push(`${level} Events`);
    out.push(
      table(
        extend(['Event', 'Type', 'Description']),
        groups.events.map((event) => [
          code(event.name),
          code(event.type),
          cell(event.description),
          ...origin(event.inheritedFrom),
        ])
      )
    );
  }

  if (groups.slots.length) {
    out.push(`${level} Slots`);
    out.push(
      table(
        extend(['Slot', 'Description']),
        groups.slots.map((slot) => [
          slotName(slot.name),
          cell(slot.description),
          ...origin(slot.inheritedFrom),
        ])
      )
    );
  }

  if (groups.methods.length) {
    out.push(`${level} Methods`);
    out.push(
      table(
        extend(['Method', 'Description']),
        groups.methods.map((method) => [
          code(method.signature),
          cell(method.description),
          ...origin(method.inheritedFrom),
        ])
      )
    );
  }

  return out;
}

/**
 * The callable surface: what an agent needs to answer "what props does this take". Styling
 * lives in a sibling file so the common question never pays for the CSS surface.
 */
export function renderComponentApi(component: Component, ctx: RenderContext): string {
  const tag = component.tagName ?? component.name;
  const out: string[] = [`# ${tag}`];

  if (component.description) out.push(component.description.trim());

  const meta = [`**Class** \`${component.name}\``];
  if (component.modulePath) meta.push(`**Module** \`${component.modulePath}\``);
  meta.push(`**Package** \`${ctx.config.packageName}\``);
  out.push(meta.join(' — '));

  out.push(['```html', `<${tag}></${tag}>`, '```'].join('\n'));

  out.push(...sections(ctx.api.own, '##', false));

  const inherited = sections(ctx.api.inherited, '###', true);
  if (inherited.length) {
    out.push('## Inherited');
    out.push(...inherited);
  }

  return `${out.join('\n\n')}\n`;
}
```

- [ ] **Step 4: Run the tests and write the snapshots**

Run: `./node_modules/.bin/vitest run --project tools render-component`
Expected: PASS, with `2 snapshots written`

- [ ] **Step 5: Read the snapshot file and confirm it is docs you would want**

Run: `cat tools/cem-agent-docs/src/__snapshots__/render-component.test.ts.snap`
Expected: `zd-widget` shows a metadata line, a usage block, its three own tables, and an `## Inherited` section containing `disabled` and the `icon` slot. If a column reads wrong, fix the renderer and re-run with `-u`. Do not accept a snapshot you have not read.

- [ ] **Step 6: Commit**

```bash
git add tools/cem-agent-docs/src/render-component.ts tools/cem-agent-docs/src/render-component.test.ts tools/cem-agent-docs/src/__snapshots__
git commit -m "feat(cem-agent-docs): render the component API page"
```

---

### Task 4: Styling page renderer and the default render hook

**Files:**
- Create: `tools/cem-agent-docs/src/render-styling.ts`
- Create: `tools/cem-agent-docs/src/render.ts`
- Test: `tools/cem-agent-docs/src/render-styling.test.ts`

**Interfaces:**
- Consumes: `cell`, `code`, `table` from `./render-component.ts`; `renderComponentApi` from `./render-component.ts`.
- Produces: `renderComponentStyling(component: Component, ctx: RenderContext): string | null`; `defaultRender(component: Component, ctx: RenderContext): RenderResult`.

- [ ] **Step 1: Write the failing test**

`tools/cem-agent-docs/src/render-styling.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeApi } from './normalize.ts';
import { defaultRender } from './render.ts';
import { renderComponentStyling } from './render-styling.ts';
import { resolveType } from './resolve-type.ts';
import { fixtureManifest, thingComponent, widgetComponent } from './test/fixtures.ts';
import type { Component, RenderContext } from './types.ts';

function context(component: Component): RenderContext {
  return {
    config: { packageName: '@powered-by-zocdoc/primitives', outDir: 'out' },
    api: normalizeApi(component),
    resolveType,
    siblings: [widgetComponent(), thingComponent()],
    manifest: fixtureManifest(),
  };
}

describe('renderComponentStyling', () => {
  it('matches the snapshot for a component with a styling surface', () => {
    expect(
      renderComponentStyling(widgetComponent(), context(widgetComponent()))
    ).toMatchSnapshot();
  });

  it('returns null when there is no styling surface at all', () => {
    expect(renderComponentStyling(thingComponent(), context(thingComponent()))).toBeNull();
  });

  it('covers parts, custom properties, and states', () => {
    const md = renderComponentStyling(widgetComponent(), context(widgetComponent())) ?? '';
    expect(md).toContain('## CSS Parts');
    expect(md).toContain('## CSS Custom Properties');
    expect(md).toContain('## CSS States');
    expect(md).toContain('`--zd-widget-gap`');
  });

  it('points back at the API page', () => {
    const md = renderComponentStyling(widgetComponent(), context(widgetComponent())) ?? '';
    expect(md).toContain('[zd-widget.md](zd-widget.md)');
  });
});

describe('defaultRender', () => {
  it('produces both files when the component has a styling surface', () => {
    const result = defaultRender(widgetComponent(), context(widgetComponent()));
    expect(result.api).toContain('# zd-widget');
    expect(result.styling).toContain('# zd-widget — Styling');
  });

  it('omits styling when there is none', () => {
    const result = defaultRender(thingComponent(), context(thingComponent()));
    expect(result.api).toContain('# zd-thing');
    expect(result.styling).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools render-styling`
Expected: FAIL — `Failed to resolve import "./render-styling.ts"`

- [ ] **Step 3: Write `render-styling.ts`**

```ts
import { cell, code, table } from './render-component.ts';
import type { ApiGroups, Component, RenderContext } from './types.ts';

function isEmpty(groups: ApiGroups): boolean {
  return (
    groups.cssParts.length === 0 &&
    groups.cssStates.length === 0 &&
    groups.cssProperties.length === 0
  );
}

function stylingSections(groups: ApiGroups, level: string, withOrigin: boolean): string[] {
  const out: string[] = [];
  const extend = (headers: string[]) => (withOrigin ? [...headers, 'From'] : headers);
  const origin = (value?: string) => (withOrigin ? [code(value)] : []);

  if (groups.cssParts.length) {
    out.push(`${level} CSS Parts`);
    out.push(
      table(
        extend(['Part', 'Description']),
        groups.cssParts.map((part) => [
          code(part.name),
          cell(part.description),
          ...origin(part.inheritedFrom),
        ])
      )
    );
  }

  if (groups.cssProperties.length) {
    out.push(`${level} CSS Custom Properties`);
    out.push(
      table(
        extend(['Property', 'Syntax', 'Default', 'Description']),
        groups.cssProperties.map((property) => [
          code(property.name),
          code(property.syntax),
          code(property.default),
          cell(property.description),
          ...origin(property.inheritedFrom),
        ])
      )
    );
  }

  if (groups.cssStates.length) {
    out.push(`${level} CSS States`);
    out.push(
      table(
        extend(['State', 'Description']),
        groups.cssStates.map((state) => [
          code(state.name),
          cell(state.description),
          ...origin(state.inheritedFrom),
        ])
      )
    );
  }

  return out;
}

/**
 * The CSS surface, kept out of the API page because the two are consulted in different tasks
 * and governed by different rules (STYLE-001 and the token files, which the hand-written
 * SKILL.md already explains). Returns null when the component exposes nothing to style, so
 * no empty file is written.
 */
export function renderComponentStyling(component: Component, ctx: RenderContext): string | null {
  const { own, inherited } = ctx.api;
  if (isEmpty(own) && isEmpty(inherited)) return null;

  const tag = component.tagName ?? component.name;
  const out: string[] = [`# ${tag} — Styling`, `API reference: [${tag}.md](${tag}.md)`];

  out.push(...stylingSections(own, '##', false));

  const inheritedSections = stylingSections(inherited, '###', true);
  if (inheritedSections.length) {
    out.push('## Inherited');
    out.push(...inheritedSections);
  }

  return `${out.join('\n\n')}\n`;
}
```

- [ ] **Step 4: Write `render.ts`**

```ts
import { renderComponentApi } from './render-component.ts';
import { renderComponentStyling } from './render-styling.ts';
import type { Component, RenderContext, RenderResult } from './types.ts';

/**
 * The built-in renderer. A package that needs a different shape supplies its own `render`,
 * which can call these two functions and post-process, or ignore them entirely.
 */
export function defaultRender(component: Component, ctx: RenderContext): RenderResult {
  const styling = renderComponentStyling(component, ctx);
  return styling === null
    ? { api: renderComponentApi(component, ctx) }
    : { api: renderComponentApi(component, ctx), styling };
}
```

- [ ] **Step 5: Run the tests and read the new snapshot**

Run: `./node_modules/.bin/vitest run --project tools render-styling`
Expected: PASS, `1 snapshot written`. Read `tools/cem-agent-docs/src/__snapshots__/render-styling.test.ts.snap` and confirm the three tables read correctly.

- [ ] **Step 6: Commit**

```bash
git add tools/cem-agent-docs/src/render-styling.ts tools/cem-agent-docs/src/render.ts tools/cem-agent-docs/src/render-styling.test.ts tools/cem-agent-docs/src/__snapshots__
git commit -m "feat(cem-agent-docs): render the styling page and compose the default renderer"
```

---

### Task 5: Index renderer

**Files:**
- Create: `tools/cem-agent-docs/src/render-index.ts`
- Test: `tools/cem-agent-docs/src/render-index.test.ts`

**Interfaces:**
- Consumes: `Component`, `AgentDocsConfig` from `./types.ts`.
- Produces: `renderIndex(components: Component[], config: AgentDocsConfig): string`; `firstSentence(text: string | undefined, maxLength?: number): string`.

Per the amendment above, the index is a flat tag-sorted list. It is the only file an agent needs to decide where to look next, so it must stay one line per component.

- [ ] **Step 1: Write the failing test**

`tools/cem-agent-docs/src/render-index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { firstSentence, renderIndex } from './render-index.ts';
import { thingComponent, widgetComponent } from './test/fixtures.ts';
import type { AgentDocsConfig } from './types.ts';

const config: AgentDocsConfig = {
  packageName: '@powered-by-zocdoc/primitives',
  outDir: 'out',
};

describe('firstSentence', () => {
  it('stops at the first sentence boundary', () => {
    expect(firstSentence('A widget. Renders a labelled control.')).toBe('A widget.');
  });

  it('returns the whole text when there is no boundary', () => {
    expect(firstSentence('Fetches and renders a thing')).toBe('Fetches and renders a thing');
  });

  it('truncates an over-long sentence', () => {
    expect(firstSentence('x'.repeat(200), 20)).toBe(`${'x'.repeat(20)}…`);
  });

  it('flattens newlines', () => {
    expect(firstSentence('A widget\nwith a wrapped description')).toBe(
      'A widget with a wrapped description'
    );
  });

  it('returns an empty string for missing input', () => {
    expect(firstSentence(undefined)).toBe('');
  });
});

describe('renderIndex', () => {
  it('matches the snapshot', () => {
    expect(renderIndex([thingComponent(), widgetComponent()], config)).toMatchSnapshot();
  });

  it('sorts by tag name regardless of input order', () => {
    const md = renderIndex([widgetComponent(), thingComponent()], config);
    expect(md.indexOf('zd-thing')).toBeLessThan(md.indexOf('zd-widget'));
  });

  it('links each component to its page', () => {
    const md = renderIndex([widgetComponent()], config);
    expect(md).toContain('- [`zd-widget`](zd-widget.md) — A widget.');
  });

  it('notes the styling page only when one exists', () => {
    const md = renderIndex([widgetComponent(), thingComponent()], config);
    expect(md).toContain('[styling](zd-widget.styling.md)');
    expect(md).not.toContain('zd-thing.styling.md');
  });

  it('states the count and the package', () => {
    const md = renderIndex([widgetComponent(), thingComponent()], config);
    expect(md).toContain('`@powered-by-zocdoc/primitives`');
    expect(md).toContain('2 components');
  });

  it('handles an empty component list without emitting a broken list', () => {
    const md = renderIndex([], config);
    expect(md).toContain('0 components');
    expect(md).not.toContain('- [');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools render-index`
Expected: FAIL — `Failed to resolve import "./render-index.ts"`

- [ ] **Step 3: Write `render-index.ts`**

```ts
import type { AgentDocsConfig, Component } from './types.ts';

/** True when the component exposes anything a styling page would document. */
function hasStyling(component: Component): boolean {
  return Boolean(
    component.cssParts?.length || component.cssStates?.length || component.cssProperties?.length
  );
}

/**
 * The first sentence of a class JSDoc, flattened and capped. The index is the file an agent
 * reads to decide where to look next, so a line that runs long defeats the point.
 */
export function firstSentence(text: string | undefined, maxLength = 120): string {
  if (!text) return '';
  const flat = text.replace(/\s*\n+\s*/g, ' ').trim();
  const match = /^(.*?[.!?])(\s|$)/.exec(flat);
  const sentence = (match ? match[1] : flat).trim();
  return sentence.length > maxLength ? `${sentence.slice(0, maxLength)}…` : sentence;
}

/**
 * A flat, tag-sorted catalog. Deliberately not grouped by category: nothing in the manifest
 * carries one, and a taxonomy the generator invents would be wrong the first time a component
 * is added.
 */
export function renderIndex(components: Component[], config: AgentDocsConfig): string {
  const sorted = [...components].sort((a, b) =>
    (a.tagName ?? a.name).localeCompare(b.tagName ?? b.name)
  );

  const out: string[] = [
    `# ${config.packageName} — Component Index`,
    'Generated from the Custom Elements Manifest. Do not edit by hand.',
    `${sorted.length} components. Read this file first, then open the one page you need.`,
  ];

  if (sorted.length) {
    out.push(
      sorted
        .map((component) => {
          const tag = component.tagName ?? component.name;
          const summary = firstSentence(component.summary ?? component.description);
          const styling = hasStyling(component) ? ` · [styling](${tag}.styling.md)` : '';
          return `- [\`${tag}\`](${tag}.md) — ${summary || 'No description.'}${styling}`;
        })
        .join('\n')
    );
  }

  return `${out.join('\n\n')}\n`;
}
```

- [ ] **Step 4: Run the tests and read the snapshot**

Run: `./node_modules/.bin/vitest run --project tools render-index`
Expected: PASS, `1 snapshot written`. Read it.

- [ ] **Step 5: Commit**

```bash
git add tools/cem-agent-docs/src/render-index.ts tools/cem-agent-docs/src/render-index.test.ts tools/cem-agent-docs/src/__snapshots__
git commit -m "feat(cem-agent-docs): render the component index"
```

---

### Task 6: The writer — diff-suppressed writes and pruning

**Files:**
- Create: `tools/cem-agent-docs/src/write.ts`
- Test: `tools/cem-agent-docs/src/write.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `interface FileSystem`; `nodeFileSystem: FileSystem`; `memoryFileSystem(seed?: Record<string, string>): FileSystem & { files: Map<string, string> }`; `writeDocs(outDir: string, files: Map<string, string>, fs: FileSystem): WriteReport`; `interface WriteReport { written: string[]; unchanged: string[]; pruned: string[] }`.

The `FileSystem` port is what makes every downstream test run in memory — no temp directories, no cleanup, no chance of a test writing into the real skills tree.

- [ ] **Step 1: Write the failing test**

`tools/cem-agent-docs/src/write.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { memoryFileSystem, writeDocs } from './write.ts';

describe('writeDocs', () => {
  it('writes new files', () => {
    const fs = memoryFileSystem();
    const report = writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.get('out/a.md')).toBe('# A\n');
    expect(report.written).toEqual(['out/a.md']);
  });

  it('does not touch a file whose content is byte-identical', () => {
    const fs = memoryFileSystem({ 'out/a.md': '# A\n' });
    const report = writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(report.written).toEqual([]);
    expect(report.unchanged).toEqual(['out/a.md']);
  });

  it('rewrites a file whose content changed', () => {
    const fs = memoryFileSystem({ 'out/a.md': '# A\n' });
    const report = writeDocs('out', new Map([['a.md', '# A2\n']]), fs);

    expect(fs.files.get('out/a.md')).toBe('# A2\n');
    expect(report.written).toEqual(['out/a.md']);
  });

  it('prunes an orphaned markdown file', () => {
    const fs = memoryFileSystem({ 'out/a.md': '# A\n', 'out/gone.md': '# Gone\n' });
    const report = writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.has('out/gone.md')).toBe(false);
    expect(report.pruned).toEqual(['out/gone.md']);
  });

  it('leaves non-markdown files alone', () => {
    const fs = memoryFileSystem({ 'out/keep.txt': 'x' });
    writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.has('out/keep.txt')).toBe(true);
  });

  it('never reaches outside outDir', () => {
    const fs = memoryFileSystem({ 'SKILL.md': '# Hand written\n', 'out/gone.md': 'x' });
    writeDocs('out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.get('SKILL.md')).toBe('# Hand written\n');
  });

  it('creates outDir before writing', () => {
    const fs = memoryFileSystem();
    writeDocs('deep/nested/out', new Map([['a.md', '# A\n']]), fs);

    expect(fs.files.get('deep/nested/out/a.md')).toBe('# A\n');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools write`
Expected: FAIL — `Failed to resolve import "./write.ts"`

- [ ] **Step 3: Write `write.ts`**

```ts
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The only filesystem surface the generator uses. A port rather than direct `node:fs` calls
 * so tests run entirely in memory — no temp directories, and no way for a test to write into
 * the real skills tree.
 */
export interface FileSystem {
  read(path: string): string | null;
  write(path: string, content: string): void;
  remove(path: string): void;
  list(path: string): string[];
  mkdirp(path: string): void;
}

export const nodeFileSystem: FileSystem = {
  read(path) {
    return existsSync(path) ? readFileSync(path, 'utf-8') : null;
  },
  write(path, content) {
    writeFileSync(path, content, 'utf-8');
  },
  remove(path) {
    rmSync(path, { force: true });
  },
  list(path) {
    return existsSync(path) ? readdirSync(path) : [];
  },
  mkdirp(path) {
    mkdirSync(path, { recursive: true });
  },
};

export function memoryFileSystem(
  seed: Record<string, string> = {}
): FileSystem & { files: Map<string, string> } {
  const files = new Map(Object.entries(seed));
  return {
    files,
    read(path) {
      return files.get(path) ?? null;
    },
    write(path, content) {
      files.set(path, content);
    },
    remove(path) {
      files.delete(path);
    },
    list(path) {
      const prefix = `${path}/`;
      return [...files.keys()]
        .filter((key) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
        .map((key) => key.slice(prefix.length));
    },
    mkdirp() {
      // Directories are implicit in a flat map.
    },
  };
}

export interface WriteReport {
  written: string[];
  unchanged: string[];
  pruned: string[];
}

/**
 * Write the generated pages and remove orphans.
 *
 * Byte-identical content is not rewritten: `analyze` runs on every build, and touching
 * unchanged files would dirty the tree and make the CI freshness check useless.
 *
 * Pruning is confined to `*.md` directly inside `outDir`, which is `references/` — never the
 * directory holding the hand-written `SKILL.md`.
 */
export function writeDocs(
  outDir: string,
  files: Map<string, string>,
  fs: FileSystem
): WriteReport {
  fs.mkdirp(outDir);

  const report: WriteReport = { written: [], unchanged: [], pruned: [] };

  for (const [name, content] of files) {
    const path = join(outDir, name);
    if (fs.read(path) === content) {
      report.unchanged.push(path);
      continue;
    }
    fs.write(path, content);
    report.written.push(path);
  }

  for (const name of fs.list(outDir)) {
    if (!name.endsWith('.md') || files.has(name)) continue;
    const path = join(outDir, name);
    fs.remove(path);
    report.pruned.push(path);
  }

  report.written.sort();
  report.unchanged.sort();
  report.pruned.sort();
  return report;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./node_modules/.bin/vitest run --project tools write`
Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add tools/cem-agent-docs/src/write.ts tools/cem-agent-docs/src/write.test.ts
git commit -m "feat(cem-agent-docs): add diff-suppressed writer with orphan pruning"
```

---

### Task 7: Orchestration — `generateAgentDocs` and the two hooks

**Files:**
- Create: `tools/cem-agent-docs/src/generate.ts`
- Test: `tools/cem-agent-docs/src/generate.test.ts`

**Interfaces:**
- Consumes: `normalizeApi`, `resolveType`, `defaultRender`, `renderIndex`, `writeDocs`, `nodeFileSystem`, `FileSystem`, `WriteReport`.
- Produces: `generateAgentDocs(manifest: Package, config: AgentDocsConfig, fs?: FileSystem): WriteReport`; `selectComponents(manifest: Package, filter?: (c: Component) => boolean): Component[]`.

- [ ] **Step 1: Write the failing test**

`tools/cem-agent-docs/src/generate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateAgentDocs, selectComponents } from './generate.ts';
import { fixtureManifest } from './test/fixtures.ts';
import { memoryFileSystem } from './write.ts';
import type { AgentDocsConfig } from './types.ts';

const config: AgentDocsConfig = {
  packageName: '@powered-by-zocdoc/primitives',
  outDir: 'refs',
};

describe('selectComponents', () => {
  it('skips declarations with no tagName', () => {
    expect(selectComponents(fixtureManifest()).map((c) => c.tagName)).toEqual([
      'zd-thing',
      'zd-widget',
    ]);
  });

  it('applies a custom filter', () => {
    const selected = selectComponents(fixtureManifest(), (c) => c.tagName !== 'zd-thing');
    expect(selected.map((c) => c.tagName)).toEqual(['zd-widget']);
  });
});

describe('generateAgentDocs', () => {
  it('writes an index, an API page per component, and a styling page where warranted', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(fixtureManifest(), config, fs);

    expect([...fs.files.keys()].sort()).toEqual([
      'refs/index.md',
      'refs/zd-thing.md',
      'refs/zd-widget.md',
      'refs/zd-widget.styling.md',
    ]);
  });

  it('is idempotent — a second run writes nothing', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(fixtureManifest(), config, fs);
    const second = generateAgentDocs(fixtureManifest(), config, fs);

    expect(second.written).toEqual([]);
    expect(second.unchanged).toHaveLength(4);
  });

  it('prunes the pages of a component that was removed', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(fixtureManifest(), config, fs);

    const smaller = fixtureManifest();
    smaller.modules = smaller.modules.filter((m) => !m.path.includes('thing'));
    const report = generateAgentDocs(smaller, config, fs);

    expect(report.pruned).toEqual(['refs/zd-thing.md']);
    expect(fs.files.has('refs/zd-thing.md')).toBe(false);
  });

  it('honours a custom filter hook', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(
      fixtureManifest(),
      { ...config, filter: (c) => c.tagName !== 'zd-thing' },
      fs
    );

    expect(fs.files.has('refs/zd-thing.md')).toBe(false);
    expect(fs.files.get('refs/index.md')).not.toContain('zd-thing');
  });

  it('honours a custom render hook', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(
      fixtureManifest(),
      { ...config, render: (c) => ({ api: `custom ${c.tagName}\n` }) },
      fs
    );

    expect(fs.files.get('refs/zd-widget.md')).toBe('custom zd-widget\n');
    expect(fs.files.has('refs/zd-widget.styling.md')).toBe(false);
  });

  it('treats a render hook returning null as a skip', () => {
    const fs = memoryFileSystem();
    generateAgentDocs(
      fixtureManifest(),
      { ...config, render: (c) => (c.tagName === 'zd-thing' ? null : { api: 'x\n' }) },
      fs
    );

    expect(fs.files.has('refs/zd-thing.md')).toBe(false);
    expect(fs.files.get('refs/index.md')).not.toContain('zd-thing');
  });

  it('passes normalized API and siblings to the render hook', () => {
    const fs = memoryFileSystem();
    let seen: string[] = [];
    generateAgentDocs(
      fixtureManifest(),
      {
        ...config,
        render: (c, ctx) => {
          if (c.tagName === 'zd-widget') {
            seen = ctx.siblings.map((s) => s.tagName ?? '');
            expect(ctx.api.own.props.length).toBeGreaterThan(0);
            expect(ctx.config.packageName).toBe('@powered-by-zocdoc/primitives');
            expect(ctx.resolveType({ type: { text: 'boolean' } })).toBe('boolean');
          }
          return { api: 'x\n' };
        },
      },
      fs
    );

    expect(seen).toEqual(['zd-thing', 'zd-widget']);
  });

  it('fails the build naming the component when render throws', () => {
    const fs = memoryFileSystem();
    expect(() =>
      generateAgentDocs(
        fixtureManifest(),
        {
          ...config,
          render: (c) => {
            if (c.tagName === 'zd-widget') throw new Error('boom');
            return { api: 'x\n' };
          },
        },
        fs
      )
    ).toThrow(/zd-widget.*boom/s);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools generate`
Expected: FAIL — `Failed to resolve import "./generate.ts"`

- [ ] **Step 3: Write `generate.ts`**

```ts
import { normalizeApi } from './normalize.ts';
import { defaultRender } from './render.ts';
import { renderIndex } from './render-index.ts';
import { resolveType } from './resolve-type.ts';
import type {
  AgentDocsConfig,
  Component,
  Package,
  RenderContext,
  RenderResult,
} from './types.ts';
import { nodeFileSystem, writeDocs, type FileSystem, type WriteReport } from './write.ts';

/**
 * Every custom element in the manifest, tag-sorted, after the filter hook.
 *
 * A declaration with no `tagName` is skipped silently — base classes and mixins are expected
 * in a manifest and are not an error.
 */
export function selectComponents(
  manifest: Package,
  filter?: (component: Component) => boolean
): Component[] {
  const components: Component[] = [];
  for (const module of manifest.modules ?? []) {
    for (const declaration of module.declarations ?? []) {
      if (!declaration.tagName) continue;
      if (filter && !filter(declaration)) continue;
      components.push(declaration);
    }
  }
  return components.sort((a, b) => (a.tagName ?? '').localeCompare(b.tagName ?? ''));
}

/**
 * Generate the markdown for one package and write it.
 *
 * Pure with respect to the analyzer: it takes a finished manifest and a filesystem port, so
 * an external consumer can point it at their own manifest without adopting our analyzer
 * config, and every test runs in memory.
 */
export function generateAgentDocs(
  manifest: Package,
  config: AgentDocsConfig,
  fs: FileSystem = nodeFileSystem
): WriteReport {
  const candidates = selectComponents(manifest, config.filter);
  const render = config.render ?? defaultRender;

  const files = new Map<string, string>();
  const rendered: Component[] = [];

  for (const component of candidates) {
    const ctx: RenderContext = {
      config,
      api: normalizeApi(component),
      resolveType,
      siblings: candidates,
      manifest,
    };

    let result: RenderResult | null;
    try {
      result = render(component, ctx);
    } catch (cause) {
      // A silently missing page is worse than a broken build.
      throw new Error(
        `agent-docs: render failed for <${component.tagName}> (${component.name}): ` +
          `${cause instanceof Error ? cause.message : String(cause)}`,
        { cause }
      );
    }
    if (!result) continue;

    const tag = component.tagName as string;
    files.set(`${tag}.md`, result.api);
    if (result.styling) files.set(`${tag}.styling.md`, result.styling);
    rendered.push(component);
  }

  files.set('index.md', renderIndex(rendered, config));

  return writeDocs(config.outDir, files, fs);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./node_modules/.bin/vitest run --project tools`
Expected: PASS — all projects' tools tests green

- [ ] **Step 5: Commit**

```bash
git add tools/cem-agent-docs/src/generate.ts tools/cem-agent-docs/src/generate.test.ts
git commit -m "feat(cem-agent-docs): orchestrate generation with filter and render hooks"
```

---

### Task 8: The analyzer plugin adapter and public exports

**Files:**
- Create: `tools/cem-agent-docs/src/plugin.ts`
- Create: `tools/cem-agent-docs/src/index.ts`
- Test: `tools/cem-agent-docs/src/plugin.test.ts`

**Interfaces:**
- Consumes: `generateAgentDocs` from `./generate.ts`; `FileSystem` from `./write.ts`.
- Produces: `agentDocsPlugin(config: AgentDocsConfig, fs?: FileSystem): CemPlugin`; `interface CemPlugin { name: string; packageLinkPhase(params: { customElementsManifest: Package }): void }`. `index.ts` re-exports the public surface.

- [ ] **Step 1: Write the failing test**

`tools/cem-agent-docs/src/plugin.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { agentDocsPlugin } from './plugin.ts';
import { fixtureManifest } from './test/fixtures.ts';
import { memoryFileSystem } from './write.ts';

describe('agentDocsPlugin', () => {
  it('is named so analyzer errors are attributable', () => {
    expect(agentDocsPlugin({ packageName: 'p', outDir: 'refs' }).name).toBe('agent-docs');
  });

  it('generates from packageLinkPhase', () => {
    const fs = memoryFileSystem();
    const plugin = agentDocsPlugin({ packageName: 'p', outDir: 'refs' }, fs);

    plugin.packageLinkPhase({ customElementsManifest: fixtureManifest() });

    expect(fs.files.has('refs/index.md')).toBe(true);
    expect(fs.files.has('refs/zd-widget.md')).toBe(true);
  });

  it('does not mutate the manifest', () => {
    const fs = memoryFileSystem();
    const manifest = fixtureManifest();
    const before = JSON.stringify(manifest);

    agentDocsPlugin({ packageName: 'p', outDir: 'refs' }, fs).packageLinkPhase({
      customElementsManifest: manifest,
    });

    expect(JSON.stringify(manifest)).toBe(before);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./node_modules/.bin/vitest run --project tools plugin`
Expected: FAIL — `Failed to resolve import "./plugin.ts"`

- [ ] **Step 3: Write `plugin.ts`**

```ts
import { generateAgentDocs } from './generate.ts';
import type { AgentDocsConfig, Package } from './types.ts';
import { nodeFileSystem, type FileSystem } from './write.ts';

export interface CemPlugin {
  name: string;
  packageLinkPhase(params: { customElementsManifest: Package }): void;
}

/**
 * The analyzer adapter. Register it LAST in a package's plugin list: by `packageLinkPhase`
 * the jsdoc-tags, cem-inheritance, type-parser, module-path-resolver, css-prefix, and
 * cem-sorter plugins have finished mutating the manifest, so this reads a finished artifact.
 *
 * Register it only in the per-package configs, never at the root — the root run covers both
 * packages, so a root registration would generate every component twice.
 *
 * It writes files and returns nothing. It never mutates the manifest.
 */
export function agentDocsPlugin(
  config: AgentDocsConfig,
  fs: FileSystem = nodeFileSystem
): CemPlugin {
  return {
    name: 'agent-docs',
    packageLinkPhase({ customElementsManifest }) {
      generateAgentDocs(customElementsManifest, config, fs);
    },
  };
}
```

- [ ] **Step 4: Write `index.ts`**

```ts
export { generateAgentDocs, selectComponents } from './generate.ts';
export { agentDocsPlugin, type CemPlugin } from './plugin.ts';
export { defaultRender } from './render.ts';
export { renderComponentApi } from './render-component.ts';
export { renderComponentStyling } from './render-styling.ts';
export { firstSentence, renderIndex } from './render-index.ts';
export { isLiteralUnion, normalizeUnion, resolveType, splitUnion } from './resolve-type.ts';
export { isPublicMember, normalizeApi } from './normalize.ts';
export {
  memoryFileSystem,
  nodeFileSystem,
  writeDocs,
  type FileSystem,
  type WriteReport,
} from './write.ts';
export type * from './types.ts';
```

- [ ] **Step 5: Run the tests and typecheck**

Run: `./node_modules/.bin/vitest run --project tools`
Expected: PASS

Run: `./node_modules/.bin/tsc --noEmit -p tools/cem-agent-docs/tsconfig.json`
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add tools/cem-agent-docs/src/plugin.ts tools/cem-agent-docs/src/index.ts tools/cem-agent-docs/src/plugin.test.ts
git commit -m "feat(cem-agent-docs): add packageLinkPhase adapter and public exports"
```

---

### Task 9: Per-package analyzer configs

**Files:**
- Create: `custom-elements.config.base.mjs`
- Modify: `custom-elements-manifest.config.mjs` (rewire to the factory)
- Create: `packages/primitives/custom-elements-manifest.config.mjs`
- Create: `packages/api-components/custom-elements-manifest.config.mjs`
- Modify: `packages/primitives/package.json` (add `analyze` script)
- Modify: `packages/api-components/package.json` (add `analyze` script)
- Modify: `package.json` (root — `build` runs both levels)
- Modify: `.gitignore` (un-ignore per-package manifests)

**Interfaces:**
- Consumes: `agentDocsPlugin` from `tools/cem-agent-docs/src/index.ts`, imported **by relative path**.
- Produces: `EXCLUDE`, `sharedPlugins({ charmManifestPath })`, `overrideModuleCreation(tsconfig)` from `custom-elements.config.base.mjs`.

**Critical constraint:** the configs must import the tool as `'../../tools/cem-agent-docs/src/index.ts'`. Importing it as a workspace package name resolves through `node_modules` and hard-fails with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` — Node refuses to strip types for anything under `node_modules`. Do not "fix" this by adding the tool to `pnpm-workspace.yaml` and importing by name; that is the broken path, and `pnpm install` cannot run in the sandbox anyway.

- [ ] **Step 1: Write the shared factory**

`custom-elements.config.base.mjs`:

```js
import fs from 'node:fs';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { jsDocTagsPlugin } from '@wc-toolkit/jsdoc-tags';
import { modulePathResolverPlugin } from '@wc-toolkit/module-path-resolver';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cssPrefixPlugin } from '@charm-ux/theming';

export const EXCLUDE = ['**/*.stories.ts', '**/*.test.ts', '**/*.styles.ts'];

/**
 * The plugin chain every analyzer run shares, in order. `charmManifestPath` differs per run
 * because @charm-ux/core is linked only into packages/primitives — the path is resolved
 * against the analyzer's working directory, which is the config's own directory.
 */
export function sharedPlugins({ charmManifestPath }) {
  const charmManifest = JSON.parse(fs.readFileSync(charmManifestPath, 'utf-8'));
  return [
    jsDocTagsPlugin(),
    cemInheritancePlugin({ externalManifests: [charmManifest] }),
    typeParserPlugin(),
    modulePathResolverPlugin({}),
    cssPrefixPlugin({ prefix: 'zd' }),
    cemSorterPlugin(),
  ];
}

/**
 * type-parser needs a real TS program to resolve aliases through the checker. Each run points
 * at the tsconfig that matches its scope: the root run uses the repo-wide `tsconfig.json`, a
 * package run uses its own `tsconfig.build.json`.
 */
export function overrideModuleCreation(tsconfig) {
  return ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, tsconfig);
    return program.getSourceFiles().filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  };
}
```

- [ ] **Step 2: Rewire the root config**

`custom-elements-manifest.config.mjs` — replaces the whole file. The docs plugin is deliberately absent:

```js
import { EXCLUDE, overrideModuleCreation, sharedPlugins } from './custom-elements.config.base.mjs';

/**
 * The unified manifest, consumed by Storybook (`.storybook/preview.ts` imports it directly)
 * and by editor tooling following the root `customElements` field. Gitignored build output.
 *
 * The agent-docs plugin is NOT registered here. This run covers both packages, so registering
 * it would generate every component twice — once from here and once from the package run.
 */
export default {
  globs: ['packages/*/src/**/*.ts'],
  exclude: EXCLUDE,
  outdir: '.',
  litelement: true,
  plugins: sharedPlugins({
    charmManifestPath: 'packages/primitives/node_modules/@charm-ux/core/custom-elements.json',
  }),
  overrideModuleCreation: overrideModuleCreation('tsconfig.json'),
};
```

- [ ] **Step 3: Verify the root run is unchanged**

```bash
cp custom-elements.json /tmp/cem-before.json
pnpm --config.verifyDepsBeforeRun=false run analyze
diff <(node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('/tmp/cem-before.json','utf8')),null,2))") \
     <(node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('custom-elements.json','utf8')),null,2))") \
  && echo "IDENTICAL"
```

Expected: `IDENTICAL`. If it differs, the refactor changed behaviour — stop and reconcile before continuing.

- [ ] **Step 4: Write the primitives config**

`packages/primitives/custom-elements-manifest.config.mjs`:

```js
import {
  EXCLUDE,
  overrideModuleCreation,
  sharedPlugins,
} from '../../custom-elements.config.base.mjs';
// Imported by relative path, not by package name: Node refuses to strip types for anything
// under node_modules (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING), which is what a workspace
// package specifier resolves to.
import { agentDocsPlugin } from '../../tools/cem-agent-docs/src/index.ts';

/**
 * The package-scoped manifest. Module paths come out package-relative
 * (`src/components/button/button.ts`), which is what a distributable package should publish
 * and what generated docs should reference.
 */
export default {
  globs: ['src/**/*.ts'],
  exclude: EXCLUDE,
  outdir: '.',
  litelement: true,
  plugins: [
    ...sharedPlugins({
      charmManifestPath: 'node_modules/@charm-ux/core/custom-elements.json',
    }),
    agentDocsPlugin({
      packageName: '@powered-by-zocdoc/primitives',
      outDir: '../../.claude/skills/primitives/references',
    }),
  ],
  overrideModuleCreation: overrideModuleCreation('tsconfig.build.json'),
};
```

- [ ] **Step 5: Write the api-components config**

`packages/api-components/custom-elements-manifest.config.mjs`:

```js
import {
  EXCLUDE,
  overrideModuleCreation,
  sharedPlugins,
} from '../../custom-elements.config.base.mjs';
import { agentDocsPlugin } from '../../tools/cem-agent-docs/src/index.ts';

/**
 * @charm-ux/core is a `link:` dependency of primitives only, so this run reaches its manifest
 * through the sibling package. Adding it as an explicit devDependency here would be cleaner
 * and needs an install, which the sandbox cannot do.
 */
export default {
  globs: ['src/**/*.ts'],
  exclude: EXCLUDE,
  outdir: '.',
  litelement: true,
  plugins: [
    ...sharedPlugins({
      charmManifestPath: '../primitives/node_modules/@charm-ux/core/custom-elements.json',
    }),
    agentDocsPlugin({
      packageName: '@powered-by-zocdoc/api-components',
      outDir: '../../.claude/skills/api-components/references',
    }),
  ],
  overrideModuleCreation: overrideModuleCreation('tsconfig.build.json'),
};
```

- [ ] **Step 6: Add the package scripts**

In `packages/primitives/package.json` and `packages/api-components/package.json`, add above `dependencies`:

```json
  "scripts": {
    "analyze": "cem analyze"
  },
```

`cem` resolves from the workspace root `node_modules/.bin` (verified), and the analyzer runs with the package directory as CWD, which is what every relative path in these configs assumes.

- [ ] **Step 7: Un-ignore the per-package manifests**

`.gitignore` currently has a bare `custom-elements.json`, which matches at every depth. Replace that line with:

```gitignore
# Root manifest is build output for Storybook. Per-package manifests are committed: they ship
# via each package's `customElements` field and keep the generated docs reviewable next to the
# data they came from.
/custom-elements.json
```

- [ ] **Step 8: Run the per-package analyzers**

```bash
pnpm --config.verifyDepsBeforeRun=false -r run analyze
```

Expected: both packages analyze in topological order. `packages/*/custom-elements.json` appear, `.claude/skills/{primitives,api-components}/references/` fill up, and each `package.json` gains `"customElements": "custom-elements.json"` — the analyzer writes that field automatically. It is the field editor tooling reads, so keep it.

- [ ] **Step 9: Read the generated output**

```bash
wc -l .claude/skills/*/references/index.md
cat .claude/skills/primitives/references/index.md
cat .claude/skills/primitives/references/zd-button.md
cat .claude/skills/api-components/references/index.md
```

Expected: `primitives/references/index.md` lists 36 tags and is under 100 lines; `api-components/references/index.md` lists 10. `zd-button.md` shows 3 own attributes and ~19 inherited ones under `## Inherited`.

Note: api-components pages will show own API only. Every api-component extends `CharmElement` but `cem-inheritance` merges nothing into them, because `primitives` re-exports `CharmElement` from Charm (`packages/primitives/src/index.ts:8`) rather than declaring it. That gap is filed separately and does not block this work.

- [ ] **Step 10: Verify idempotency**

```bash
pnpm --config.verifyDepsBeforeRun=false -r run analyze
git status --short .claude/skills packages/*/custom-elements.json
```

Expected: no output from `git status` beyond what step 8 already produced. A second run must not modify a single byte.

- [ ] **Step 11: Wire the root build**

In root `package.json`, change `build` so it produces both levels:

```json
    "build": "pnpm run build:types && pnpm run build:theme && pnpm run analyze && pnpm -r run analyze",
```

`storybook` and `storybook:build` need only the root run and stay unchanged.

- [ ] **Step 12: Commit**

```bash
git add custom-elements.config.base.mjs custom-elements-manifest.config.mjs \
        packages/primitives/custom-elements-manifest.config.mjs \
        packages/api-components/custom-elements-manifest.config.mjs \
        packages/primitives/package.json packages/api-components/package.json \
        packages/primitives/custom-elements.json packages/api-components/custom-elements.json \
        package.json .gitignore .claude/skills
git commit -m "feat(cem-agent-docs): add per-package analyzers and generate agent reference docs"
```

---

### Task 10: Rewire the hand-written skills and add the CI freshness check

**Files:**
- Modify: `.claude/skills/primitives/SKILL.md` (replace the `## Component Catalog` section, lines 126–192)
- Modify: `.claude/skills/api-components/SKILL.md` (replace `### What each component actually is`, lines 36–54)
- Modify: `package.json` (root — add a `docs:check` script)
- Create or modify: the CI workflow that runs lint and tests

**Interfaces:**
- Consumes: the generated `references/index.md` from Task 9.
- Produces: `pnpm --config.verifyDepsBeforeRun=false run docs:check`.

Generated files are additive. Everything else in these two files stays — they carry knowledge the manifest does not have and the generator must never claim to: which token file to grep, why 25 stylesheets are empty, the `dependencies()` trap, and that `ZdSelect.size` is a `number` (rows) and not the control size the other five components take.

- [ ] **Step 1: Replace the primitives catalog**

In `.claude/skills/primitives/SKILL.md`, delete lines 126–192 — the `## Component Catalog` heading through the end of `### Utility`, stopping before `## Creating a New Primitive` on line 194 — and put this in their place:

```markdown
## Component Catalog

Generated from the manifest, so it cannot drift. Read the index first, then open the one
component you need — do not read the whole directory.

- [`references/index.md`](references/index.md) — every tag with a one-line summary
- `references/<tag>.md` — attributes, properties, events, slots, methods, inherited API
- `references/<tag>.styling.md` — CSS parts, custom properties, states

One caveat the generated pages cannot express: `zd-select`'s `size` attribute is a `number`
(visible rows, the native `<select>` meaning), not the `'default' | 'small'` control size the
other five form primitives take. See "Size Prop" below.
```

- [ ] **Step 2: Replace the api-components section**

In `.claude/skills/api-components/SKILL.md`, delete lines 36–54 — the `### What each component actually is` heading and its body, stopping before `### Internal helpers` on line 55 — and put this in their place:

```markdown
### What each component actually is

Generated from the manifest. Read the index first, then the one component you need.

- [`references/index.md`](references/index.md) — every tag with a one-line summary
- `references/<tag>.md` — attributes, properties, events, slots, methods
- `references/<tag>.styling.md` — CSS parts, custom properties, states

These pages show each component's own API only. Every component extends `CharmElement`, but
the manifest does not currently merge that base class in — see "Names `CharmElement` already
owns" below for what it brings.
```

- [ ] **Step 3: Verify the line ranges were right**

```bash
grep -n '^#\{1,3\} ' .claude/skills/primitives/SKILL.md
grep -n '^#\{1,3\} ' .claude/skills/api-components/SKILL.md
```

Expected: `primitives` still has `## Creating a New Primitive`, `## Writing Styles`, `## Theme Tokens`, `## Size Prop`, `## Accessibility Tests`. `api-components` still has `### Internal helpers`, `### Intl formatters`, and everything from `## Templates and dependencies` onward. If a heading vanished, the deletion overshot — restore from git and redo it.

- [ ] **Step 4: Add the freshness script**

In root `package.json`, add after `analyze`:

```json
    "docs:check": "pnpm run analyze && pnpm -r run analyze && git diff --exit-code -- .claude/skills packages/*/custom-elements.json",
```

`git diff --exit-code` exits non-zero when the working tree differs, which is exactly the failure we want: someone changed a component and did not regenerate.

- [ ] **Step 5: Verify the check passes and then that it can fail**

```bash
pnpm --config.verifyDepsBeforeRun=false run docs:check && echo "CLEAN"
```
Expected: `CLEAN`

```bash
printf '\n' >> .claude/skills/primitives/references/index.md
pnpm --config.verifyDepsBeforeRun=false run docs:check; echo "exit=$?"
git checkout .claude/skills/primitives/references/index.md
```
Expected: a diff, then `exit=1`. A check that cannot fail is not a check.

- [ ] **Step 6: Wire it into CI**

Find the workflow that runs `pnpm run lint` or `pnpm test`:

```bash
ls .github/workflows 2>/dev/null && grep -rn 'pnpm run lint\|pnpm test\|pnpm run test' .github/workflows 2>/dev/null
```

Add a step after the existing build/typecheck step:

```yaml
      - name: Check generated docs are current
        run: pnpm --config.verifyDepsBeforeRun=false run docs:check
```

If `.github/workflows` does not exist, skip this step and say so in the final report rather than inventing a CI system — `pnpm --config.verifyDepsBeforeRun=false run docs:check` is runnable either way.

- [ ] **Step 7: Full verification**

```bash
pnpm --config.verifyDepsBeforeRun=false run typecheck && pnpm --config.verifyDepsBeforeRun=false run lint && ./node_modules/.bin/vitest run --project tools && pnpm --config.verifyDepsBeforeRun=false run docs:check
```

Expected: all green. `pnpm test` also runs the browser project, which has 13 pre-existing failures in `packages/api-components/src/components/provider-card/provider-card.test.ts` unrelated to this work — do not treat those as a regression, and do not fix them here.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills package.json .github/workflows
git commit -m "docs: point hand-written skills at generated references and check freshness in CI"
```

---

## Notes for the implementer

- **Do not run `pnpm install`.** The sandbox blocks the npm registry (HTTP 567). Nothing in this plan needs a new dependency. If a `pnpm run` command complains about dependency verification, prefix it with `--config.verifyDepsBeforeRun=false`.
- **Uncommitted work exists on this branch** in `packages/api-components/src/components/provider-search/` and `packages/primitives/src/icons.ts`. Leave it alone; stage only the paths each task names.
- **Read every snapshot you write.** Snapshot tests that were never read are a record of a bug, not a guard against one.
- **The generator's error messages name components and files, never data values** (PHI-001).
