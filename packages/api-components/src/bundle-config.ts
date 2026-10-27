/**
 * Reading the bundle's configuration from `<meta>` tags in the page.
 *
 * Kept apart from `bundle.ts` so it can be tested without evaluating that entry, which registers
 * every element as a side effect.
 */

export const SANDBOX_BASE_URL = 'https://api-developer-sandbox.zocdoc.com';

export const META_NAMES = {
  apiKey: 'zocdoc-api-key',
  baseUrl: 'zocdoc-api-base-url',
  mock: 'zocdoc-api-mock',
} as const;

export type BundleConfig =
  | { mode: 'live'; baseUrl: string; token: string }
  | { mode: 'mock' }
  | { mode: 'none' };

function meta(doc: Document, name: string): HTMLMetaElement | null {
  return doc.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
}

/**
 * The API key wins over the mock tag, so a page left with both never quietly serves sample data.
 * An empty `content` counts as absent.
 */
export function readBundleConfig(doc: Document = document): BundleConfig {
  const token = meta(doc, META_NAMES.apiKey)?.content;
  if (token) {
    return {
      mode: 'live',
      baseUrl: meta(doc, META_NAMES.baseUrl)?.content || SANDBOX_BASE_URL,
      token,
    };
  }

  return meta(doc, META_NAMES.mock) ? { mode: 'mock' } : { mode: 'none' };
}
