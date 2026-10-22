/**
 * Parses a URL that came off the wire or out of a page, or returns `undefined` unless it is an
 * absolute `https:` URL with a host.
 *
 * A bare or protocol-relative path would resolve against the embedding page, `javascript:` in an
 * `href` is script execution, and `http:` sends the link in the clear, so only `https:` passes.
 */
export function parseHttpsUrl(value: string | null | undefined): URL | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return undefined;
  }
  return url.protocol === 'https:' && url.hostname ? url : undefined;
}
