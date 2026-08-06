/// <reference types="vite/client" />

/**
 * The two variables this demo reads, declared so `import.meta.env` is typed rather than `any`.
 *
 * Both are optional on purpose: the demo's default is the mock transport, so a checkout with no
 * `.env.local` at all still runs — see `config.ts`.
 */
interface ImportMetaEnv {
  /** `live` points the demo at the sandbox. Anything else, including absent, serves fixtures. */
  readonly VITE_ZOCDOC_MODE?: string;
  /** A sandbox token. Only read in live mode, and never written anywhere. */
  readonly VITE_ZOCDOC_TOKEN?: string;
  /** Overrides the sandbox base URL, for pointing at a different environment. */
  readonly VITE_ZOCDOC_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
