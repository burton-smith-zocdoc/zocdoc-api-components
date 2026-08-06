/**
 * Registers the zd prefix and injects the theme before any test module renders
 * a component. Must be the first thing the browser project evaluates.
 */
import '@powered-by-zocdoc/primitives';
import { zocdocAllCss } from '@powered-by-zocdoc/primitives';

const theme = document.createElement('style');
theme.textContent = zocdocAllCss;
document.head.appendChild(theme);

/**
 * Pin color scheme to light mode before any components render. Without this,
 * components render with `light-dark()` values computed against the browser's
 * default color scheme, and changing it later doesn't recompute shadow DOM styles.
 */
const colorScheme = document.createElement('style');
colorScheme.id = 'test-color-scheme-pin';
colorScheme.textContent = ':root { color-scheme: light only !important; }';
document.head.appendChild(colorScheme);
