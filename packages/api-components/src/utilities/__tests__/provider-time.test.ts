import { describe, expect, it } from 'vitest';
import { addDays, dayKey, isValidDate, providerLocalTime, todayDayKey } from '../provider-time.js';

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

describe('dayKey', () => {
  /**
   * The reason this is string surgery and not date arithmetic: a late slot has to stay on the
   * provider's day no matter which zone reads it, and 9pm Eastern is the next morning in UTC.
   */
  it('keeps a late slot on the provider’s own day', () => {
    expect(dayKey('2026-08-05T21:30:00-04:00')).toBe('2026-08-05');
  });

  it('leaves a bare day key alone', () => {
    expect(dayKey('2026-08-05')).toBe('2026-08-05');
  });
});

describe('todayDayKey', () => {
  /** Local parts, not `toISOString()` — which names tomorrow west of Greenwich in the evening. */
  it('reports the browser’s own calendar date', () => {
    const now = new Date();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');

    expect(todayDayKey()).toBe(`${now.getFullYear()}-${month}-${day}`);
  });
});

describe('addDays', () => {
  it('moves forward and back by whole days', () => {
    expect(addDays('2026-08-05', 14)).toBe('2026-08-19');
    expect(addDays('2026-08-05', -14)).toBe('2026-07-22');
    expect(addDays('2026-08-05', 0)).toBe('2026-08-05');
  });

  it('crosses a month and a year boundary', () => {
    expect(addDays('2026-08-25', 10)).toBe('2026-09-04');
    expect(addDays('2026-12-28', 7)).toBe('2027-01-04');
  });

  /**
   * The window pager steps by whole days across whatever DST transition falls inside it. In US
   * Eastern, 2026-11-01 is the fall-back — local arithmetic here would land at 23:00 the previous
   * evening and shift every following day of the window back by one.
   */
  it('steps cleanly across a daylight-saving transition', () => {
    expect(addDays('2026-10-31', 2)).toBe('2026-11-02');
    expect(addDays('2026-03-07', 2)).toBe('2026-03-09');
  });

  /** A `start-date` a host page set by hand goes nowhere rather than becoming `NaN-NaN-NaN`. */
  it('returns unparseable input unchanged', () => {
    expect(addDays('next tuesday', 7)).toBe('next tuesday');
  });
});
