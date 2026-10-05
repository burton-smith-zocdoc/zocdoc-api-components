import { describe, expect, it } from 'vitest';
import { generateLayoutElementsCss } from '../layout-elements.js';
import { zocdocSpacingTokens } from '../zocdoc.js';

const spacingTokens = { 0: '0', 8: '8px', 16: '16px' };

describe('layout element CSS', () => {
  it('sets explicit low-specificity display and flex defaults', () => {
    const css = generateLayoutElementsCss(spacingTokens);

    expect(css).toContain(':where(zd-flex) {');
    expect(css).toContain('display: flex;');
    expect(css).toContain('flex-direction: row;');
    expect(css).toContain('flex-wrap: nowrap;');
    expect(css).toContain(':where(zd-grid) {');
    expect(css).toContain('display: grid;');
  });

  it('generates token-backed gap selectors for both elements', () => {
    const css = generateLayoutElementsCss(spacingTokens);

    for (const [key, value] of Object.entries(spacingTokens)) {
      expect(css).toContain(`&:where([gap="${key}"])`);
      expect(css).toContain(`--zd-spacing-${key}, ${value}`);
    }
    expect(css.match(/&:where\(\[gap="[^"]+"\]\)/g)).toHaveLength(
      Object.keys(spacingTokens).length * 2
    );
    expect(css).not.toContain('&[gap=');
  });

  it('defaults flex direction and wrapping unless supported attributes are present', () => {
    const css = generateLayoutElementsCss(spacingTokens);

    expect(css).toContain('&:where([direction="column"])');
    expect(css).toContain('flex-direction: column;');
    expect(css).toContain('&:where([wrap])');
    expect(css).toContain('@attr {boolean} wrap - Allows items to wrap onto another line.');
    expect(css).toContain('flex-wrap: wrap;');
    expect(css).not.toContain('&:where([direction="row"])');
    expect(css).not.toContain('&:where([direction="invalid"])');
    expect(css).not.toContain('&:where([wrap="false"])');
    expect(css).not.toContain('&[direction=');
    expect(css).not.toContain('&[wrap]');
  });

  it('allows custom gap overrides and does not define child reordering', () => {
    const css = generateLayoutElementsCss(spacingTokens);

    expect(css).toContain('--zd-flex-gap: var(--zd-spacing-16, 16px);');
    expect(css).toContain('gap: var(--zd-flex-gap);');
    expect(css).toContain('--zd-grid-gap: var(--zd-spacing-16, 16px);');
    expect(css).toContain('gap: var(--zd-grid-gap);');
    expect(css).not.toMatch(/\border\s*:/);
    expect(css).not.toContain('row-reverse');
    expect(css).not.toContain('column-reverse');
  });
});

describe('layout element positioning', () => {
  const css = generateLayoutElementsCss(spacingTokens);

  it('maps flex align and justify attributes to flex alignment values', () => {
    expect(css).toContain('align-items: stretch;');
    expect(css).toContain('justify-content: flex-start;');
    expect(css).toContain('&:where([align="center"]) {\n    align-items: center;');
    expect(css).toContain('&:where([align="end"]) {\n    align-items: flex-end;');
    expect(css).toContain('&:where([align="baseline"]) {\n    align-items: baseline;');
    expect(css).toContain('&:where([justify="between"]) {\n    justify-content: space-between;');
    expect(css).toContain('&:where([justify="around"]) {\n    justify-content: space-around;');
    expect(css).toContain('&:where([justify="evenly"]) {\n    justify-content: space-evenly;');
  });

  it('supports inline display for both containers', () => {
    expect(css).toContain('&:where([inline]) {\n    display: inline-flex;');
    expect(css).toContain('&:where([inline]) {\n    display: inline-grid;');
  });

  it('creates equal grid tracks only for supported column counts', () => {
    for (const count of [1, 2, 3, 4, 6, 12]) {
      expect(css).toContain(
        `&:where([columns="${count}"]) {\n    grid-template-columns: repeat(${count}, minmax(0, 1fr));`
      );
    }
    expect(css).not.toContain('[columns="5"]');
    expect(css).toContain('&:where([justify="center"]) {\n    justify-items: center;');
  });

  it('places zd-column children with composable start and span rules', () => {
    expect(css).toContain(':where(zd-column) {');
    expect(css).toContain('min-inline-size: 0;');
    expect(css).toContain('&:where([column="3"]) {\n    grid-column-start: 3;');
    expect(css).toContain('&:where([row="2"]) {\n    grid-row-start: 2;');
    expect(css).toContain('&:where([span="12"]) {\n    grid-column-end: span 12;');
    expect(css).not.toMatch(/grid-column:\s/);
  });
});

describe('layout CSS spacing scale', () => {
  it('generates gap selectors from the canonical token keys', () => {
    const css = generateLayoutElementsCss(zocdocSpacingTokens);

    expect(css.match(/&:where\(\[gap="[^"]+"\]\)/g)).toHaveLength(
      Object.keys(zocdocSpacingTokens).length * 2
    );
    for (const [key, value] of Object.entries(zocdocSpacingTokens)) {
      expect(css.match(new RegExp(`&:where\\(\\[gap="${key}"\\]\\)`, 'g'))).toHaveLength(2);
      expect(css).toContain(`--zd-spacing-${key}, ${value}`);
    }

    const extendedCss = generateLayoutElementsCss({ ...zocdocSpacingTokens, 72: '72px' });
    expect(extendedCss.match(/&:where\(\[gap="72"\]\)/g)).toHaveLength(2);
  });
});
