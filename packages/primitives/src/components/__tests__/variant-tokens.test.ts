import { describe, expect, it } from 'vitest';
import { zocdocThemeCss } from '../../theme/zocdoc.js';
import buttonStyles from '../button/button.styles.js';
import badgeStyles from '../badge/badge.styles.js';
import checkboxStyles from '../checkbox/checkbox.styles.js';
import radioStyles from '../radio/radio.styles.js';
import inputStyles from '../input/input.styles.js';
import textAreaStyles from '../text-area/text-area.styles.js';
import iconStyles from '../icon/icon.styles.js';
import breadcrumbItemStyles from '../breadcrumb-item/breadcrumb-item.styles.js';

/**
 * The variant and size styles work by re-pointing the flat custom properties
 * Charm's shadow styles read at the theme's `<component>.<variant>` token
 * groups. That coupling is by name only - a typo or a token renamed in the theme
 * leaves the variant silently unstyled, since an unresolvable `var()` is invalid
 * at computed-value time rather than a load error.
 *
 * These tests run in the node project (TEST-001): they compare strings and never
 * touch the DOM, so they don't need the browser project's Chromium.
 */

/** Every custom property the theme declares. */
const declared = new Set(
  [...zocdocThemeCss.matchAll(/(--zd-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
);

/**
 * Every `var()` reference in a stylesheet, paired with its fallback target if
 * it has one. A reference with a fallback is satisfied by either name
 * resolving - that's the point of the fallback.
 */
function tokenReferences(css: string): { name: string; fallback?: string }[] {
  const pattern = /var\(\s*(--zd-[a-z0-9-]+)\s*(?:,\s*var\(\s*(--zd-[a-z0-9-]+)\s*\)\s*)?\)/g;
  return [...css.matchAll(pattern)].map((match) => ({ name: match[1], fallback: match[2] }));
}

/** The declarations inside the first block matching `selector`, one per entry. */
function declarations(css: string, selector: RegExp): string[] | null {
  const block = css.match(selector);
  if (!block) return null;
  return block[1]
    .split(';')
    .map((line) => line.trim())
    .filter(Boolean);
}

const overrides = [
  { component: 'button', styles: buttonStyles.cssText },
  { component: 'badge', styles: badgeStyles.cssText },
  { component: 'checkbox', styles: checkboxStyles.cssText },
  { component: 'radio', styles: radioStyles.cssText },
  { component: 'input', styles: inputStyles.cssText },
  { component: 'text-area', styles: textAreaStyles.cssText },
  { component: 'icon', styles: iconStyles.cssText },
  { component: 'breadcrumb-item', styles: breadcrumbItemStyles.cssText },
];

describe.each(overrides)('$component style overrides', ({ styles }) => {
  it('references only tokens the theme declares', () => {
    const unresolvable = tokenReferences(styles)
      .filter(({ name, fallback }) =>
        fallback ? !declared.has(name) && !declared.has(fallback) : !declared.has(name),
      )
      .map(({ name }) => name);

    expect(unresolvable).toEqual([]);
  });
});

describe.each([
  { component: 'button', styles: buttonStyles.cssText },
  { component: 'badge', styles: badgeStyles.cssText },
])('$component variant styles', ({ styles }) => {
  it('re-points flat properties rather than restating Charm selectors', () => {
    // Charm owns structure and state logic. If a variant block starts setting
    // real CSS properties, the two stylesheets have to be kept in sync by hand.
    const variantBlocks = [...styles.matchAll(/:host\(\[variant='[a-z]+'\]\)\s*\{([^}]*)\}/g)];

    expect(variantBlocks.length).toBeGreaterThan(0);
    for (const [, body] of variantBlocks) {
      const lines = body
        .split(';')
        .map((line) => line.trim())
        .filter(Boolean);
      expect(lines.every((line) => line.startsWith('--zd-'))).toBe(true);
    }
  });
});

describe('button variant coverage', () => {
  const variants = ['primary', 'secondary', 'inverse', 'ghost', 'destructive', 'link'];

  it.each(variants)('%s remaps every state Charm paints', (variant) => {
    const block = buttonStyles.cssText.match(
      new RegExp(`:host\\(\\[variant='${variant}'\\]\\)\\s*\\{([^}]*)\\}`),
    );
    expect(block).not.toBeNull();

    // Charm repaints the surface on focus and on aria-pressed as well as on
    // hover/active/disabled. A variant that misses one snaps back to the
    // default treatment in that state.
    for (const state of ['hover', 'active', 'disabled', 'focus', 'pressed']) {
      expect(block?.[1]).toContain(`--zd-button-${state}-bg-color:`);
      expect(block?.[1]).toContain(`--zd-button-${state}-fg-color:`);
    }
  });
});

describe('badge variant coverage', () => {
  const variants = [
    'neutral',
    'inverse',
    'info',
    'success',
    'warning',
    'danger',
    'caution',
    'brand',
  ];

  it.each(variants)('%s remaps the fill and foreground', (variant) => {
    const block = badgeStyles.cssText.match(
      new RegExp(`:host\\(\\[variant='${variant}'\\]\\)\\s*\\{([^}]*)\\}`),
    );
    expect(block?.[1]).toContain(`--zd-badge-bg-color: var(--zd-badge-${variant}-bg-color)`);
    expect(block?.[1]).toContain(`--zd-badge-fg-color: var(--zd-badge-${variant}-fg-color)`);
  });
});

const SMALL_BLOCK = /:host\(\[size='small'\]\)\s*\{([^}]*)\}/;

/**
 * `size` is implemented the same way as `variant`, so it carries the same
 * constraint: the block re-points custom properties and nothing else. `default`
 * needs no block at all - an omitted `size` and `size="default"` both fall
 * through to the base metrics.
 */
describe.each([
  { component: 'button', styles: buttonStyles.cssText },
  { component: 'checkbox', styles: checkboxStyles.cssText },
  { component: 'radio', styles: radioStyles.cssText },
  { component: 'input', styles: inputStyles.cssText },
  { component: 'text-area', styles: textAreaStyles.cssText },
])('$component size="small"', ({ styles }) => {
  it('re-points flat properties rather than restating Charm selectors', () => {
    const lines = declarations(styles, SMALL_BLOCK);

    expect(lines).not.toBeNull();
    expect(lines?.length).toBeGreaterThan(0);
    expect(lines?.every((line) => line.startsWith('--zd-'))).toBe(true);
  });

  it('points every property at a small token, never at a hardcoded value', () => {
    // A literal here means the compact metric lives in this stylesheet instead
    // of the theme, which is what the `<component>.small` token groups exist to
    // prevent.
    for (const line of declarations(styles, SMALL_BLOCK) ?? []) {
      expect(line).toMatch(/:\s*var\(--zd-[a-z0-9-]*small-[a-z0-9-]+\)$/);
    }
  });
});

/**
 * The icon is the one exception to the re-point rule. Charm's icon has no size
 * token of its own - it's a `1em` box - so the only lever is `font-size` on the
 * host, and all three steps set it including `default`.
 */
describe('icon size steps', () => {
  it.each([
    { size: 'small', token: '--zd-icon-small-size' },
    { size: 'default', token: '--zd-icon-size' },
    { size: 'large', token: '--zd-icon-large-size' },
  ])('$size sets font-size from $token', ({ size, token }) => {
    const lines = declarations(
      iconStyles.cssText,
      new RegExp(`:host\\(\\[size='${size}'\\]\\)\\s*\\{([^}]*)\\}`),
    );

    expect(lines).toEqual([`font-size: var(${token})`]);
  });
});
