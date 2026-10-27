/**
 * Smoke check for the docs site: key pages render, pass axe in both color modes, and make no
 * requests beyond the docs origin (PHI-003). Report-style like the demo-sites smoke, and local
 * only. Expects `pnpm --filter docs preview --port 4329` to be running on a fresh build, or set
 * `DOCS_PORT` to match.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium, type Page } from 'playwright';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core'), 'utf8');

const ORIGIN = `http://localhost:${process.env.DOCS_PORT ?? 4329}`;
const BASE = `${ORIGIN}/zocdoc-api-components`;

type Theme = 'light' | 'dark';

interface Check {
  label: string;
  /** Relative to `BASE`. */
  path: string;
  elements: string[];
  themes: Theme[];
  /**
   * axe rules that already failed on this page before the redesign and are out of its scope.
   * Each needs a reason; anything not listed here still fails the check.
   */
  knownViolations?: Record<string, string>;
  /** Extra assertions once the page has rendered. */
  body?: (page: Page) => Promise<void>;
}

const CHECKS: Check[] = [
  { label: 'home', path: '/', elements: ['zd-booking'], themes: ['light', 'dark'] },
  {
    label: 'booking component',
    path: '/components/booking/',
    elements: ['zd-booking'],
    themes: ['light', 'dark'],
    knownViolations: {
      'scrollable-region-focusable':
        'the generated API reference table scrolls horizontally but is not focusable',
    },
  },
  { label: 'theming guide', path: '/guides/theming/', elements: [], themes: ['light', 'dark'] },
];

async function assertRendered(page: Page, tag: string): Promise<void> {
  await page.waitForFunction(
    (name) => {
      const el = document.querySelector(name);
      return !!customElements.get(name) && !!el?.shadowRoot?.childElementCount;
    },
    tag,
    { timeout: 10_000 }
  );
}

async function axe(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: AXE_SOURCE });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const result = await window.axe.run(document, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
    });
    return result.violations.map(
      (v: { id: string; nodes: unknown[] }) => `${v.id} (${v.nodes.length})`
    );
  });
}

/** Starlight reads `starlight-theme` from localStorage before first paint. Call before `goto`. */
async function setTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((value) => localStorage.setItem('starlight-theme', value), theme);
}

async function open(page: Page, path: string, theme: Theme): Promise<void> {
  await setTheme(page, theme);
  const response = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
  const applied = await page.evaluate(() => document.documentElement.dataset.theme);
  if (applied !== theme) throw new Error(`theme: expected ${theme}, got ${applied}`);
}

/** Relative luminance of an `rgb(…)` / `rgba(…)` string, 0–1. */
function luminance(color: string): number {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((c) => {
    const s = Number(c) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Playwright's bundled Chromium crashes under the Zocdoc agentic sandbox's seatbelt profile; the
 * installed Chrome is permitted. Same guard as the root vitest config.
 */
const IN_SANDBOX = existsSync('/opt/zocdoc');
/**
 * Search components do not search on load: submit, wait for results, then choose a provider by
 * pressing an enabled availability day on a card. Same steps as the demo-sites smoke.
 */
const searchAndPickProvider = async (page: Page, searchTag: string) => {
  await page.locator(searchTag).locator('[part="submit"]').first().click();
  await page.locator('[part="provider"]').first().waitFor();
  await page.locator('[part="day"]:not([disabled])').first().click();
  await page.locator('zd-availability-picker').locator('[part="slot"]').first().waitFor();
};

const browser = await chromium.launch(IN_SANDBOX ? { channel: 'chrome' } : {});
const failures: string[] = [];

async function run(
  label: string,
  body: (page: Page) => Promise<void>,
  viewport = { width: 1280, height: 900 }
): Promise<void> {
  const page = await browser.newPage({ viewport });
  const foreign: string[] = [];
  page.on('request', (request) => {
    const { origin } = new URL(request.url());
    if (origin !== ORIGIN && !request.url().startsWith('data:')) foreign.push(request.url());
  });
  try {
    await body(page);
    if (foreign.length) throw new Error(`third-party requests: ${foreign.join(', ')}`);
    process.stdout.write(`ok   ${label}\n`);
  } catch (error) {
    failures.push(label);
    process.stdout.write(`FAIL ${label} - ${(error as Error).message.split('\n')[0]}\n`);
  } finally {
    await page.close();
  }
}

for (const check of CHECKS) {
  for (const theme of check.themes) {
    await run(`${check.label} [${theme}]`, async (page) => {
      await open(page, check.path, theme);
      for (const tag of check.elements) await assertRendered(page, tag);
      await check.body?.(page);
      const known = Object.keys(check.knownViolations ?? {});
      const violations = (await axe(page)).filter((v) => !known.includes(v.split(' ')[0]));
      if (violations.length) throw new Error(`axe: ${violations.join(', ')}`);
    });
  }
}

await run('font: docs and components share the stand-in', async (page) => {
  await open(page, '/components/booking/', 'light');
  const [docsFont, zdFont] = await page.evaluate(() => [
    getComputedStyle(document.body).fontFamily,
    getComputedStyle(document.documentElement).getPropertyValue('--zd-font-family-base'),
  ]);
  if (!docsFont.includes('Figtree')) throw new Error(`docs font: ${docsFont}`);
  if (!zdFont.includes('Figtree')) throw new Error(`component font: ${zdFont}`);
});

for (const theme of ['light', 'dark'] as const) {
  await run(`primary button is near-black [${theme}]`, async (page) => {
    await open(page, '/', theme);
    const background = await page.evaluate(
      () => getComputedStyle(document.querySelector('.sl-link-button.primary')!).backgroundColor
    );
    if (theme === 'light' && background !== 'rgb(27, 27, 27)') {
      throw new Error(`background: ${background}`);
    }
    if (theme === 'dark' && luminance(background) <= 0.8) {
      throw new Error(`background: ${background}`);
    }
  });
}

// axe does not check focus indicators (WCAG 1.4.11 asks 3:1 against the page).
await run('primary button focus ring is visible [light]', async (page) => {
  await open(page, '/', 'light');
  const button = page.locator('.sl-link-button.primary').first();
  await button.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const { ring, page: bg } = await button.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      ring: s.outlineStyle === 'none' ? '' : s.outlineColor,
      page: getComputedStyle(document.body).backgroundColor,
    };
  });
  if (!ring) throw new Error('no outline on focus');
  const [hi, lo] = [luminance(ring), luminance(bg)].sort((a, b) => b - a);
  const ratio = (hi + 0.05) / (lo + 0.05);
  if (ratio < 3) throw new Error(`focus ring ${ring} on ${bg}: ${ratio.toFixed(2)}:1`);
});

