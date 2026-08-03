import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../packages/primitives/dist/theme');

async function buildTheme() {
  const { zocdocThemeCss, zocdocResetCss, zocdocUtilitiesCss, zocdocAllCss } = await import(
    '../packages/primitives/src/theme/zocdoc.js'
  );

  await mkdir(outDir, { recursive: true });

  await Promise.all([
    writeFile(join(outDir, 'tokens.css'), zocdocThemeCss),
    writeFile(join(outDir, 'reset.css'), zocdocResetCss),
    writeFile(join(outDir, 'utilities.css'), zocdocUtilitiesCss),
    writeFile(join(outDir, 'all.css'), zocdocAllCss),
  ]);

  console.log('Theme CSS files written to', outDir);
}

buildTheme();
