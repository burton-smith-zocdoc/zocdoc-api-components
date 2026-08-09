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
