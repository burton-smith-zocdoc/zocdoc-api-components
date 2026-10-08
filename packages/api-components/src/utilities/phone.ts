/**
 * An RFC 3966 `tel:` URI for a number the API returned in whatever shape the practice
 * typed it — `(555) 555-0100`, `555.555.0100`, `+1 555 555 0100`.
 *
 * Everything but digits and a leading `+` is stripped, because a dialler handed the
 * punctuation may refuse the whole URI. The extension goes in `;ext=` rather than into the
 * number: appended to the digits it would be dialled as part of the number and reach nobody.
 *
 * Returns `undefined` when nothing dialable survives, so a number of "call for details" does
 * not become a link that dials the empty string.
 */
export function telHref(
  number: string | null | undefined,
  extension?: string | null
): string | undefined {
  if (!number) return undefined;

  const digits = number.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  if (!/\d/.test(digits)) return undefined;

  const ext = extension?.replace(/\D/g, '');
  return ext ? `tel:${digits};ext=${ext}` : `tel:${digits}`;
}

/**
 * A number as a patient should read it, extension included.
 *
 * The appointment response documents `location_phone_number` as an "unformatted 10 digit
 * phone number", so exactly ten digits are grouped the North American way. Anything else is
 * returned as given: the provider-location numbers arrive already punctuated, and guessing at
 * the grouping of an 11-digit or international number is how a correct number gets misread.
 *
 * The extension is part of the same string rather than a sibling element, so "ext. 2" cannot
 * wrap onto its own line reading as a different number, and stays in one text node for
 * browser translation (I18N-004).
 */
export function displayPhone(number: string, extension?: string | null): string {
  const trimmed = number.trim();
  const grouped = /^\d{10}$/.test(trimmed)
    ? `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`
    : trimmed;

  const ext = extension?.trim();
  return ext ? `${grouped} ext. ${ext}` : grouped;
}
