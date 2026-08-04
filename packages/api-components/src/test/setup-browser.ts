/**
 * Registers the zd prefix and injects the theme before any test module renders
 * a component. Must be the first thing the browser project evaluates.
 */
import '@powered-by-zocdoc/primitives';
import { zocdocAllCss } from '@powered-by-zocdoc/primitives';

const style = document.createElement('style');
style.textContent = zocdocAllCss;
document.head.appendChild(style);
