/**
 * No options on purpose: the default is what turns 1200 into the reader's own `1,200` or
 * `1.200` or `1 200`. Separators come from their locale, never from us (I18N-002).
 */
const countLabel = new Intl.NumberFormat();

/**
 * A count as the reader's locale writes it — result totals, page numbers, appointment counts.
 *
 * Shared so those three read the same on one page. They are rendered by components a host can
 * use together, and a total with separators above a page number without them looks like a bug
 * in the embedding site.
 */
export function formatCount(value: number): string {
  return countLabel.format(value);
}
