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
