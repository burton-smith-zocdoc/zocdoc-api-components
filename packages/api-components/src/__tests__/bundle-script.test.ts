import { afterEach, describe, expect, it } from 'vitest';
import { findBundleScript, readBundleScriptConfig, SANDBOX_BASE_URL } from '../bundle-script.js';

const BUNDLE_URL = 'https://cdn.example.test/zocdoc/zocdoc.esm.js';

/** Built in a detached document so nothing here is fetched or run. */
function page(markup: string): Document {
  return new DOMParser().parseFromString(`<!doctype html><body>${markup}`, 'text/html');
}

function script(attributes: string): HTMLScriptElement {
  const found = page(`<script ${attributes}></script>`).querySelector('script');
  if (!found) {
    throw new Error('fixture markup has no script');
  }
  return found;
}

describe('findBundleScript', () => {
  afterEach(() => {
    document.querySelectorAll('script[data-fixture]').forEach((element) => element.remove());
  });

  it('finds the module script whose src is the bundle URL', () => {
    const doc = page(`
      <script type="module" src="https://cdn.example.test/other.js" zd-mock></script>
      <script type="module" src="${BUNDLE_URL}" zd-token="t"></script>
    `);

    expect(findBundleScript(BUNDLE_URL, doc)?.getAttribute('zd-token')).toBe('t');
  });

  it('falls back to the one configured module script when src was redirected', () => {
    const doc = page(`
      <script type="module" src="https://cdn.example.test/app.js"></script>
      <script type="module" src="https://cdn.example.test/zocdoc/latest" zd-token="t"></script>
    `);

    expect(findBundleScript(BUNDLE_URL, doc)?.getAttribute('zd-token')).toBe('t');
  });

  it('refuses to guess between two configured module scripts', () => {
    const doc = page(`
      <script type="module" src="https://cdn.example.test/a.js" zd-token="a"></script>
      <script type="module" src="https://cdn.example.test/b.js" zd-token="b"></script>
    `);

    expect(findBundleScript(BUNDLE_URL, doc)).toBeUndefined();
  });

  it('ignores classic scripts, which the IIFE build finds through currentScript instead', () => {
    const doc = page(`<script src="${BUNDLE_URL}" zd-token="t"></script>`);

    expect(findBundleScript(BUNDLE_URL, doc)).toBeUndefined();
  });

  it('prefers document.currentScript when a classic script is running', () => {
    const element = document.createElement('script');
    element.dataset.fixture = '';
    element.setAttribute('zd-token', 'from-current');

    let found: HTMLScriptElement | undefined;
    const capture = (): void => {
      found = findBundleScript(BUNDLE_URL);
    };
    // A classic inline script is the only place currentScript is set, so it calls back out.
    Object.assign(window, { __captureBundleScript: capture });
    element.textContent = 'window.__captureBundleScript();';
    document.body.append(element);
    Reflect.deleteProperty(window, '__captureBundleScript');

    expect(found).toBe(element);
  });
});

describe('readBundleScriptConfig', () => {
  it('reads a token and defaults the base URL to the developer sandbox', () => {
    expect(readBundleScriptConfig(script('zd-token="t"'))).toEqual({
      mode: 'live',
      baseUrl: SANDBOX_BASE_URL,
      token: 't',
    });
  });

  it('honors zd-base-url', () => {
    expect(
      readBundleScriptConfig(script('zd-token="t" zd-base-url="https://api.example.test"'))
    ).toEqual({ mode: 'live', baseUrl: 'https://api.example.test', token: 't' });
  });

  it('lets zd-token win over zd-mock', () => {
    expect(readBundleScriptConfig(script('zd-token="t" zd-mock')).mode).toBe('live');
  });

  it('uses the mock when only zd-mock is present', () => {
    expect(readBundleScriptConfig(script('zd-mock'))).toEqual({ mode: 'mock' });
  });

  it('treats an empty token as absent', () => {
    expect(readBundleScriptConfig(script('zd-token=""'))).toEqual({ mode: 'none' });
  });

  it('configures nothing without a script', () => {
    expect(readBundleScriptConfig(undefined)).toEqual({ mode: 'none' });
  });
});
