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
