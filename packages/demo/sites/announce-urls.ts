/**
 * Prints the demo sites' local URLs once their dev servers answer. `pnpm demo:sites` runs this
 * beside the servers so the URLs land after the startup noise instead of scrolling away in it.
 */
const SITES = [
  { name: 'Hillbilly Dentistry (React)', url: 'http://localhost:5181' },
  { name: 'Eye Caramba Optometry (Vue)', url: 'http://localhost:5182' },
  { name: 'Toe Truck Podiatry (PHP)', url: 'http://localhost:8081' },
  { name: 'Synergy Partners (ASP.NET)', url: 'http://localhost:8082' },
];

// The ASP.NET site builds before it listens, so allow a slow first start.
const TIMEOUT_MS = 180_000;
const POLL_MS = 1_000;

async function isUp(url: string): Promise<boolean> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(POLL_MS) });
    return true;
  } catch {
    return false;
  }
}

async function waitFor(url: string, deadline: number): Promise<boolean> {
  if (await isUp(url)) return true;
  if (Date.now() > deadline) return false;
  await new Promise((done) => setTimeout(done, POLL_MS));
  return waitFor(url, deadline);
}

const deadline = Date.now() + TIMEOUT_MS;
const results = await Promise.all(
  SITES.map(async (site) => ({ ...site, up: await waitFor(site.url, deadline) }))
);
const width = Math.max(...SITES.map((site) => site.name.length));

const lines = results.map(
  (site) => `  ${site.name.padEnd(width)}  ${site.up ? site.url : `${site.url}  (not responding)`}`
);
process.stdout.write(`\nDemo sites:\n${lines.join('\n')}\n\n`);
