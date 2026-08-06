/**
 * Re-anchors an API timestamp's wall clock to UTC.
 *
 * `start_time` carries the *provider's* UTC offset, and the appointment is whatever the
 * provider's clock says: a patient in Los Angeles books the 9:00 slot of a New York
 * practice, not a 6:00 one. `new Date(start_time)` would re-express that instant in the
 * browser's zone, shifting the displayed time and, near midnight, the day it belongs to.
 *
 * Dropping the offset and reading the remainder as UTC keeps the digits the provider's
 * own. Paired with `timeZone: 'UTC'` on the caller's formatter, `Intl` still supplies the
 * user's locale conventions — 12- versus 24-hour, translated weekday and month names — so
 * only the instant is pinned, not the presentation (I18N-002). A formatter that omits that
 * option undoes the whole thing, which is why the two belong together.
 *
 * Also accepts a bare `YYYY-MM-DD` day key, which needs the time added: appending `Z` to a
 * date-only string is not a form the spec requires engines to parse.
 *
 * Returns an invalid `Date` for input it cannot parse, exactly as `new Date()` does.
 * Callers that read a value a host page set by hand should check `isValidDate` before
 * formatting, since `Intl.DateTimeFormat.format` throws on one.
 */
export function providerLocalTime(isoTime: string): Date {
  const wallClock = isoTime.replace(/(?:Z|[+-]\d{2}:?\d{2})$/, '');
  return new Date(wallClock.includes('T') ? `${wallClock}Z` : `${wallClock}T00:00:00Z`);
}

/** Guards `Intl.DateTimeFormat.format`, which throws a `RangeError` on an invalid date. */
export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

/**
 * The day an API timestamp belongs to, as `YYYY-MM-DD`.
 *
 * Taken off the front of the string rather than from a parsed `Date`, so a slot belongs to
 * the day the *provider* calls it. A 9pm Eastern slot read in Berlin would otherwise move to
 * the following morning and split one evening across two days.
 */
export function dayKey(isoTime: string): string {
  return isoTime.slice(0, 10);
}

/**
 * Today as a `YYYY-MM-DD` day key, read from the browser's local date.
 *
 * `toISOString()` would use UTC and, for anyone west of Greenwich in the evening, name
 * tomorrow — asking for a window that starts a day late and dropping the rest of today's
 * slots. This is a wire format rather than anything a user reads, so I18N-002 does not apply.
 */
export function todayDayKey(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * A day key `days` later, which may be negative to go back.
 *
 * Done in UTC — via {@link providerLocalTime}, so a bare key is read as midnight — because
 * these keys are calendar dates with no zone of their own. Local arithmetic would land an hour
 * either side of midnight on a DST boundary and shift the whole window by a day. Returns the
 * key unchanged if it is not one this can parse, so a bad `start-date` attribute produces a
 * window that goes nowhere rather than a run of `NaN-NaN-NaN`.
 */
export function addDays(key: string, days: number): string {
  const date = providerLocalTime(key);
  if (!isValidDate(date)) return key;

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Built once rather than per render, and pinned to UTC so it reports the provider's own wall
 * clock — see {@link providerLocalTime}. `undefined` for the locale means the user's, which
 * is what supplies the translated weekday and month and the 12- or 24-hour clock (I18N-002).
 *
 * The year is here where the availability picker's formatter omits it: a picker only ever
 * shows the next few weeks, while a confirmation is something a patient keeps.
 */
const appointmentLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

/**
 * A whole appointment time for display, or `undefined` when there is nothing trustworthy to
 * format.
 *
 * `undefined` rather than a thrown error or a placeholder because both callers render this
 * inside a template: `start-time` is an attribute a host page can set by hand, and
 * `Intl.DateTimeFormat.format` throws a `RangeError` on an invalid date, which would take
 * the surrounding markup down with it. Dropping one line beats showing none.
 *
 * Shared so the line the patient reads before entering their details and the line on their
 * confirmation are the same sentence about the same instant.
 */
export function formatAppointmentTime(isoTime: string | undefined): string | undefined {
  if (!isoTime) return undefined;

  const start = providerLocalTime(isoTime);
  return isValidDate(start) ? appointmentLabel.format(start) : undefined;
}
