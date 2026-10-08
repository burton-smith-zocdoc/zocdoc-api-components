/**
 * The `href` for an appointment's video waiting room, or `undefined` when there is nothing
 * safe to link to.
 *
 * `waiting_room_path` is documented as a "patient facing url" without saying whether it is
 * absolute, and the only live booking returned `null`. So only an absolute `https:` URL is
 * accepted:
 *
 * - **A bare path is rejected, not resolved.** Resolved against the embedding page it would
 *   point at the partner's own site, which is a link to somewhere that is not the waiting room.
 * - **Every other scheme is rejected.** The value comes off the wire and lands in an `href`;
 *   `javascript:` there is script execution, and `http:` would send the patient's link in the
 *   clear.
 *
 * The URL is specific to one patient's appointment, which is why the components that render
 * it take it as a property and never reflect it to an attribute (PHI-001).
 */
export function waitingRoomHref(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return undefined;
  }

  return url.protocol === 'https:' && url.hostname ? trimmed : undefined;
}
