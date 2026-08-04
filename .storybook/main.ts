import type { StorybookConfig } from '@storybook/web-components-vite';
import { cemAnalyzerPlugin } from '@wc-toolkit/cem-analyzer-plugin/vite';

const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.mdx', '../packages/*/src/**/*.stories.ts'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            providerImportSource: false,
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {},
  staticDirs: ['../static'],
  viteFinal: async (config) => {
    config.plugins = config.plugins || [];
    config.plugins.push(
      cemAnalyzerPlugin({
        globs: ['packages/*/src/**/*.ts'],
        exclude: ['**/*.stories.ts', '**/*.test.ts', '**/*.styles.ts'],
        litelement: true,
      })
    );
    return config;
  },
};

export default config;
