import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const stubPath = resolve(__dirname, 'src/stubs/generate-theme-stub.js');

const stubGeneratorPlugin: Plugin = {
  name: 'stub-theme-generator',
  enforce: 'pre',
  resolveId(source, importer) {
    // Stub imports to generateTheme from within theming package
    if (source.includes('generator/generateTheme')) {
      console.log(`Stubbing generator: ${source}`);
      return { id: stubPath, moduleSideEffects: false };
    }
    // Stub root @charm-ux/theming imports (they re-export the generator)
    if (source === '@charm-ux/theming') {
      console.log(`Stubbing root theming: from ${importer}`);
      return { id: resolve(__dirname, 'src/stubs/theming-stub.js'), moduleSideEffects: false };
    }
    // Redirect @zocdoc/api-primitive-components to configure-only (avoids theme exports)
    if (source === '@zocdoc/api-primitive-components') {
      console.log(`Redirecting primitives: from ${importer}`);
      return resolve(__dirname, '../primitives/dist/configure-only.js');
    }
    return null;
  },
};

export default defineConfig({
  plugins: [stubGeneratorPlugin],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/bundle.ts'),
      name: 'Zocdoc',
      formats: ['iife', 'es'],
      fileName: (format) => (format === 'iife' ? 'zocdoc.js' : 'zocdoc.esm.js'),
    },
    outDir: 'dist/bundle',
    emptyDirOnly: true,
    minify: 'esbuild',
    sourcemap: true,
  },
});
