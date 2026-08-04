/**
 * Records reference-data fixtures from the Zocdoc **production** developer API.
 *
 * Run: node scripts/verify-production-reference-data.ts
 *   (Node 24 strips TypeScript natively — no tsx needed.)
 *
 * ## Why this is a separate script from `verify-api.ts`
 *
 * `verify-api.ts` targets the sandbox and probes provider search and availability.
 * Pointing it at production would exceed what was authorized here. Rather than add a
 * flag to it — a flag is one typo away from a production provider sweep — this script
 * hard-codes a three-path allowlist and refuses everything else.
 *
 * ## Scope, and why it is drawn here
 *
 * Specialties, visit reasons, and insurance plans are catalogs. They describe what a
 * practice offers and which plans exist; they contain no patient data, so there is no
 * PHI to leak even though this is production (PHI-001). Every request is a GET, so
 * nothing is created — in particular no appointment, which on production would be a
 * real booking at a real provider's office.
 *
 * Widening this script means editing `ALLOWED_PATHS`, which is the line a reviewer
 * should stop at. `get()` throws on anything else rather than trusting call sites.
 *
 * ## Credentials
 *
 * Reads ZOCDOC_CLIENT_ID / ZOCDOC_CLIENT_SECRET from `.env.local`. Neither they nor
 * the minted token are ever printed — failures report status codes and Auth0 error
 * codes only. The names deliberately lack a `VITE_` prefix: Vite inlines every
 * `import.meta.env.VITE_*` into the browser bundle, and a client secret must never
 * ship to a browser.
 *
 * Minting here is fine for a dev script. The *library* must never mint — it takes
 * whatever `getToken` returns (CLIENT-002).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'packages/api-components/src/client/__fixtures__');

/**
 * Production hosts, from the published docs rather than inferred:
 * `https://api-docs.zocdoc.com/guides/authentication.md` gives the token URL and
 * audience, and the OpenAPI bundle's `servers` block gives the API host. The
 * audience's trailing slash is significant — Auth0 compares it as an opaque string.
 */
const AUTH_URL = 'https://auth.zocdoc.com/oauth/token';
const AUDIENCE = 'https://api-developer.zocdoc.com/';
const BASE = 'https://api-developer.zocdoc.com';

/** The whole authorized surface. `get()` rejects anything not listed here. */
const ALLOWED_PATHS = ['/v1/specialties', '/v1/visit_reasons', '/v1/insurance_plans'] as const;

/** Minimal .env parser — keeps the secret off the command line and out of shell history. */
async function loadEnvLocal(): Promise<Record<string, string>> {
  let raw: string;
  try {
    raw = await readFile(join(ROOT, '.env.local'), 'utf8');
  } catch {
    throw new Error('.env.local not found. Copy .env.local.example to .env.local first.');
  }
  const env: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

/**
 * Exchange a client_credentials pair for a production access token.
 *
 * On failure this reports Auth0's `error` / `error_description` verbatim, which is
 * safe: those describe the client and the grant, never the secret. The 401-vs-403
 * distinction is the useful signal — 401 means the secret is wrong, 403 means the
 * secret is right but the client is not permitted to mint here.
 */
async function mintToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: AUDIENCE,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    let detail = raw.slice(0, 300);
    try {
      const parsed = JSON.parse(raw) as { error?: string; error_description?: string };
      detail = `${parsed.error ?? '?'} — ${parsed.error_description ?? '?'}`;
    } catch {
      // Non-JSON body; the truncated raw text above is the best available detail.
    }
    throw new Error(`Token request failed: ${response.status} ${detail}`);
  }

  const token = (JSON.parse(raw) as { access_token?: string }).access_token;
  if (!token) throw new Error('Token response had no access_token.');
  return token;
}

interface Probe {
  status: number;
  body: unknown;
  raw: string;
}

/**
 * GET one allowlisted path. The method is not a parameter — this script has no reason
 * to issue anything but a GET, so it cannot.
 */
