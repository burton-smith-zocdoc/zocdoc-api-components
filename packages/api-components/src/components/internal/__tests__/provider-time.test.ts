import { describe, expect, it } from 'vitest';
import { isValidDate, providerLocalTime } from '../provider-time.js';

describe('providerLocalTime', () => {
  /**
   * The whole reason the function exists. Read as UTC, the digits are the practice's own, so
   * a patient anywhere sees the hour the practice means (I18N-002).
   */
  it('keeps the provider’s wall clock rather than re-expressing the instant', () => {
    const time = providerLocalTime('2026-08-05T09:00:00-04:00');

    expect(time.getUTCHours()).toBe(9);
    expect(time.getUTCMinutes()).toBe(0);
    expect(time.getUTCDate()).toBe(5);
  });

  it('handles a positive offset and a trailing Z the same way', () => {
    expect(providerLocalTime('2026-08-05T09:00:00+09:00').getUTCHours()).toBe(9);
    expect(providerLocalTime('2026-08-05T09:00:00Z').getUTCHours()).toBe(9);
  });

  it('accepts an offset written without a colon', () => {
    expect(providerLocalTime('2026-08-05T09:00:00-0400').getUTCHours()).toBe(9);
  });

  /**
   * The availability picker keys its day strip by `YYYY-MM-DD`. Appending `Z` to a date-only
   * string is not a form engines are required to parse, so the time has to be filled in.
   */
  it('reads a bare day key as midnight on that day', () => {
    const day = providerLocalTime('2026-08-05');

    expect(isValidDate(day)).toBe(true);
    expect(day.getUTCDate()).toBe(5);
    expect(day.getUTCHours()).toBe(0);
  });

  /*
   * Callers format attribute values a host page set by hand, and
   * `Intl.DateTimeFormat.format` throws a RangeError on an invalid date. This pair is what
   * lets them check first instead.
   */
  it('reports unparseable input as an invalid date', () => {
    expect(isValidDate(providerLocalTime('whenever'))).toBe(false);
    expect(isValidDate(providerLocalTime(''))).toBe(false);
  });
});
