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
  const [zocdoc, schweiger, womensCare, privia] = await Promise.all([
    import('../packages/primitives/src/theme/zocdoc.js'),
    import('../packages/primitives/src/theme/schweiger.js'),
    import('../packages/primitives/src/theme/womensCare.js'),
    import('../packages/primitives/src/theme/privia.js'),
  ]);

  await mkdir(outDir, { recursive: true });

  await Promise.all([
    // Zocdoc (default)
    writeFile(join(outDir, 'tokens.css'), zocdoc.zocdocThemeCss),
    writeFile(join(outDir, 'reset.css'), zocdoc.zocdocResetCss),
    writeFile(join(outDir, 'utilities.css'), zocdoc.zocdocUtilitiesCss),
    writeFile(join(outDir, 'all.css'), zocdoc.zocdocAllCss),
    // Partner themes (tokens only - they share reset/utilities with zocdoc)
    writeFile(join(outDir, 'schweiger-tokens.css'), schweiger.schweigerThemeCss),
    writeFile(join(outDir, 'womens-care-tokens.css'), womensCare.womensCareThemeCss),
    writeFile(join(outDir, 'privia-tokens.css'), privia.priviaThemeCss),
  ]);

  console.log('Theme CSS files written to', outDir);

  // `generateThemeSync` runs with `dryRun: true`, so it builds every artifact in
  // memory and writes none of them. The CSS strings are re-exported by
  // zocdoc.ts; the markdown is only reachable through the result object.
  const { tokensMarkdown } = zocdoc.zocdocTheme;

  if (!tokensMarkdown) {
    throw new Error(
      'Theme generated no tokens markdown - expected zocdocTheme.tokensMarkdown to be a string.'
    );
  }

  await writeFile(docsPath, tokensMarkdown);

  console.log('Token documentation written to', docsPath);
}

buildTheme();