async function get(
  token: string,
  path: string,
  query: Record<string, string> = {}
): Promise<Probe> {
  if (!ALLOWED_PATHS.includes(path as (typeof ALLOWED_PATHS)[number])) {
    throw new Error(
      `Refusing to request ${path}: not in ALLOWED_PATHS. This script is scoped to ` +
        `reference data on production. Widening it is a deliberate, reviewable change.`
    );
  }

  const url = new URL(path, BASE);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

  const response = await fetch(url, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
  });

  const raw = await response.text();
  let body: unknown = raw;
  try {
    body = JSON.parse(raw);
  } catch {
    // Leave `body` as the raw text; `report` prints a truncated form either way.
  }
  return { status: response.status, body, raw };
}

/** Item count for a paged envelope, or null when the shape is not what we expected. */
function countItems(body: unknown): number | null {
  if (Array.isArray(body)) return body.length;
  if (body && typeof body === 'object') {
    const data = (body as { data?: unknown }).data;
    if (Array.isArray(data)) return data.length;
  }
  return null;
}

function envelopeOf(body: unknown): string {
  if (Array.isArray(body)) return 'bare array';
  if (body && typeof body === 'object') return `object { ${Object.keys(body).join(', ')} }`;
  return typeof body;
}

async function record(name: string, probe: Probe): Promise<void> {
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, `${name}.json`), `${JSON.stringify(probe.body, null, 2)}\n`);
}

function report(label: string, probe: Probe): void {
  const count = countItems(probe.body);
  console.log(`\n-- ${label} --`);
  console.log(`  status   : ${probe.status}`);
  console.log(`  envelope : ${envelopeOf(probe.body)}`);
  console.log(`  items    : ${count ?? '(not a recognized list envelope)'}`);
  if (probe.status >= 400) console.log(`  body     : ${probe.raw.slice(0, 300)}`);
}

/** First `id`-ish value from a paged list, used to parameterize the visit-reason call. */
function firstId(body: unknown, key: string): string | null {
  const list = Array.isArray(body) ? body : (body as { data?: unknown[] })?.data;
  if (!Array.isArray(list) || list.length === 0) return null;
  const value = (list[0] as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : null;
}

// ---------------------------------------------------------------------------

const env = await loadEnvLocal();
if (!env.ZOCDOC_CLIENT_ID || !env.ZOCDOC_CLIENT_SECRET) {
  throw new Error('Set ZOCDOC_CLIENT_ID and ZOCDOC_CLIENT_SECRET in .env.local.');
}

console.log(`Minting a production token at ${AUTH_URL}`);
console.log(`  audience: ${AUDIENCE}`);
const token = await mintToken(env.ZOCDOC_CLIENT_ID, env.ZOCDOC_CLIENT_SECRET);
console.log('Token minted. (Not printed.)');

console.log(`\n=== Reference data on ${BASE} (GET only) ===`);

const specialties = await get(token, '/v1/specialties');
report('/v1/specialties', specialties);
if (specialties.status === 200) await record('specialties', specialties);

// visit_reasons is scoped by specialty, so it needs a real id from the call above.
// The field is `id`, not `specialty_id` — the latter is what *other* endpoints call it
// when referring to a specialty, but the specialty object names its own key `id`.
const specialtyId = firstId(specialties.body, 'id');
console.log(`\nspecialty_id resolved from the response: ${specialtyId ?? '(none)'}`);

if (specialtyId) {
  const visitReasons = await get(token, '/v1/visit_reasons', { specialty_id: specialtyId });
  report(`/v1/visit_reasons?specialty_id=${specialtyId}`, visitReasons);
  if (visitReasons.status === 200) await record('visit-reasons', visitReasons);
} else {
  console.log('SKIPPED /v1/visit_reasons — no specialty_id available to scope it.');
}

const insurancePlans = await get(token, '/v1/insurance_plans');
report('/v1/insurance_plans', insurancePlans);
if (insurancePlans.status === 200) await record('insurance_plans', insurancePlans);

console.log(`\nFixtures written to ${OUT}`);
console.log('Next: read each fixture and confirm it is catalog data only before staging.');
