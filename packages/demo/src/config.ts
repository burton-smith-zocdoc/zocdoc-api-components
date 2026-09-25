/**
 * Configures the API client for both demo pages, and says on the page which way it went.
 *
 * **Fixtures are the default, and that is a safety decision rather than a convenience one.** A
 * demo that defaults to the live sandbox cannot be opened without a credential, and the first
 * person who clicks all the way through it posts a patient's name, date of birth, and phone
 * number to a real API. Serving fixtures instead means there is no outbound destination at all
 * (PHI-003), and the funnel still exercises every code path: the same components, the same
 * client, the same documented sentinel inputs.
 *
 * Live mode is a separate switch from the token — `VITE_ZOCDOC_MODE=live`, not merely a token
 * being present — so that having a credential in `.env.local` for some other purpose is not by
 * itself enough to start sending real requests.
 */
import { configureZocdoc } from '@zocdoc/api-components';
import { configureZocdocMock } from '@zocdoc/api-components/mock';

/** The default live target. Overridable with `VITE_ZOCDOC_BASE_URL`. */
const SANDBOX_BASE_URL = 'https://api-developer-sandbox.zocdoc.com';

export interface DemoConfig {
  mode: 'mock' | 'live';
  /** Where requests go, for the banner. The mock's own base URL is unresolvable by design. */
  baseUrl: string;
  /** Set when live mode was asked for and could not be given. Displayed, never swallowed. */
  warning?: string;
}

export function configureDemo(): DemoConfig {
  const wantsLive = import.meta.env.VITE_ZOCDOC_MODE === 'live';
  const token = import.meta.env.VITE_ZOCDOC_TOKEN;

  if (wantsLive) {
    if (!token) {
      /*
       * Falls back rather than throwing. A thrown error here takes the whole page with it and the
       * reason ends up in the console, where nobody running a demo is looking; the banner puts it
       * where they are. Falling back to fixtures rather than to unauthenticated live requests is
       * the part that matters — the alternative is a page that looks configured and 401s.
       */
      configureZocdocMock();
      return {
        mode: 'mock',
        baseUrl: 'fixtures',
        warning:
          'VITE_ZOCDOC_MODE=live is set but VITE_ZOCDOC_TOKEN is not, so this page is serving fixtures. Add a token to .env.local at the workspace root.',
      };
    }

    const baseUrl = import.meta.env.VITE_ZOCDOC_BASE_URL ?? SANDBOX_BASE_URL;
    /*
     * `getToken` stays a function even though this value is fixed at build time (CLIENT-002).
     * The client calls it per request, which is what lets a real host page refresh a 60-minute
     * token without our cooperation — a demo that hands over a bare string would be modelling
     * the one shape that cannot do that.
     */
    configureZocdoc({ baseUrl, getToken: () => token });
    return { mode: 'live', baseUrl };
  }

  configureZocdocMock();
  return { mode: 'mock', baseUrl: 'fixtures' };
}

/**
 * Fills in the page's mode banner.
 *
 * The element is in the markup rather than created here so the page has no layout shift and so
 * its wording is visible to anyone reading the HTML.
 */
export function renderModeBanner(config: DemoConfig): void {
  const banner = document.querySelector('#mode');
  if (!banner) return;

  if (config.mode === 'mock') {
    const code = document.createElement('code');
    code.textContent = `<script src="..." zd-token="..."></script>
<zd-booking></zd-booking>`;
    const pre = document.createElement('pre');
    pre.className = 'code-sample';
    pre.append(code);
    banner.replaceChildren(pre);
  } else {
    banner.textContent = `Live: ${config.baseUrl}`;
  }
  banner.setAttribute('data-mode', config.mode);

  if (!config.warning) return;

  const warning = document.createElement('p');
  warning.className = 'warning';
  warning.setAttribute('role', 'alert');
  warning.textContent = config.warning;
  banner.after(warning);
}
