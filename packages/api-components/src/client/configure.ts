export interface ZocdocConfig {
  /** e.g. https://api-developer-sandbox.zocdoc.com */
  baseUrl: string;
  /**
   * A token, or a function returning one. Called per request; memoization is
   * the consumer's responsibility, which keeps this layer stateless and lets a
   * 60-minute token refresh happen without our cooperation.
   */
  getToken: string | (() => string | Promise<string>);
}

let current: ZocdocConfig | undefined;

export function configureZocdoc(config: ZocdocConfig): void {
  current = config;
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
