/**
 * Stub for @charm-ux/theming root barrel.
 *
 * Provides only the runtime utilities needed by components, without the
 * heavy generator code (~170KB). The generator is build-time only.
 */

export { generateThemeSync, generateTheme } from './generate-theme-stub.js';

export function cssVarName(prefix, ...segments) {
  const parts = segments.map((s) =>
    String(s).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  );
  return `--${prefix}-${parts.join('-')}`;
}

export function toKebabCase(value) {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
