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
