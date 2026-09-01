/**
 * Stub for @charm-ux/theming's theme generator.
 *
 * The actual generator uses node:fs and node:path which add ~170KB to browser bundles.
 * This stub returns a theme object with empty CSS strings - the actual CSS is loaded
 * separately via <link> tags from the pre-generated CSS files.
 *
 * This works because:
 * 1. The theme definition (token structure) is built by defineTokens(), not the generator
 * 2. The generator just computes CSS from that definition
 * 3. For bundled components, we load pre-generated CSS externally
 */
export function generateThemeSync(tokenBuilder, _options) {
  const definition = tokenBuilder._resolve?.() ?? tokenBuilder;
  return {
    definition,
    css: '',
    cssReset: '',
    cssUtilities: '',
    rootRulesOnly: '',
    classRulesOnly: '',
  };
}

export function generateTheme(tokenBuilder, options) {
  return Promise.resolve(generateThemeSync(tokenBuilder, options));
}
