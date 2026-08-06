import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageDir = join(__dirname, '../packages/primitives');
const outDir = join(packageDir, 'dist/theme');

// TOKENS.md is documentation, not a build artifact consumers import - it lives
// beside the source so it stays committed and readable. `dist` is gitignored.
const docsPath = join(packageDir, 'TOKENS.md');

async function buildTheme() {
  const { zocdocThemeCss, zocdocResetCss, zocdocUtilitiesCss, zocdocAllCss, zocdocTheme } =
    await import('../packages/primitives/src/theme/zocdoc.js');

  await mkdir(outDir, { recursive: true });

  await Promise.all([
    writeFile(join(outDir, 'tokens.css'), zocdocThemeCss),
    writeFile(join(outDir, 'reset.css'), zocdocResetCss),
    writeFile(join(outDir, 'utilities.css'), zocdocUtilitiesCss),
    writeFile(join(outDir, 'all.css'), zocdocAllCss),
  ]);

  console.log('Theme CSS files written to', outDir);

  // `generateThemeSync` runs with `dryRun: true`, so it builds every artifact in
  // memory and writes none of them. The CSS strings are re-exported by
  // zocdoc.ts; the markdown is only reachable through the result object.
  const { tokensMarkdown } = zocdocTheme;

  if (!tokensMarkdown) {
    throw new Error(
      'Theme generated no tokens markdown - expected zocdocTheme.tokensMarkdown to be a string.'
    );
  }

  await writeFile(docsPath, tokensMarkdown);

  console.log('Token documentation written to', docsPath);
}

buildTheme();
