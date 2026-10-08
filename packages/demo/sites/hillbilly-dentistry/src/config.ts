import { configureZocdoc } from '@zocdoc/api-components';
import { configureZocdocMock } from '@zocdoc/api-components/mock';

const SANDBOX_BASE_URL = 'https://api-developer-sandbox.zocdoc.com';

export interface SiteMode {
  mode: 'mock' | 'live';
  warning?: string;
}

/** Fixtures unless live is asked for *and* possible. See packages/demo/src/config.ts. */
export function configureSite(): SiteMode {
  const token = import.meta.env.VITE_ZOCDOC_TOKEN;
  if (import.meta.env.VITE_ZOCDOC_MODE === 'live') {
    if (!token) {
      configureZocdocMock();
      return { mode: 'mock', warning: 'Live mode needs VITE_ZOCDOC_TOKEN — showing sample data.' };
    }
    configureZocdoc({
      baseUrl: import.meta.env.VITE_ZOCDOC_BASE_URL ?? SANDBOX_BASE_URL,
      getToken: () => token, // a function, per request (CLIENT-002)
    });
    return { mode: 'live' };
  }
  configureZocdocMock();
  return { mode: 'mock' };
}
