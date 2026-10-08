import { describe, expect, it } from 'vitest';
import { displayPhone, telHref } from '../phone.js';

/** Fictional `555-01xx` numbers only — the range reserved for exactly this (PHI-002). */
describe('telHref', () => {
  it('strips the punctuation a practice typed', () => {
    expect(telHref('(555) 555-0100')).toBe('tel:5555550100');
    expect(telHref('555.555.0100')).toBe('tel:5555550100');
  });

  it('keeps a leading + and drops any other', () => {
    expect(telHref('+1 555 555 0100')).toBe('tel:+15555550100');
    expect(telHref('1+555 555 0100')).toBe('tel:15555550100');
  });

  it('puts the extension in ;ext= rather than the number', () => {
    expect(telHref('5555550100', '2')).toBe('tel:5555550100;ext=2');
    expect(telHref('5555550100', 'x 12')).toBe('tel:5555550100;ext=12');
  });

  it('ignores an extension with no digits in it', () => {
    expect(telHref('5555550100', null)).toBe('tel:5555550100');
    expect(telHref('5555550100', '  ')).toBe('tel:5555550100');
  });

  it('returns undefined when nothing dialable survives', () => {
    expect(telHref(undefined)).toBeUndefined();
    expect(telHref(null)).toBeUndefined();
    expect(telHref('')).toBeUndefined();
    expect(telHref('call for details')).toBeUndefined();
  });
});

/**
 * The appointment response documents its number as "unformatted 10 digit", so a patient
 * would otherwise read `5555550100` as one long string.
 */
describe('displayPhone', () => {
  it('groups an unformatted 10-digit number', () => {
    expect(displayPhone('5555550100')).toBe('(555) 555-0100');
  });

  it('appends the extension in the same string', () => {
    expect(displayPhone('5555550100', '2')).toBe('(555) 555-0100 ext. 2');
  });

  /*
   * Anything else is left as the practice gave it: guessing at the grouping of an
   * international or 11-digit number is how a correct number becomes a misread one.
   */
  it('leaves anything that is not exactly 10 digits as given', () => {
    expect(displayPhone('(555) 555-0100')).toBe('(555) 555-0100');
    expect(displayPhone('+44 20 7946 0000')).toBe('+44 20 7946 0000');
    expect(displayPhone('15555550100')).toBe('15555550100');
  });

  it('trims the number and the extension', () => {
    expect(displayPhone(' 5555550100 ', ' 2 ')).toBe('(555) 555-0100 ext. 2');
  });

  it('ignores a blank extension', () => {
    expect(displayPhone('5555550100', ' ')).toBe('(555) 555-0100');
    expect(displayPhone('5555550100', null)).toBe('(555) 555-0100');
  });
});
