/** Identifies the components as the source of a visit, per Zocdoc's referrer standard (TS-019). */
const REFERRER_TYPE = 'api_components';

function isZocdocHost(hostname: string): boolean {
  return hostname === 'zocdoc.com' || hostname.endsWith('.zocdoc.com');
}

/**
 * The `href` that hands a visitor off to Zocdoc, or `undefined` when the URL isn't one to follow.
 *
 * `booking_url` and `profile_url` come from data a page supplied, so the URL is checked before it
 * lands in an `href` or a navigation:
 *
 * - **Absolute `https:` only.** A bare or protocol-relative path would resolve against the
 *   embedding page, and `javascript:` there is script execution.
 * - **Zocdoc hosts only.** `zocdoc.com` or a subdomain of it. A lookalike such as
 *   `zocdoc.com.example.test` fails the suffix check, and a URL carrying credentials is rejected,
 *   since `user@host` is a common way to disguise where a link goes.
 *
 * The referrer params are set rather than appended, so a URL that already carries them doesn't end
 * up with two. Nothing else is added: they say which component sent the visit, never who (PHI-003).
 */
export function handoffHref(url: string | null | undefined, component: string): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== 'https:' || !isZocdocHost(parsed.hostname)) return undefined;
  if (parsed.username || parsed.password) return undefined;

  parsed.searchParams.set('referrerType', REFERRER_TYPE);
  parsed.searchParams.set('component', component);
  return parsed.href;
}

/**
 * Follows a handoff `href` produced by `handoffHref`.
 *
 * Inside an iframe, as in a chat host's sandboxed widget, navigating the frame would load Zocdoc
 * inside it, so the visit opens in a new tab with no opener or referrer instead. At top level the
 * page itself navigates.
 */
export function navigateTo(href: string): void {
  if (window.self !== window.top) {
    window.open(href, '_blank', 'noopener,noreferrer');
  } else {
    window.location.assign(href);
  }
}
