import { sharedConfig } from './cem-generator.config.base.mjs';

// Unified manifest consumed by Storybook. No agent-docs here (root covers both packages).
export default {
  ...sharedConfig({
    charmManifestPath: 'packages/primitives/node_modules/@charm-ux/core/custom-elements.json',
    tsConfigPath: 'tsconfig.json',
    include: ['packages/*/src/**/*.ts'],
  }),
  filePath: 'custom-elements.json',
};
