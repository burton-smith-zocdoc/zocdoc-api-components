import { afterEach, describe, expect, it, type Mock, vi } from 'vitest';
import { handoffHref, navigateTo } from '../handoff.js';

/** An invented profile path, not a real provider (PHI-002). */
const PROFILE = 'https://www.zocdoc.com/doctor/test-provider-12345';

describe('handoffHref', () => {
  it('adds the referrer params to a Zocdoc URL', () => {
    const href = new URL(handoffHref(PROFILE, 'provider-card')!);
    expect(href.origin + href.pathname).toBe(PROFILE);
    expect(href.searchParams.get('referrerType')).toBe('api_components');
    expect(href.searchParams.get('component')).toBe('provider-card');
  });

  it('keeps an existing query and fragment', () => {
    const href = new URL(handoffHref(`${PROFILE}?insurance=ip_test#reviews`, 'provider-card')!);
    expect(href.searchParams.get('insurance')).toBe('ip_test');
    expect(href.searchParams.get('referrerType')).toBe('api_components');
    expect(href.hash).toBe('#reviews');
  });

  it('replaces referrer params already on the URL rather than doubling them', () => {
    const href = new URL(
      handoffHref(`${PROFILE}?referrerType=other&component=x`, 'provider-results')!
    );
    expect(href.searchParams.getAll('referrerType')).toEqual(['api_components']);
    expect(href.searchParams.getAll('component')).toEqual(['provider-results']);
  });

  it('accepts the bare zocdoc.com host and trims whitespace', () => {
    expect(handoffHref('  https://zocdoc.com/x\n', 'provider-card')).toMatch(
      /^https:\/\/zocdoc\.com\/x\?/
    );
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['blank', '  '],
    ['a protocol-relative URL', '//www.zocdoc.com/x'],
    ['a bare path', '/doctor/x'],
    ['http:', 'http://www.zocdoc.com/x'],
    ['another host', 'https://evil.com/x'],
    ['a lookalike suffix', 'https://zocdoc.com.evil.com/x'],
    ['a lookalike prefix', 'https://evilzocdoc.com/x'],
    ['credentials in the URL', 'https://user@www.zocdoc.com/x'],
    ['javascript:', 'javascript:alert(1)'],
  ])('returns undefined for %s', (_, value) => {
    expect(handoffHref(value, 'provider-card')).toBeUndefined();
  });
});

type Stubs = { assign: Mock<Location['assign']>; open: Mock<Window['open']> };

/** A stand-in `window`, at top level or framed, recording where `navigateTo` sends the visitor. */
function stubWindow(framed: boolean): Stubs {
  const assign = vi.fn<Location['assign']>();
  const open = vi.fn<Window['open']>();
  const win: Record<string, unknown> = { location: { assign }, open };
  win.self = win;
  win.top = framed ? {} : win;
  vi.stubGlobal('window', win);
  return { assign, open };
}

describe('navigateTo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('navigates the page at top level', () => {
    const { assign, open } = stubWindow(false);
    navigateTo(PROFILE);
    expect(assign).toHaveBeenCalledWith(PROFILE);
    expect(open).not.toHaveBeenCalled();
  });

  it('opens a new tab without opener or referrer inside an iframe', () => {
    const { assign, open } = stubWindow(true);
    navigateTo(PROFILE);
    expect(open).toHaveBeenCalledWith(PROFILE, '_blank', 'noopener,noreferrer');
    expect(assign).not.toHaveBeenCalled();
  });
});
