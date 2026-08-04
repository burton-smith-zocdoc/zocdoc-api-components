import type { CSSResult } from 'lit';

/**
 * String helpers for asserting about component stylesheets.
 *
 * The variant and size overrides couple to the theme by name only. An
 * unresolvable `var()` is invalid at computed-value time rather than a load
 * error, so a renamed or misspelled token leaves a variant silently unstyled -
 * no build failure, no console warning, just the default treatment. These
 * helpers let the node project check that coupling as text, with no browser
 * (TEST-001).
 */

/** Comments would otherwise read as declarations or as token references. */
export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** A stylesheet as comment-free text, ready to assert against. */
export function sheet(styles: CSSResult): string {
  return stripComments(styles.cssText);
}

/**
 * The body of the first rule with this selector, brace-balanced.
 *
 * A `[^}]*` capture stops at the first `}` in the sheet rather than at the one
 * that closes the block, so a rule containing a nested rule comes back
 * truncated mid-nesting: the nested selector and its declarations leak in as if
 * they were the block's own, and anything after the nested rule goes missing.
 */
export function ruleBody(css: string, selector: string): string | null {
  const at = css.indexOf(selector);
  if (at === -1) return null;

  const open = css.indexOf('{', at + selector.length);
  if (open === -1) return null;

  let depth = 1;
  for (let index = open + 1; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    else if (css[index] === '}' && (depth -= 1) === 0) return css.slice(open + 1, index);
  }
  return null;
}

/**
 * A rule body split into the declarations it makes itself and the selectors of
 * any rules nested inside it. A nested rule's declarations belong to the nested
 * selector, not to this block, so they are dropped rather than reported here.
 */
export function partition(body: string): { declarations: string[]; nested: string[] } {
  const declarations: string[] = [];
  const nested: string[] = [];
  let buffer = '';
  let depth = 0;

  for (const char of body) {
    if (char === '{') {
      depth += 1;
      if (depth === 1) {
        nested.push(buffer.trim());
        buffer = '';
        continue;
      }
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        buffer = '';
        continue;
      }
    } else if (depth === 0 && char === ';') {
      if (buffer.trim()) declarations.push(buffer.trim());
      buffer = '';
      continue;
    }
    buffer += char;
  }

  // A final declaration is allowed to omit its semicolon.
  if (depth === 0 && buffer.trim()) declarations.push(buffer.trim());

  return { declarations, nested };
}

/** The declarations a block makes itself, or null if it has no such block. */
export function declarationsIn(css: string, selector: string): string[] | null {
  const body = ruleBody(css, selector);
  return body === null ? null : partition(body).declarations;
}

/** The property names a block declares, without their values. */
export function propertiesIn(css: string, selector: string): string[] {
  return (declarationsIn(css, selector) ?? []).map((line) =>
    line.slice(0, line.indexOf(':')).trim()
  );
}

/** The variants a stylesheet carries a `:host([variant='…'])` block for. */
export function variantsIn(css: string): string[] {
  return [...css.matchAll(/:host\(\[variant='([a-z]+)'\]\)\s*\{/g)].map((match) => match[1]);
}

/**
 * Every `var(--zd-…)` reference, paired with its fallback target if it has one.
 * A reference with a fallback is satisfied by either name resolving - that's the
 * point of the fallback.
 */
export function tokenReferences(css: string): { name: string; fallback?: string }[] {
  const pattern = /var\(\s*(--zd-[a-z0-9-]+)\s*(?:,\s*var\(\s*(--zd-[a-z0-9-]+)\s*\)\s*)?\)/g;
  return [...css.matchAll(pattern)].map((match) => ({ name: match[1], fallback: match[2] }));
}
