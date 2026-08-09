import { describe, expect, it } from 'vitest';
import { isLiteralUnion, normalizeUnion, resolveType, splitUnion } from './resolve-type.ts';

describe('splitUnion', () => {
  it('splits a flat union', () => {
    expect(splitUnion("'a' | 'b' | undefined")).toEqual(["'a'", "'b'", 'undefined']);
  });

  it('does not split inside braces', () => {
    expect(splitUnion("{ a: 'x' | 'y' }")).toEqual(["{ a: 'x' | 'y' }"]);
  });

  it('does not split inside generics', () => {
    expect(splitUnion('Record<string, A | B> | undefined')).toEqual([
      'Record<string, A | B>',
      'undefined',
    ]);
  });

  it('does not split inside a quoted literal', () => {
    expect(splitUnion("'a|b' | 'c'")).toEqual(["'a|b'", "'c'"]);
  });

  it('returns an empty array for empty input', () => {
    expect(splitUnion('   ')).toEqual([]);
  });
});

describe('isLiteralUnion', () => {
  it.each([
    ["'default' | 'small'", true],
    ["'a' | 'b' | undefined", true],
    ['1 | 2 | -3.5', true],
    ['false | true', false],
    ['true | undefined', false],
    ['ProviderLocation', false],
    ["'a' | SomeType", false],
    ['undefined', false],
    ['', false],
  ])('%s -> %s', (text, expected) => {
    expect(isLiteralUnion(text)).toBe(expected);
  });
});

describe('normalizeUnion', () => {
  it('dedupes repeated members', () => {
    expect(normalizeUnion('PopupPlacement | undefined | undefined')).toBe(
      'PopupPlacement | undefined'
    );
  });

  it('sorts nullish members last', () => {
    expect(normalizeUnion("undefined | 'a' | null | 'b'")).toBe("'a' | 'b' | undefined | null");
  });

  it('leaves a non-union untouched', () => {
    expect(normalizeUnion('Record<string, string>')).toBe('Record<string, string>');
  });
});

describe('resolveType', () => {
  it('prefers parsedType for an opaque alias that expands to a literal union', () => {
    expect(
      resolveType({
        type: { text: 'ZdControlSize | undefined' },
        parsedType: { text: "'default' | 'small' | undefined" },
      })
    ).toBe("'default' | 'small' | undefined");
  });

  it('keeps text when it is already a literal union', () => {
    expect(
      resolveType({
        type: { text: "'strip' | 'stacked'" },
        parsedType: { text: "'stacked' | 'strip'" },
      })
    ).toBe("'strip' | 'stacked'");
  });

  it('rejects boolean expansion', () => {
    expect(resolveType({ type: { text: 'boolean' }, parsedType: { text: 'false | true' } })).toBe(
      'boolean'
    );
  });

  it('rejects an object expansion', () => {
    expect(
      resolveType({
        type: { text: 'ProviderLocation' },
        parsedType: { text: '{ id: string, name: string }' },
      })
    ).toBe('ProviderLocation');
  });

  it('rejects the collapsed index signature', () => {
    expect(
      resolveType({ type: { text: 'Record<string, string>' }, parsedType: { text: '{ }' } })
    ).toBe('Record<string, string>');
  });

  it('falls back to text when parsedType is absent', () => {
    expect(resolveType({ type: { text: 'HTMLFormElement' } })).toBe('HTMLFormElement');
  });

  it('reports unknown when there is no type at all', () => {
    expect(resolveType({})).toBe('unknown');
  });
});
