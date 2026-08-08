import { describe, expect, it, vi } from 'vitest';
import {
  nextWindowStart,
  resolveWindowStart,
  windowEndDate,
  windowSpan,
} from '../availability-window.js';
import * as providerTime from '../provider-time.js';

describe('resolveWindowStart', () => {
  it('returns the provided date when valid', () => {
    expect(resolveWindowStart('2026-08-05')).toBe('2026-08-05');
  });

  it('falls back to today when no date is provided', () => {
    vi.spyOn(providerTime, 'todayDayKey').mockReturnValue('2026-08-07');

    expect(resolveWindowStart(undefined)).toBe('2026-08-07');
  });

  it('falls back to today for unparseable input', () => {
    vi.spyOn(providerTime, 'todayDayKey').mockReturnValue('2026-08-07');

    expect(resolveWindowStart('next week')).toBe('2026-08-07');
    expect(resolveWindowStart('')).toBe('2026-08-07');
  });
});

describe('windowEndDate', () => {
  it('returns the last day of the window inclusive', () => {
    expect(windowEndDate('2026-08-05', 14)).toBe('2026-08-18');
    expect(windowEndDate('2026-08-05', 7)).toBe('2026-08-11');
  });

  it('handles a one-day window', () => {
    expect(windowEndDate('2026-08-05', 1)).toBe('2026-08-05');
  });
});

describe('windowSpan', () => {
  it('returns the requested span when within bounds', () => {
    expect(windowSpan(7)).toBe(7);
    expect(windowSpan(14)).toBe(14);
  });

  it('clamps to the API maximum', () => {
    expect(windowSpan(100)).toBe(30);
  });

  it('returns 1 for zero or negative values', () => {
    expect(windowSpan(0)).toBe(1);
    expect(windowSpan(-5)).toBe(1);
  });

  it('returns 1 for NaN', () => {
    expect(windowSpan(NaN)).toBe(1);
  });
});

describe('nextWindowStart', () => {
  it('steps forward by the window span', () => {
    vi.spyOn(providerTime, 'todayDayKey').mockReturnValue('2026-08-01');

    expect(nextWindowStart('2026-08-05', 1, 14)).toBe('2026-08-19');
  });

  it('steps backward by the window span', () => {
    vi.spyOn(providerTime, 'todayDayKey').mockReturnValue('2026-08-01');

    expect(nextWindowStart('2026-08-19', -1, 14)).toBe('2026-08-05');
  });

  it('clamps to today when stepping back would go into the past', () => {
    vi.spyOn(providerTime, 'todayDayKey').mockReturnValue('2026-08-07');

    expect(nextWindowStart('2026-08-10', -1, 14)).toBe('2026-08-07');
  });

  it('returns the current start when already at today and stepping back', () => {
    vi.spyOn(providerTime, 'todayDayKey').mockReturnValue('2026-08-07');

    expect(nextWindowStart('2026-08-07', -1, 14)).toBe('2026-08-07');
  });
});
