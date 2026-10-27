import { describe, expect, it } from 'vitest';
import { readBundleConfig, SANDBOX_BASE_URL } from '../bundle-config.js';

/** Built in a detached document so nothing here is fetched or run. */
function page(head: string): Document {
  return new DOMParser().parseFromString(`<!doctype html><head>${head}</head>`, 'text/html');
}

describe('readBundleConfig', () => {
  it('reads the API key and defaults the base URL to the developer sandbox', () => {
    expect(readBundleConfig(page('<meta name="zocdoc-api-key" content="t">'))).toEqual({
      mode: 'live',
      baseUrl: SANDBOX_BASE_URL,
      token: 't',
    });
  });

  it('honors zocdoc-api-base-url', () => {
    const doc = page(`
      <meta name="zocdoc-api-key" content="t">
      <meta name="zocdoc-api-base-url" content="https://api.example.test">
    `);

    expect(readBundleConfig(doc)).toEqual({
      mode: 'live',
      baseUrl: 'https://api.example.test',
      token: 't',
    });
  });

  it('falls back to the sandbox when the base URL is empty', () => {
    const doc = page(`
      <meta name="zocdoc-api-key" content="t">
      <meta name="zocdoc-api-base-url" content="">
    `);

    expect(readBundleConfig(doc)).toMatchObject({ baseUrl: SANDBOX_BASE_URL });
  });

  it('lets the API key win over zocdoc-api-mock', () => {
    const doc = page(`
      <meta name="zocdoc-api-key" content="t">
      <meta name="zocdoc-api-mock" content="true">
    `);

    expect(readBundleConfig(doc).mode).toBe('live');
  });

  it('uses the mock when only zocdoc-api-mock is present', () => {
    expect(readBundleConfig(page('<meta name="zocdoc-api-mock" content="true">'))).toEqual({
      mode: 'mock',
    });
  });

  it('treats an empty API key as absent', () => {
    expect(readBundleConfig(page('<meta name="zocdoc-api-key" content="">'))).toEqual({
      mode: 'none',
    });
  });

  it('ignores the old script attributes', () => {
    const doc = page('<script src="zocdoc.js" zd-token="t" zd-mock></script>');

    expect(readBundleConfig(doc)).toEqual({ mode: 'none' });
  });

  it('configures nothing without meta tags', () => {
    expect(readBundleConfig(page(''))).toEqual({ mode: 'none' });
  });
});
