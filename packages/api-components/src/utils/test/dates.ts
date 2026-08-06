/**
 * Date arithmetic for fixtures, kept deliberately separate from the components'
 * own `internal/provider-time.js`.
 *
 * Reimplemented rather than imported: a bug in the component's helper would move
 * the fixtures and the assertions together, and the tests would agree with it.
 * That independence is the point of this module, so **don't refactor it to call
 * `todayDayKey`/`addDays`** — the duplication is the oracle.
 */

/**
 * A `YYYY-MM-DD` key relative to today.
 *
 * Read off the local date rather than through `toISOString`, which uses UTC and
 * would name tomorrow for anyone west of Greenwich in the evening.
 *
 * Fixtures have to be relative because the availability window always starts at
 * today: a hard-coded date falls outside the window tomorrow, and every count
 * reads zero.
 */
export function dayFromToday(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
