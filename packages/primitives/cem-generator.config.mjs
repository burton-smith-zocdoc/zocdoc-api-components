import { frameworkPlugins, sharedConfig } from '../../cem-generator.config.base.mjs';

const shared = sharedConfig({
  charmManifestPath: 'node_modules/@charm-ux/core/custom-elements.json',
  tsConfigPath: 'tsconfig.build.json',
  include: ['src/**/*.ts', 'src/theme/generated/layout-elements.css'],
});

export default {
  ...shared,
  plugins: [...shared.plugins, ...frameworkPlugins()],
  filePath: 'custom-elements.json',
};