// Every snippet a visitor can copy must configure the client: `baseUrl` is required.
await run('home: install snippets configure the client', async (page) => {
  await open(page, '/', 'light');
  const npm = await page.locator('.install .npm').innerText();
  const cdn = await page.locator('.install .cdn').innerText();
  if (!npm.includes('npm install')) throw new Error('npm block has no install command');
  if (!npm.includes('baseUrl')) throw new Error('npm block never sets baseUrl');
  if (!cdn.includes('<meta name="zocdoc-api-key"'))
    throw new Error('CDN block never sets the API key meta tag');
  if (cdn.includes('zd-token')) throw new Error('CDN block still uses the zd-token attribute');
});

await run('home: live example books through', async (page) => {
  await open(page, '/', 'light');
  await assertRendered(page, 'zd-booking');
  // The demo opens without a specialty, as a visitor would see it; choose one like they would.
  await page.locator('.live zd-booking [part="specialty"]').selectOption('sp_153');
  await searchAndPickProvider(page, '.live zd-booking');
});

await run(
  'home: narrow viewport',
  async (page) => {
    await open(page, '/', 'light');
    await assertRendered(page, 'zd-booking');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (overflow > 0) throw new Error(`horizontal overflow: ${overflow}px`);
  },
  { width: 375, height: 800 }
);

await run('home: frameworks section', async (page) => {
  await open(page, '/', 'light');
  const names = (await page.locator('.frameworks li').allInnerTexts()).map((n) => n.trim());
  const expected = ['HTML', 'React', 'Vue', 'Svelte', 'PHP', 'ASP.NET'];
  if (names.join() !== expected.join()) throw new Error(`frameworks: ${names}`);
  const link = page.locator('.frameworks a[href="/zocdoc-api-components/guides/frameworks/"]');
  if (!(await link.count())) throw new Error('no link to the framework guide');
});

await run('home: copy and order', async (page) => {
  await open(page, '/', 'light');
  const { h1, tagline, headings, primaries, cardGrids } = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim(),
    tagline: document.querySelector('.hero .tagline')?.textContent?.trim(),
    headings: [...document.querySelectorAll('main h2')].map((h) => h.textContent?.trim()),
    primaries: [...document.querySelectorAll('.sl-link-button.primary')].map((a) =>
      a.textContent?.trim()
    ),
    cardGrids: document.querySelectorAll('.card-grid').length,
  }));
  if (h1 !== 'Zocdoc booking, anywhere on the web.') throw new Error(`h1: ${h1}`);
  if (tagline !== 'A few lines of HTML. Any framework. Fully themeable.') {
    throw new Error(`tagline: ${tagline}`);
  }
  const order = ['Quick Start', 'See it live', 'Two ways to use it', 'Works with any framework'];
  if (headings.join() !== order.join()) {
    throw new Error(`headings: ${headings}`);
  }
  if (primaries.join() !== 'Get started,Get started') throw new Error(`primary: ${primaries}`);
  if (cardGrids) throw new Error('old card grid is still on the page');
});

await run('home: usage cards link out', async (page) => {
  await open(page, '/', 'light');
  const expected: [string, string][] = [
    ['All-in-one', '/zocdoc-api-components/components/booking/'],
    ['Compose your own', '/zocdoc-api-components/guides/composed-vs-single/'],
    ['Compose your own', '/zocdoc-api-components/components/appointment/'],
  ];
  for (const [card, href] of expected) {
    const links = page.locator('article', { has: page.getByRole('heading', { name: card }) });
    if (!(await links.locator(`a[href="${href}"]`).count())) {
      throw new Error(`${card} card has no link to ${href}`);
    }
  }
  if (!(await page.getByRole('link', { name: /See all 13 components/ }).count())) {
    throw new Error('no "See all 13 components" link');
  }
});

await run('home: every internal link resolves', async (page) => {
  await open(page, '/', 'light');
  const hrefs = await page.evaluate(() => [
    ...new Set(
      [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/zocdoc-api-components/"]')].map(
        (a) => a.getAttribute('href')!
      )
    ),
  ]);
  const broken: string[] = [];
  for (const href of hrefs) {
    if (!(await page.request.get(ORIGIN + href)).ok()) broken.push(href);
  }
  if (broken.length) throw new Error(`broken: ${broken.join(', ')}`);
});

await browser.close();

if (failures.length) {
  process.stdout.write(
    `\n${failures.length} check(s) failed. Is \`pnpm --filter docs preview --port 4329\` running?\n`
  );
  process.exit(1);
}
process.stdout.write('\nAll docs checks passed.\n');
