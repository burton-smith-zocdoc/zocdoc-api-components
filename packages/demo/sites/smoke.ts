/**
 * Smoke check for the demo sites: every page renders its components and passes axe, and each
 * site's booking reaches the time step (Eye Caramba: the patient step) on fixtures. Minimal on
 * purpose (TS-003): edge and error states belong to the library's own suites. Never fills the
 * patient form. Expects `pnpm demo:sites` to be running.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium, type Page } from 'playwright';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core'), 'utf8');

interface Check {
  site: string;
  url: string;
  elements: string[];
  /** Drives the page to its last step, if this page books. */
  book?: (page: Page) => Promise<void>;
  /** Text the page must show once rendered. */
  expectText?: string;
}

/**
 * Search components do not search on load: submit, wait for results, then choose a provider by
 * pressing an enabled availability day on a card. Pressing the card itself only opens the profile.
 */
const searchAndPickProvider = async (page: Page, searchTag: string) => {
  await page.locator(searchTag).locator('[part="submit"]').first().click();
  await page.locator('[part="provider"]').first().waitFor();
  await page.locator('[part="day"]:not([disabled])').first().click();
  await page.locator('zd-availability-picker').locator('[part="slot"]').first().waitFor();
};

/** Booking dialogs: stop at the time step. */
const bookToTimeStep = (searchTag: string) => (page: Page) =>
  searchAndPickProvider(page, searchTag);

/** Eye Caramba's own flow: pick a slot to reach the patient step, and stop there. */
const bookToPatientStep = async (page: Page) => {
  await searchAndPickProvider(page, 'zd-provider-search');
  await page.locator('zd-availability-picker').locator('[part="slot"]').first().click();
  await page.locator('[data-step="patient"]').waitFor();
};

const CHECKS: Check[] = [
  { site: 'hillbilly', url: 'http://localhost:5181/', elements: [] },
  { site: 'hillbilly', url: 'http://localhost:5181/meet-the-doc', elements: [] },
  {
    site: 'hillbilly',
    url: 'http://localhost:5181/book',
    elements: ['zd-booking'],
    book: bookToTimeStep('zd-booking'),
  },
  { site: 'eye-caramba', url: 'http://localhost:5182/', elements: [] },
  { site: 'eye-caramba', url: 'http://localhost:5182/frames', elements: [] },
  {
    site: 'eye-caramba',
    url: 'http://localhost:5182/book',
    elements: ['zd-provider-search', 'zd-provider-results'],
    book: bookToPatientStep,
  },
  { site: 'synergy', url: 'http://localhost:8082/', elements: [] },
  { site: 'synergy', url: 'http://localhost:8082/about', elements: [] },
  { site: 'synergy', url: 'http://localhost:8082/leaders', elements: ['zd-provider-card'] },
  {
    site: 'synergy',
    url: 'http://localhost:8082/leaders/pr_nope%7Clo_nope',
    elements: [],
    expectText: 'pivoted to new opportunities',
  },
  { site: 'toe-truck', url: 'http://localhost:8081/', elements: [] },
  {
    site: 'toe-truck',
    url: 'http://localhost:8081/post.php?slug=bunion-needs-a-tow',
    elements: [],
  },
  {
    site: 'toe-truck',
    url: 'http://localhost:8081/book.php',
    elements: ['zd-booking'],
    book: bookToTimeStep('zd-booking'),
  },
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

const browser = await chromium.launch();
const failures: string[] = [];

async function run(label: string, body: (page: Page) => Promise<void>): Promise<void> {
  const page = await browser.newPage();
  try {
    await body(page);
    process.stdout.write(`ok   ${label}\n`);
  } catch (error) {
    failures.push(label);
    process.stdout.write(`FAIL ${label} - ${(error as Error).message.split('\n')[0]}\n`);
  } finally {
    await page.close();
  }
}

for (const check of CHECKS) {
  const { pathname, search } = new URL(check.url);
  await run(`${check.site} ${pathname}${search}`, async (page) => {
    const response = await page.goto(check.url, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
    for (const tag of check.elements) await assertRendered(page, tag);
    if (check.expectText) await page.getByText(check.expectText).waitFor({ timeout: 10_000 });
    let violations = await axe(page);
    if (check.book) {
      await check.book(page);
      violations = [...violations, ...(await axe(page)).map((v) => `${v} [after booking steps]`)];
    }
    if (violations.length) throw new Error(`axe: ${violations.join(', ')}`);
  });
}

// Synergy detail page for a real leader: the first roster link, then open the booking dialog.
await run('synergy /leaders/{first}', async (page) => {
  await page.goto('http://localhost:8082/leaders', { waitUntil: 'networkidle' });
  await page.locator('.roster-link').first().click();
  await assertRendered(page, 'zd-provider-profile');
  const violations = await axe(page);
  await page.locator('.leader-book').click();
  await page.locator('zd-availability-picker').locator('[part="slot"]').first().waitFor();
  violations.push(...(await axe(page)).map((v) => `${v} [time step]`));
  if (violations.length) throw new Error(`axe: ${violations.join(', ')}`);
});

await browser.close();

if (failures.length) {
  process.stdout.write(`\n${failures.length} check(s) failed. Is \`pnpm demo:sites\` running?\n`);
  process.exit(1);
}
process.stdout.write('\nAll demo sites healthy.\n');
