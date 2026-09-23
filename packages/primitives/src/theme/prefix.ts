/**
 * The CSS custom-property prefix for every generated token.
 *
 * Three places have to agree on this value or components render unstyled:
 *
 * 1. `configure.ts` passes it as `tokenPrefix`, which is what Charm bakes into
 *    component styles when their style modules evaluate.
 * 2. `theme/tokens.ts` generates the declarations with it.
 * 3. The CSS-prefix cem-generator plugin (`tools/cem-css-prefix/src/index.ts`)
 *    rewrites generated `@cssprop` and `@csspart` names to it.
 *
 * It lives in its own module so `configure.ts` can read it without importing the
 * token generator, which must not run before component registration.
 */
export const tokenPrefix = 'zd';
