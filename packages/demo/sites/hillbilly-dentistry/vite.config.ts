import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // One token file for the whole repo, as in packages/demo.
  envDir: resolve(import.meta.dirname, '../../../..'),
  // Fixture provider photos are root-relative (`/images/…`), so serve the repo's static folder.
  publicDir: resolve(import.meta.dirname, '../../../../static'),
});
