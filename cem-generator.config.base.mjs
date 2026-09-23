import fs from 'node:fs';
import { litPlugin } from '@wc-toolkit/cem-generator-lit';
import { cssPrefixPlugin } from './tools/cem-css-prefix/src/index.ts';

export const EXCLUDE = ['**/*.stories.ts', '**/*.test.ts', '**/*.styles.ts'];

/**
 * `litPlugin()` with its file pre-filter widened to run on every source file.
 *
 * The stock plugin's `shouldAnalyze(sourceText)` is a cheap text gate that only lets
 * `onFile` run when the file literally contains `from 'lit'`, `extends LitElement`, or
 * `customElements.define(`. Our components extend Charm `Core*` base classes (e.g.
 * `class ZdButton extends CoreButton`, where `CoreButton` reaches `LitElement` several
 * files upstream in `@charm-ux/core`) and register via `project.scope.registerComponent()`,
 * so almost none of them match those literals — 35 of 36 primitives elements were silently
 * skipped, yielding a near-empty manifest.
 *
 * `onFile` itself uses an accurate checker-based `extendsLitElement()` heritage walk that
 * DOES resolve the Charm chain, and produces an empty fragment for non-Lit files. So it is
 * both correct and safe to bypass the text pre-filter and let `onFile` decide for every file.
 * Verified: this recovers all 36 primitives + 11 api-components custom elements, matching the
 * analyzer's output exactly.
 */
function litPluginAllFiles() {
  return { ...litPlugin(), shouldAnalyze: () => true };
}

/** Options shared by every run. `charmManifestPath` and `tsConfigPath` differ per scope. */
export function sharedConfig({ charmManifestPath, tsConfigPath, include }) {
  const charmManifest = JSON.parse(fs.readFileSync(charmManifestPath, 'utf-8'));
  return {
    include,
    exclude: EXCLUDE,
    tsConfigPath,
    typeParsing: 'public',
    inheritance: { externalManifests: [charmManifest] },
    // cssPrefix mutates in afterGenerate (post-sort); the emitted manifest carries prefixed names.
    plugins: [litPluginAllFiles(), cssPrefixPlugin({ prefix: 'zd' })],
  };
}
