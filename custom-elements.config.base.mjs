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
