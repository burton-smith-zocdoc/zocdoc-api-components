import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('zd-') } },
    }),
  ],
  // One token file for the whole repo, as in packages/demo.
  envDir: resolve(import.meta.dirname, '../../../..'),
  // Fixture provider photos are root-relative (`/images/…`), so serve the repo's static folder.
  publicDir: resolve(import.meta.dirname, '../../../../static'),
});
