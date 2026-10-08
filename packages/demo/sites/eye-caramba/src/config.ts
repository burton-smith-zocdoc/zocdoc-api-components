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

/**
 * The sandbox fixtures have no optometrist, so mock mode searches Primary Care (sp_153).
 * The site copy never names the specialty, so this reads naturally either way.
 */
export function searchSpecialty(mode: SiteMode): string {
  return mode.mode === 'live' ? (import.meta.env.VITE_ZOCDOC_SPECIALTY_ID ?? 'sp_155') : 'sp_153';
}
