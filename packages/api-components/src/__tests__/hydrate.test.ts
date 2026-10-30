import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  afterDocumentParsed,
  applyHydratedProps,
  readHydratedProps,
} from '../utilities/hydrate.js';

/** Invented values, not anybody's (PHI-002). */
const PROVIDERS = [{ provider_id: 'pr_test-1' }, { provider_id: 'pr_test-2' }];

/** A host with one `<script type="application/json" data-zd-prop>` child per entry. */
function host(blocks: Record<string, string>, tag = 'zd-provider-results'): HTMLElement {
  const el = document.createElement(tag);
  for (const [name, text] of Object.entries(blocks)) {
    const script = document.createElement('script');
    script.type = 'application/json';
    script.dataset.zdProp = name;
    script.textContent = text;
    el.append(script);
  }
  return el;
}

describe('readHydratedProps', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads an allow-listed array block', () => {
    const el = host({ providers: JSON.stringify(PROVIDERS) });
    expect(readHydratedProps(el, { providers: 'array' })).toEqual({ providers: PROVIDERS });
  });

  it('reads an allow-listed object block', () => {
    const el = host({ location: '{"location_id":"lo_test-1"}' });
    expect(readHydratedProps(el, { location: 'object' })).toEqual({
      location: { location_id: 'lo_test-1' },
    });
  });

  it('ignores a name not on the allow-list', () => {
    const el = host({ providers: '[]', patient: '{"first_name":"Test"}' });
    expect(readHydratedProps(el, { providers: 'array' })).toEqual({ providers: [] });
  });

  it('ignores malformed JSON and warns without content', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = host({ providers: '[{"provider_id":"pr_test-1"' });

    expect(readHydratedProps(el, { providers: 'array' })).toEqual({});
    expect(warn).toHaveBeenCalledOnce();
    const logged = warn.mock.calls[0].map(String).join(' ');
    expect(logged).toContain('zd-provider-results');
    expect(logged).toContain('providers');
    expect(logged).not.toContain('pr_test-1');
  });

  it('ignores a block whose shape does not match', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = host({ providers: '{"provider_id":"pr_test-1"}', location: '[]' });

    expect(readHydratedProps(el, { providers: 'array', location: 'object' })).toEqual({});
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls.flat().map(String).join(' ')).not.toContain('pr_test-1');
  });

  it('treats null as neither shape', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = host({ location: 'null', providers: 'null' });
    expect(readHydratedProps(el, { location: 'object', providers: 'array' })).toEqual({});
  });

  it('ignores nested blocks', () => {
    const el = document.createElement('zd-provider-results');
    el.append(host({ providers: JSON.stringify(PROVIDERS) }, 'div'));
    expect(readHydratedProps(el, { providers: 'array' })).toEqual({});
  });

  it('ignores a script that is not application/json', () => {
    const el = host({ providers: '[]' });
    el.querySelector('script')!.type = 'text/javascript';
    expect(readHydratedProps(el, { providers: 'array' })).toEqual({});
  });

  it('keeps the first block for a duplicate name', () => {
    const el = host({ providers: JSON.stringify(PROVIDERS) });
    el.append(host({ providers: '[]' }).firstElementChild!);
    expect(readHydratedProps(el, { providers: 'array' })).toEqual({ providers: PROVIDERS });
  });

  // A server embedding JSON in HTML escapes `</script>` so the block can't end early.
  it('parses an escaped <\\/script> sequence', () => {
    const el = host({ providers: '[{"provider_id":"pr_test-1","bio":"<\\/script>"}]' });
    expect(readHydratedProps(el, { providers: 'array' })).toEqual({
      providers: [{ provider_id: 'pr_test-1', bio: '</script>' }],
    });
  });

  it('does not treat an inherited name as allow-listed', () => {
    const el = host({ toString: '[]' });
    expect(readHydratedProps(el, { providers: 'array' })).toEqual({});
  });
});

describe('applyHydratedProps', () => {
  it('assigns values the host has not set and reports that it did', () => {
    const el = document.createElement('div') as HTMLElement & { providers?: unknown };
    expect(applyHydratedProps(el, { providers: PROVIDERS })).toBe(true);
    expect(el.providers).toBe(PROVIDERS);
  });

  it('keeps a property already set and returns false when nothing was applied', () => {
    const set = [{ provider_id: 'pr_test-3' }];
    const el = document.createElement('div') as HTMLElement & { providers?: unknown };
    el.providers = set;

    expect(applyHydratedProps(el, { providers: PROVIDERS })).toBe(false);
    expect(el.providers).toBe(set);
  });

  it('returns false for no values', () => {
    expect(applyHydratedProps(document.createElement('div'), {})).toBe(false);
  });
});

describe('afterDocumentParsed', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the update at once when the document has been parsed', () => {
    const update = vi.fn<() => string>(() => 'ran');
    expect(afterDocumentParsed({ hasUpdated: false }, update)).toBe('ran');
  });

  it('holds a first update until DOMContentLoaded while the document is still parsing', async () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const update = vi.fn<() => void>();

    const pending = afterDocumentParsed({ hasUpdated: false }, update);
    await Promise.resolve();
    expect(update).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('DOMContentLoaded'));
    await pending;
    expect(update).toHaveBeenCalledOnce();
  });

  it('never holds a later update', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const update = vi.fn<() => void>();
    afterDocumentParsed({ hasUpdated: true }, update);
    expect(update).toHaveBeenCalledOnce();
  });
});
