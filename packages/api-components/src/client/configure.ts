/**
 * A stand-in for `fetch`. The signature matches it deliberately: the real transport
 * *is* the global, so a mock is a drop-in with no adapter layer in between.
 */
export type ZocdocTransport = (url: string, init: RequestInit) => Promise<Response>;

export interface ZocdocConfig {
  /** e.g. https://api-developer-sandbox.zocdoc.com */
  baseUrl: string;
  /**
   * A token, or a function returning one. Called per request; memoization is
   * the consumer's responsibility, which keeps this layer stateless and lets a
   * 60-minute token refresh happen without our cooperation.
   */
  getToken: string | (() => string | Promise<string>);
  /**
   * Replaces the network call. Defaults to global `fetch`.
   *
   * This stays required-by-omission rather than a `mock: boolean` flag so the client
   * layer knows nothing about mocking — `client/mock` is just one implementation, and
   * a consumer can supply their own (a proxy, a replay harness) without changes here.
   */
  transport?: ZocdocTransport;
}

let current: ZocdocConfig | undefined;

/**
 * Resolvers handed out by `whenZocdocConfigured` before there was a configuration to give.
 *
 * Emptied on every `configureZocdoc`, so a page that configures before anything fetches — which
 * is nearly all of them — never holds anything here.
 */
let waiting: (() => void)[] = [];

export function configureZocdoc(config: ZocdocConfig): void {
  current = config;

  // Swapped out before resolving: a resolver that synchronously asks to wait again would
  // otherwise be pushed onto the list this loop is walking.
  const resume = waiting;
  waiting = [];
  for (const resolve of resume) {
    resolve();
  }
}

/**
 * Resolves once the client has been configured, immediately if it already has been.
 *
 * This exists for the one ordering a host page cannot control. An element in a page's static
 * markup is upgraded the instant the components module is evaluated, and a host script that
 * imports `configureZocdoc` from that same module cannot run any earlier than that — so a
 * component fetching on connect always fetches first, and a swallowed failure there looks like a
 * working page with empty selects rather than like a bug.
 *
 * Only for fetches an element starts on its own initiative. A request the host asked for by
 * setting a property should still fail loudly through `getZocdocConfig`, because waiting instead
 * would leave a genuinely unconfigured page loading forever with nothing on screen, and nothing
 * in the console, to say why.
 */
export function whenZocdocConfigured(): Promise<void> {
  if (current) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    waiting.push(resolve);
  });
}

export function getZocdocConfig(): ZocdocConfig {
  if (!current) {
    throw new Error(
      'Zocdoc API is not configured. Call configureZocdoc({ baseUrl, getToken }) first.'
    );
  }
  return current;
}

/** Test-only. Clears the singleton between cases. */
export function resetZocdocConfig(): void {
  current = undefined;
}

export async function resolveToken(config: ZocdocConfig): Promise<string> {
  return typeof config.getToken === 'string' ? config.getToken : config.getToken();
}
