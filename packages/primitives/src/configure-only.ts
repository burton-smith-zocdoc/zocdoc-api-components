/**
 * Side-effect-only entry point for configuring the project.
 *
 * Use this when you need the prefix/icons configured but don't need the theme
 * CSS exports. This avoids pulling in @charm-ux/theming's generator code.
 *
 * The main entry (`index.ts`) re-exports theme CSS for convenience, but that
 * triggers the theme generator to run, adding ~170KB to bundles that don't
 * tree-shake it away.
 */

// Side effect: configure the prefix before components are defined (PBZD-001). It must come first:
// `export … from` is an import too, and modules evaluate in source order, so a re-export above
// this line would register every component under the default prefix.
import './configure.js';

export { project, CharmElement } from '@charm-ux/core';
export * from './components/index.js';
