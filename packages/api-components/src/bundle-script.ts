/**
 * Reading the bundle's configuration off the `<script>` tag that loaded it.
 *
 * Kept apart from `bundle.ts` so it can be tested without evaluating that entry, which registers
 * every element as a side effect.
 */

export const SANDBOX_BASE_URL = 'https://api-developer-sandbox.zocdoc.com';

const ATTRIBUTES = ['zd-token', 'zd-base-url', 'zd-mock'] as const;

export type BundleScriptConfig =
  | { mode: 'live'; baseUrl: string; token: string }
  | { mode: 'mock' }
  | { mode: 'none' };

/**
 * Finds the `<script>` element that loaded the bundle.
 *
 * The IIFE build has `document.currentScript`. A module never does, so the ESM build looks for
 * the `<script type="module">` whose `src` resolves to its own `import.meta.url`.
 *
 * An exact match can miss: a CDN that redirects an unversioned path to a versioned file leaves
 * `import.meta.url` at the final URL while `src` keeps the one the page wrote. In that case the
 * one module script carrying a `zd-*` attribute is taken, and more than one is treated as no
 * match rather than a guess about which token to send.
 */
export function findBundleScript(
  moduleUrl: string,
  doc: Document = document
): HTMLScriptElement | undefined {
  const current = doc.currentScript;
  if (current instanceof HTMLScriptElement) {
    return current;
  }

  const modules = [...doc.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')];
  const exact = modules.find((script) => script.src === moduleUrl);
  if (exact) {
    return exact;
  }

  const configured = modules.filter((script) =>
    ATTRIBUTES.some((name) => script.hasAttribute(name))
  );
  return configured.length === 1 ? configured[0] : undefined;
}

/** `zd-token` wins over `zd-mock`, so a page left with both never quietly serves sample data. */
export function readBundleScriptConfig(script: HTMLScriptElement | undefined): BundleScriptConfig {
  const token = script?.getAttribute('zd-token');
  if (token) {
    return {
      mode: 'live',
      baseUrl: script?.getAttribute('zd-base-url') ?? SANDBOX_BASE_URL,
      token,
    };
  }

  return script?.hasAttribute('zd-mock') ? { mode: 'mock' } : { mode: 'none' };
}
