import fs from 'fs';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { jsDocTagsPlugin } from '@wc-toolkit/jsdoc-tags';
import { modulePathResolverPlugin } from '@wc-toolkit/module-path-resolver';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cssPrefixPlugin } from '@charm-ux/theming';

const charmManifest = JSON.parse(
  fs.readFileSync('packages/primitives/node_modules/@charm-ux/core/custom-elements.json', 'utf-8')
);

export default {
  globs: ['packages/*/src/**/*.ts'],
  exclude: ['**/*.stories.ts', '**/*.test.ts', '**/*.styles.ts'],
  outdir: '.',
  litelement: true,
  plugins: [
    jsDocTagsPlugin(),
    cemInheritancePlugin({
      externalManifests: [charmManifest],
    }),
    typeParserPlugin(),
    modulePathResolverPlugin({}),
    cssPrefixPlugin({ prefix: 'zd' }),
    cemSorterPlugin(),
  ],

  overrideModuleCreation({ ts, globs }) {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },
};
