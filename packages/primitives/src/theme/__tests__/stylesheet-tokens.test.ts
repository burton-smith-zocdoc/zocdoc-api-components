/// <reference types="vite/client" />
import type { CSSResult } from 'lit';
import { describe, expect, it } from 'vitest';
import { sheet, tokenReferences } from '../../test/css.js';
import { zocdocThemeCss } from '../zocdoc.js';

/**
 * Every `var(--zd-…)` in every component stylesheet has to name a property the
 * theme actually declares. The failure mode is silent: an unresolvable custom
 * property is invalid at computed-value time, so a renamed token produces no
 * build error and no console warning, just an unstyled component.
 *
 * The stylesheets are discovered, not listed. This check has to hold for all of
 * them, and a hand-maintained array stops covering whatever nobody remembered to
 * add - which is exactly what happened before this test was split out, where
 * eight of the stylesheets were listed and `accordion-item` was not.
 */
const stylesheets = import.meta.glob<{ default: CSSResult }>('../../components/*/*.styles.ts', {
  eager: true,
});

/** Every custom property the theme declares. */
const declared = new Set(
  [...zocdocThemeCss.matchAll(/(--zd-[a-z0-9-]+)\s*:/g)].map((match) => match[1])
);

const cases = Object.entries(stylesheets).map(([path, module]) => ({
  component: /components\/([^/]+)\//.exec(path)?.[1] ?? path,
  css: sheet(module.default),
}));

describe('component stylesheet tokens', () => {
  /**
   * A glob that silently stops matching would leave every case below vacuously
   * passing. This is a floor against that, not a component count - it does not
   * need updating when a component is added.
   */
  it('discovers the component stylesheets', () => {
    expect(cases.length).toBeGreaterThan(30);
  });

  it('reads a non-empty theme to compare against', () => {
    expect(declared.size).toBeGreaterThan(100);
  });

  it.each(cases)('$component references only tokens the theme declares', ({ css }) => {
    const unresolvable = tokenReferences(css)
      .filter(({ name, fallback }) =>
        fallback ? !declared.has(name) && !declared.has(fallback) : !declared.has(name)
      )
      .map(({ name }) => name);

    expect(unresolvable).toEqual([]);
  });
});
