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
