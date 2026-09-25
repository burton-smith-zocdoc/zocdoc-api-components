import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.CI ? '/zocdoc-api-components/' : '/',
  resolve: {
    alias: {
      '/zocdoc.js': resolve(import.meta.dirname, '../api-components/dist/bundle/zocdoc.js'),
    },
  },
  /*
   * Loads `.env.local` from the workspace root so there is one token file for the whole repo
   * rather than a second one in here that could drift out of step — or, worse, get committed
   * because a new directory is not covered by the root `.gitignore` entry.
   */
  envDir: resolve(import.meta.dirname, '../..'),
  publicDir: resolve(import.meta.dirname, '../../static'),
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        composed: resolve(import.meta.dirname, 'composed.html'),
        standalone: resolve(import.meta.dirname, 'standalone.html'),
      },
    },
  },
});
