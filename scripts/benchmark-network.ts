/**
 * Report-only page-load benchmark: data fetched by the browser vs. data written into the HTML.
 *
 * The component benchmarks (TEST-004) mock the client layer, so they time rendering and nothing
 * else. This one times what they can't see: a whole page load in real Chrome, on a throttled
 * phone profile, with the API answering over the (throttled) network.
 *
 * A local server plays both halves:
 *
 * - **The API.** `/v1/*` is served by the same mock transport the demos use, so both modes get
 *   byte-identical data. Each response waits `API_LATENCY_MS` first, standing in for the backend.
 * - **The page server.** `fetched` pages carry only markup and a token; the browser calls the API
 *   after the bundle loads. `hydrated` pages make the same API calls on the server, paying the
 *   same backend latency before the first byte, and write the results into JSON blocks.
 *
 * The fetched pages get their token from a `<meta>` tag, which is the best case for fetching: a
 * real page usually needs a round trip to mint one first. The numbers favour fetching on purpose.
 *
 * Scenarios:
 * - `results`: a page of provider results with availability counts. Fetched, that is a search,
 *   then a batched availability call that needs the search's ids (two sequential requests).
 * - `picker`: one `zd-availability-picker` that fetches its own times (one request).
 *
 * Nothing asserts on a number. Results print as a table and are written to
 * `performance-results/network.json`, which is gitignored.
 *
 *   pnpm test:performance:network
 *   PERF_ITERATIONS=15 pnpm test:performance:network
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createGzip, gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type CDPSession, type Page } from 'playwright';
import { createMockTransport } from '../packages/api-components/dist/client/mock/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BUNDLE = join(ROOT, 'packages/api-components/dist/bundle/zocdoc.js');
const THEME = join(ROOT, 'packages/primitives/dist/theme/all.css');
const RESULTS_FILE = join(ROOT, 'performance-results/network.json');

const ITERATIONS = Number(process.env.PERF_ITERATIONS ?? '7');
/** Backend think time per API request, paid by whichever side makes the call. */
const API_LATENCY_MS = Number(process.env.PERF_API_LATENCY_MS ?? '100');

/** Documented sandbox inputs (TEST-003): ZIP 11201 returns results. */
const ZIP_CODE = '11201';
const VISIT_REASON_ID = 'pc_FRO-18leckytNKtruw5dLR';
const PICKER_LOCATION_ID = 'pr_confirmed|lo_confirmed';
const AVAILABILITY_DAYS = 14;
const PICKER_DAYS = 7;
const TOKEN = 'benchmark-token-not-a-credential';

interface NetworkProfile {
  name: string;
  /**
   * Round trip added to every response, by the server rather than by Chrome. DevTools latency is
   * a per-request *minimum*, so it hides behind any time the server spends working, which would
   * let the hydrated page's backend calls overlap the RTT for free. Added here, it is paid in full.
   */
  rttMs: number;
  /** Bytes per second; `undefined` leaves bandwidth unthrottled. */
  bandwidth?: { download: number; upload: number };
  cpuSlowdown: number;
}

/** Lighthouse's mobile defaults: 150 ms RTT, ~1.6 Mbps down, ~750 Kbps up, 4x CPU slowdown. */
const PROFILES: NetworkProfile[] = [
  {
    name: 'slow-4g',
    rttMs: 150,
    bandwidth: {
      download: (1.6 * 1024 * 1024 * 0.9) / 8,
      upload: (750 * 1024 * 0.9) / 8,
    },
    cpuSlowdown: 4,
  },
  { name: 'unthrottled', rttMs: 0, cpuSlowdown: 1 },
];

type Scenario = 'results' | 'picker';
/**
 * - `fetched`: the browser calls the API once the bundle is up.
 * - `hydrated`: the server calls the API, then sends the whole page with the data in it.
 * - `streamed`: the same, but the server flushes `<head>` before it calls the API, so the bundle
 *   downloads while the server waits. Same bytes as `hydrated`, sent earlier.
 * - `property`: streamed like `streamed`, with the same data, but as one page-level JSON blob that
 *   a script assigns to the element once `customElements.whenDefined` resolves, the usual way to
 *   hand server data to a component without JSON blocks. The page is configured for live calls,
 *   as any page that lets its components fetch would be.
 * - `late`: the same blob, assigned on `DOMContentLoaded` instead, a common way to write the glue.
 *   Deferred scripts run before that event, so the element has already rendered once without it.
 */
