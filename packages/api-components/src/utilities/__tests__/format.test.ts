import { describe, expect, it } from 'vitest';
import { formatCount } from '../format.js';

describe('formatCount', () => {
  it('formats integers with locale separators', () => {
    const formatted = formatCount(1200);

    expect(formatted).toMatch(/1.?200/);
  });

  it('returns small numbers unchanged', () => {
    expect(formatCount(42)).toBe('42');
    expect(formatCount(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    const formatted = formatCount(-1500);

    expect(formatted).toMatch(/-1.?500/);
  });
});
