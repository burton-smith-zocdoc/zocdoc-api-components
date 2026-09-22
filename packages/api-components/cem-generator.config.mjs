import { sharedConfig } from '../../cem-generator.config.base.mjs';

export default {
  ...sharedConfig({
    charmManifestPath: '../primitives/node_modules/@charm-ux/core/custom-elements.json',
    tsConfigPath: 'tsconfig.build.json',
    include: ['src/**/*.ts'],
  }),
  filePath: 'custom-elements.json',
};