type Mode = 'fetched' | 'hydrated' | 'streamed' | 'property' | 'late';
type CacheState = 'cold' | 'warm';

const SCENARIOS: Scenario[] = ['results', 'picker'];
const MODES: Mode[] = ['fetched', 'hydrated', 'streamed', 'property', 'late'];
const CACHE_STATES: CacheState[] = ['cold', 'warm'];

// ---------------------------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------------------------

const transport = createMockTransport({ latencyMs: 0 });

/** The current profile's RTT. Loads run one at a time, so one value serves every request. */
let rttMs = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function today(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function addDays(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year!, month! - 1, day! + days);
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** A call the page server makes on the page's behalf, at the same backend cost as the browser's. */
async function serverApi<T>(path: string, query: Record<string, string>): Promise<T> {
  await sleep(API_LATENCY_MS);
  const url = new URL(path, 'https://mock.invalid');
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const response = await transport(url.href, { method: 'GET' });
  return (await response.json()) as T;
}

/** Escapes `<` so the data can't close its own `<script>` block early. */
function jsonBlock(name: string, value: unknown): string {
  const json = JSON.stringify(value).replaceAll('<', '\\u003c');
  return `<script type="application/json" data-zd-prop="${name}">${json}</script>`;
}

/** The server's data as one page-level blob, assigned to the element by script once it is defined. */
function setAfterDefine(tag: string, props: Record<string, unknown>, late: boolean): string {
  const json = JSON.stringify(props).replaceAll('<', '\\u003c');
  const when = late
    ? `new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve))`
    : `customElements.whenDefined('${tag}')`;
  return `<script type="application/json" id="page-data">${json}</script>
<script>
${when}.then(() => {
  const data = JSON.parse(document.getElementById('page-data').textContent);
  Object.assign(document.querySelector('${tag}'), data);
});
</script>`;
}

/** A page in two halves, so a streaming server can send `head` before `body` is ready. */
interface PageParts {
  head: string;
  body: () => Promise<string>;
}

function page(head: string, body: () => Promise<string>): PageParts {
  return {
    head: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>benchmark</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="/theme.css">
${head}
<script defer src="/zocdoc.js"></script>
</head>
<body>
`,
    body: async () => `${await body()}
</body>
</html>`,
  };
}

const LIVE_META = (origin: string) =>
  `<meta name="zocdoc-api-key" content="${TOKEN}">\n<meta name="zocdoc-api-base-url" content="${origin}">`;

interface SearchResponse {
  total_count: number;
  data: { provider_locations: { provider_location_id: string }[] };
}

function renderPage(scenario: Scenario, mode: Mode, origin: string): PageParts {
  const start = today();

  if (scenario === 'picker') {
    const attributes = `provider-location-id="${PICKER_LOCATION_ID}" visit-reason-id="${VISIT_REASON_ID}" start-date="${start}" days="${PICKER_DAYS}"`;
    if (mode === 'fetched') {
      return page(
        LIVE_META(origin),
        async () => `<zd-availability-picker ${attributes}></zd-availability-picker>`
      );
    }
    return page(mode === 'property' || mode === 'late' ? LIVE_META(origin) : '', async () => {
      const availability = await serverApi<{ data: { timeslots: unknown[] }[] }>(
        '/v1/provider_locations/availability',
        {
          provider_location_ids: PICKER_LOCATION_ID,
          visit_reason_id: VISIT_REASON_ID,
          patient_type: 'new',
          start_date_in_provider_local_time: start,
          end_date_in_provider_local_time: addDays(start, PICKER_DAYS - 1),
        }
      );
      const timeslots = availability.data[0]?.timeslots ?? [];
      if (mode === 'property' || mode === 'late') {
        return `<zd-availability-picker ${attributes}></zd-availability-picker>\n${setAfterDefine('zd-availability-picker', { timeslots }, mode === 'late')}`;
      }
      return `<zd-availability-picker ${attributes}>${jsonBlock('timeslots', timeslots)}</zd-availability-picker>`;
    });
  }

  if (mode === 'fetched') {
    // The glue a host page writes: search, then one batched availability call for the ids found.
    const glue = `<script>
document.addEventListener('DOMContentLoaded', async () => {
  const results = document.querySelector('zd-provider-results');
  results.loading = true;
  const search = await Zocdoc.searchProviderLocations({ zipCode: '${ZIP_CODE}', visitReasonId: '${VISIT_REASON_ID}' });
  results.providers = search.providerLocations;
  results.totalCount = search.totalCount;
  results.loading = false;
  results.availability = await Zocdoc.getAvailability({
    providerLocationIds: search.providerLocations.map((l) => l.provider_location_id),
    visitReasonId: '${VISIT_REASON_ID}',
    patientType: 'new',
    startDate: '${start}',
    endDate: '${addDays(start, AVAILABILITY_DAYS - 1)}',
  });
});
</script>`;
    return page(
      LIVE_META(origin),
      async () =>
        `<zd-provider-results hide-photos availability-start="${start}" availability-days="${AVAILABILITY_DAYS}"></zd-provider-results>\n${glue}`
    );
  }

  // Same two calls, made by the server: before it sends a byte, or after it has sent `<head>`.
  return page(mode === 'property' || mode === 'late' ? LIVE_META(origin) : '', async () => {
    const search = await serverApi<SearchResponse>('/v1/provider_locations', {
      zip_code: ZIP_CODE,
      visit_reason_id: VISIT_REASON_ID,
    });
    const providers = search.data.provider_locations;
    const availability = await serverApi<{ data: unknown[] }>(
      '/v1/provider_locations/availability',
      {
        provider_location_ids: providers.map((l) => l.provider_location_id).join(','),
        visit_reason_id: VISIT_REASON_ID,
        patient_type: 'new',
        start_date_in_provider_local_time: start,
        end_date_in_provider_local_time: addDays(start, AVAILABILITY_DAYS - 1),
      }
    );
    const open = `<zd-provider-results hide-photos total-count="${search.total_count}" availability-start="${start}" availability-days="${AVAILABILITY_DAYS}">`;
    if (mode === 'property' || mode === 'late') {
      return `${open}</zd-provider-results>\n${setAfterDefine('zd-provider-results', { providers, availability: availability.data }, mode === 'late')}`;
    }
    return `${open}
${jsonBlock('providers', providers)}
${jsonBlock('availability', availability.data)}
</zd-provider-results>`;
  });
}

/** Every response is gzipped, as any production server would; uncompressed would overstate transfer. */
function send(
  res: ServerResponse,
  status: number,
  type: string,
  cache: string,
  body: Buffer
): void {
  setTimeout(() => respond(res, status, type, cache, body), rttMs / 2);
}

function respond(
  res: ServerResponse,
  status: number,
  type: string,
  cache: string,
  body: Buffer
): void {
  res.writeHead(status, {
    'content-type': type,
    'cache-control': cache,
    'content-encoding': 'gzip',
  });
  res.end(body);
}

/**
 * Sends `head` at once and `body` when it's ready, as a server that flushes early would. Each
 * chunk still pays the response's half of the RTT, and each is flushed through gzip, so the
 * browser can parse `<head>` and start the bundle download while the server is still fetching.
 */
async function stream(res: ServerResponse, parts: PageParts): Promise<void> {
  const gzip = createGzip();
  const delay = rttMs / 2;
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'content-encoding': 'gzip',
  });
  gzip.on('data', (chunk: Buffer) => setTimeout(() => res.write(chunk), delay));
  gzip.on('end', () => setTimeout(() => res.end(), delay));

  gzip.write(parts.head);
  gzip.flush();
  gzip.end(await parts.body());
}

async function startServer(): Promise<{ origin: string; close: () => Promise<void> }> {
  // Compressed once up front, as a CDN would serve them.
  const [bundle, theme] = (await Promise.all([readFile(BUNDLE), readFile(THEME)])).map((file) =>
    gzipSync(file)
  );

  const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    // The request's trip to the server. The response's trip back is the other half, below.
    await sleep(rttMs / 2);
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const origin = url.origin;

    if (url.pathname === '/zocdoc.js' || url.pathname === '/theme.css') {
      // Cacheable, so a warm run measures a repeat visit with the bundle already on the device.
      const js = url.pathname.endsWith('.js');
      send(
        res,
        200,
        js ? 'text/javascript' : 'text/css',
        'public, max-age=3600',
        js ? bundle! : theme!
      );
      return;
    }

    if (url.pathname.startsWith('/v1/')) {
      await sleep(API_LATENCY_MS);
      const response = await transport(url.href, { method: req.method ?? 'GET' });
      send(res, response.status, 'application/json', 'no-store', gzipSync(await response.text()));
      return;
    }

    const match = /^\/(results|picker)\/(fetched|hydrated|streamed|property|late)$/.exec(
      url.pathname
    );
    if (match) {
      const mode = match[2] as Mode;
      const parts = renderPage(match[1] as Scenario, mode, origin);
      if (mode === 'fetched' || mode === 'hydrated') {
        const html = parts.head + (await parts.body());
        send(res, 200, 'text/html; charset=utf-8', 'no-store', gzipSync(html));
        return;
      }
      await stream(res, parts);
      return;
    }

    res.writeHead(404).end();
  };

  const server = createServer((req, res) => {
    handle(req, res).catch(() => res.writeHead(500).end());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

// ---------------------------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------------------------

interface Sample {
  /** ms from navigation start until the data is on screen. */
  content: number;
  fcp: number;
  lcp: number;
  cls: number;
  ttfb: number;
  /** API requests the browser made. */
  apiRequests: number;
  /** Bytes over the wire for the whole load. */
  bytes: number;
}

/** Collects LCP and CLS from the first byte, since they can only be observed as they happen. */
const OBSERVERS = `
window.zdBenchLcp = 0; window.zdBenchCls = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) window.zdBenchLcp = entry.startTime;
}).observe({ type: 'largest-contentful-paint', buffered: true });
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.zdBenchCls += entry.value;
}).observe({ type: 'layout-shift', buffered: true });
`;

/**
 * "Content" is the moment a patient could act on what they came for: the provider cards with
 * their day counts, or the picker's days. Checked every frame; returns that frame's timestamp.
 */
function contentReady(scenario: Scenario): string {
  return scenario === 'results'
    ? `(() => {
        const root = document.querySelector('zd-provider-results')?.shadowRoot;
        if (!root?.querySelector('[part="provider"]')) return false;
        const grid = root.querySelector('[part~="provider-availability"]');
        return grid?.shadowRoot?.querySelector('[part="days"]') ? performance.now() : false;
      })()`
    : `(() => {
        const root = document.querySelector('zd-availability-picker')?.shadowRoot;
        return root?.querySelector('[part="days"]') ? performance.now() : false;
      })()`;
}

async function throttle(
  cdp: CDPSession,
  profile: NetworkProfile,
  cache: CacheState
): Promise<void> {
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: cache === 'cold' });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: profile.bandwidth?.download ?? -1,
    uploadThroughput: profile.bandwidth?.upload ?? -1,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuSlowdown });
}

async function measure(
  browser: Browser,
  origin: string,
  scenario: Scenario,
  mode: Mode,
  profile: NetworkProfile,
  cache: CacheState
): Promise<Sample> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const tab: Page = await context.newPage();
  const url = `${origin}/${scenario}/${mode}`;

  try {
    // A repeat visit: load once unthrottled so the bundle and theme are in the HTTP cache.
    rttMs = 0;
    if (cache === 'warm') {
      await tab.goto(url, { waitUntil: 'load' });
      await tab.waitForFunction(contentReady(scenario), undefined, { polling: 'raf' });
    }

    const cdp = await context.newCDPSession(tab);
    await throttle(cdp, profile, cache);
    rttMs = profile.rttMs;

    let bytes = 0;
    cdp.on('Network.loadingFinished', (event: { encodedDataLength: number }) => {
      bytes += event.encodedDataLength;
    });
    let apiRequests = 0;
    tab.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/v1/')) apiRequests += 1;
    });

    await tab.addInitScript(OBSERVERS);
    await tab.goto(url, { waitUntil: 'commit' });

    const ready = await tab.waitForFunction(contentReady(scenario), undefined, {
      polling: 'raf',
      timeout: 60_000,
    });
    const content = (await ready.jsonValue()) as number;

    // Let the last frame's paints and shifts reach their observers.
    await tab.waitForTimeout(500);
    const vitals = await tab.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
      const w = window as unknown as { zdBenchLcp: number; zdBenchCls: number };
      return { ttfb: nav.responseStart, fcp, lcp: w.zdBenchLcp, cls: w.zdBenchCls };
    });

    return { content, apiRequests, bytes, ...vitals };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------------------------

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b); // oxlint-disable-line unicorn/no-array-sort -- sorts a copy;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function p95(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b); // oxlint-disable-line unicorn/no-array-sort -- sorts a copy;
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)]!;
}

interface Summary {
  content: { median: number; p95: number };
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  apiRequests: number;
  kb: number;
}

function summarize(samples: Sample[]): Summary {
  const pick = (key: keyof Sample) => samples.map((s) => s[key]);
  return {
    content: { median: median(pick('content')), p95: p95(pick('content')) },
    ttfb: median(pick('ttfb')),
    fcp: median(pick('fcp')),
    lcp: median(pick('lcp')),
    cls: median(pick('cls')),
    apiRequests: median(pick('apiRequests')),
    kb: median(pick('bytes')) / 1024,
  };
}

const ms = (n: number) => `${Math.round(n)}`.padStart(6);

async function main(): Promise<void> {
  const server = await startServer();
  // Installed Chrome, as in vitest.config.ts: the Zocdoc sandbox allows it and not the headless shell.
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report: Record<string, Summary> = {};

  console.log(
    `Page-load benchmark: ${ITERATIONS} iterations, ${API_LATENCY_MS} ms backend latency per API call\n`
  );
  console.log(
    'scenario  profile      cache  mode       content  p95   ttfb   fcp    lcp    cls    api  KB'
  );

  try {
    for (const profile of PROFILES) {
      for (const cache of CACHE_STATES) {
        for (const scenario of SCENARIOS) {
          const samples: Record<Mode, Sample[]> = {
            fetched: [],
            hydrated: [],
            streamed: [],
            property: [],
            late: [],
          };
          // Interleaved, so drift on a shared laptop lands on every mode alike.
          for (let i = 0; i < ITERATIONS; i += 1) {
            for (const mode of MODES) {
              // Sequential by design: two loads at once would share the throttled link.
              // oxlint-disable-next-line no-await-in-loop
              const sample = await measure(browser, server.origin, scenario, mode, profile, cache);
              samples[mode].push(sample);
            }
          }
          for (const mode of MODES) {
            const s = summarize(samples[mode]);
            report[`${scenario}/${profile.name}/${cache}/${mode}`] = s;
            console.log(
              `${scenario.padEnd(9)} ${profile.name.padEnd(12)} ${cache.padEnd(6)} ${mode.padEnd(9)}` +
                `${ms(s.content.median)} ${ms(s.content.p95)}${ms(s.ttfb)} ${ms(s.fcp)} ${ms(s.lcp)}` +
                `  ${s.cls.toFixed(3)}  ${String(s.apiRequests).padStart(3)}  ${Math.round(s.kb)}`
            );
          }
        }
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  await mkdir(dirname(RESULTS_FILE), { recursive: true });
  await writeFile(
    RESULTS_FILE,
    `${JSON.stringify({ iterations: ITERATIONS, apiLatencyMs: API_LATENCY_MS, results: report }, null, 2)}\n`
  );
  console.log(`\nAll times in ms, medians unless noted. Written to ${RESULTS_FILE}`);
}

await main();
