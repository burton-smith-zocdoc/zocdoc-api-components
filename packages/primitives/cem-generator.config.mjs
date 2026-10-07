import { frameworkPlugins, sharedConfig } from '../../cem-generator.config.base.mjs';

const shared = sharedConfig({
  charmManifestPath: 'node_modules/@charm-ux/core/custom-elements.json',
  tsConfigPath: 'tsconfig.build.json',
  include: ['src/**/*.ts', 'src/theme/generated/layout-elements.css'],
});

export default {
  ...shared,
  // Layout elements are CSS-only (no class to import), so they're left out of the framework outputs.
  plugins: [...shared.plugins, ...frameworkPlugins({ exclude: ['zd-column', 'zd-flex', 'zd-grid'] })],
  filePath: 'custom-elements.json',
};
