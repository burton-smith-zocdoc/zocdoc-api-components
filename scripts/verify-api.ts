/**
 * One-off reconnaissance against the Zocdoc developer sandbox.
 *
 * Two jobs:
 *   1. Resolve the provider-search parameter-name conflict the design spec flags
 *      as unresolved (`specialty` vs `specialty_id`, etc.).
 *   2. Record real responses as test fixtures, so downstream tests assert against
 *      observed reality rather than documentation.
 *
 * Run: node scripts/verify-api.ts
 *   (Node 24 strips TypeScript natively — no tsx needed.)
 *
 * Reads VITE_ZOCDOC_TOKEN / VITE_ZOCDOC_BASE_URL from .env.local at the repo root.
 * The token is never printed.
 *
 * PHI: the sandbox returns synthetic data only. Do not point this at production.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'packages/api-components/src/client/__fixtures__');

/** Minimal .env parser — avoids needing the token on the command line. */
async function loadEnvLocal(): Promise<Record<string, string>> {
  let raw: string;
  try {
    raw = await readFile(join(ROOT, '.env.local'), 'utf8');
  } catch {
    throw new Error(
      '.env.local not found. Copy .env.local.example to .env.local and add a sandbox token.'
    );
  }
  const env: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const env = await loadEnvLocal();
const BASE = env.VITE_ZOCDOC_BASE_URL ?? 'https://api-developer-sandbox.zocdoc.com';
/**
 * Two auth domains, tried in order.
 *
 * The vanity domain is what the API's www-authenticate header advertises, but
 * Auth0 rejects a client_credentials grant there unless the application is
 * explicitly enabled for the custom domain — observed as
 * "Invalid domain '<host>' for client_id '<id>'" *after* the secret validates.
 * The canonical tenant domain (from the vanity host's CNAME chain) always accepts
 * the grant, so it is the fallback.
 */
const AUTH_BASES: readonly string[] = env.ZOCDOC_AUTH_BASE_URL
  ? [env.ZOCDOC_AUTH_BASE_URL]
  : [
      'https://auth-api-developer-sandbox.zocdoc.com',
      'https://production-api-developer-sandbox.us.auth0.com',
    ];

/**
 * Exchange a client_credentials pair for an access token.
 *
 * This is a dev-only recon script, so minting here is fine. The *library* must
 * never do this (CLIENT-002) — it takes whatever `getToken` returns.
 *
 * ZOCDOC_CLIENT_ID / ZOCDOC_CLIENT_SECRET deliberately lack the `VITE_` prefix:
 * Vite inlines every `import.meta.env.VITE_*` into the browser bundle, and a
 * long-lived client secret must never ship to a browser.
 *
 * The token endpoint path is not documented in-repo, so discover it rather than
 * assuming: try OIDC discovery first, then fall back to conventional paths.
 */
async function discoverTokenEndpoint(): Promise<string[]> {
  const endpoints: string[] = [];

  for (const base of AUTH_BASES) {
    try {
      const res = await fetch(`${base}/.well-known/openid-configuration`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const doc = (await res.json()) as { token_endpoint?: string };
        if (doc.token_endpoint) {
          console.log(`discovered token_endpoint: ${doc.token_endpoint}`);
          endpoints.push(doc.token_endpoint);
          continue;
        }
      }
      console.log(`OIDC discovery at ${base} returned ${res.status}; using /oauth/token.`);
    } catch (error) {
      console.log(
        `OIDC discovery at ${base} failed (${(error as Error).message}); using /oauth/token.`
      );
    }
    // Auth0's token endpoint is always /oauth/token; the earlier run confirmed
    // every other conventional path 404s on this tenant.
    endpoints.push(`${base}/oauth/token`);
  }

  return endpoints;
}

/**
 * The auth host's DNS chain resolves to an Auth0 tenant
 * (production-api-developer-sandbox.us.auth0.com), which pins down the grant shape:
 * Auth0's client_credentials endpoint is POST /oauth/token and it *requires* an
 * `audience` identifying the target API. Omitting it yields
 * "Service not enabled within domain" rather than a token.
 *
 * The audience value is not documented in-repo, so try the plausible identifiers.
 * Set ZOCDOC_AUDIENCE in .env.local to skip the search once it is known.
 */
async function mintToken(clientId: string, clientSecret: string): Promise<string> {
  const endpoints = await discoverTokenEndpoint();

  const audiences: Array<string | undefined> = env.ZOCDOC_AUDIENCE
    ? [env.ZOCDOC_AUDIENCE]
    : [
        'https://api-developer-sandbox.zocdoc.com',
        'https://api-developer-sandbox.zocdoc.com/',
        'https://api-developer-sandbox.zocdoc.com/v1',
        'https://api.zocdoc.com',
        undefined, // last resort: some tenants set a default audience
      ];

  const failures: string[] = [];
  const seen = new Set<string>();

  endpointLoop: for (const endpoint of endpoints) {
    for (const audience of audiences) {
      const base: Record<string, string> = { grant_type: 'client_credentials' };
      if (audience) base.audience = audience;

      // Auth0 accepts JSON and form-encoded; generic OAuth servers may want HTTP
      // Basic instead. Try in order of likelihood for an Auth0 tenant.
      const attempts: { label: string; headers: Record<string, string>; body: string }[] = [
        {
          label: 'json-body',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...base, client_id: clientId, client_secret: clientSecret }),
        },
        {
          label: 'form-body',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams({
            ...base,
            client_id: clientId,
            client_secret: clientSecret,
          }).toString(),
        },
        {
          label: 'basic-auth',
          headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams(base).toString(),
        },
      ];

      for (const attempt of attempts) {
        const key = `${endpoint}|${audience ?? 'none'}|${attempt.label}`;
        if (seen.has(key)) continue;
        seen.add(key);

        let res: Response;
        try {
          res = await fetch(endpoint, {
            method: 'POST',
            headers: attempt.headers,
            body: attempt.body,
          });
        } catch (error) {
          failures.push(`${key} -> network error: ${(error as Error).message}`);
          continue;
        }

        if (res.status === 567) {
          // Do not abort — a blocked vanity domain should not stop the canonical
          // tenant domain from being tried.
          failures.push(
            `${key} -> 567 BLOCKED by sandbox network policy (needs: sbx proxy rules add ${new URL(endpoint).host} --path "*" --verbs "GET|POST")`
          );
          continue endpointLoop;
        }

        const raw = await res.text();
        if (!res.ok) {
          // Error semantics, established empirically against this tenant rather than
          // assumed (a fake id + fake secret was compared against real + fake and
          // real + real):
          //
          //   "Unauthorized"    -> the secret is wrong, or the client is unknown.
          //                        Conclusive: no audience or placement will help.
          //   "Invalid domain"  -> the secret is CORRECT. The client authenticated but
          //                        is not enabled for this (custom) domain. Retry on
          //                        the canonical tenant domain.
          //   "Service not
          //    enabled within
          //    domain"          -> credentials fine, audience wrong. Try the next one.
          if (raw.includes('"Unauthorized"')) {
            throw new Error(
              `The client_secret does not match client_id — or the client is unknown to this tenant.\n` +
                `  Auth0 said: ${raw.slice(0, 200)}\n` +
                `  Re-copy the ID and secret from the same spreadsheet row (secrets are 64 chars).`
            );
          }
          if (raw.includes('Invalid domain')) {
            // Credentials are good; this domain just is not enabled for the client.
            // Varying audience or placement cannot change that — skip to the next host.
            failures.push(
              `${new URL(endpoint).host} -> ${res.status} custom domain not enabled for this client (credentials are valid)`
            );
            continue endpointLoop;
          }

          // Token-endpoint error bodies describe the grant, never echo the secret.
          failures.push(`${key} -> ${res.status} ${raw.slice(0, 200)}`);
          continue;
        }

        const parsed = JSON.parse(raw) as {
          access_token?: string;
          expires_in?: number;
          token_type?: string;
          scope?: string;
        };
        if (!parsed.access_token) {
          failures.push(`${key} -> 200 but no access_token field`);
          continue;
        }

        console.log(`minted access token`);
        console.log(`  endpoint : ${endpoint}`);
        console.log(`  audience : ${audience ?? '(none sent)'}`);
        console.log(`  placement: ${attempt.label}`);
        console.log(
          `  token    : type ${parsed.token_type ?? 'unknown'}, expires_in ${parsed.expires_in ?? 'unknown'}s, ` +
            `length ${parsed.access_token.length}, scope ${parsed.scope ?? '(none)'}`
        );
        if (!env.ZOCDOC_AUDIENCE && audience) {
          console.log(
            `  tip: add ZOCDOC_AUDIENCE=${audience} to .env.local to skip the search next run.`
          );
        }
        return parsed.access_token;
      }
    }
  }

  throw new Error(
    `Could not mint a token. Attempts:\n${failures.map((f) => `  - ${f}`).join('\n')}`
  );
}

let TOKEN: string;
if (env.ZOCDOC_CLIENT_ID && env.ZOCDOC_CLIENT_SECRET) {
  console.log('=== Minting access token (client_credentials) ===');
  TOKEN = await mintToken(env.ZOCDOC_CLIENT_ID, env.ZOCDOC_CLIENT_SECRET);
} else if (env.VITE_ZOCDOC_TOKEN) {
  console.log('Using VITE_ZOCDOC_TOKEN directly (no client credentials found in .env.local).');
  TOKEN = env.VITE_ZOCDOC_TOKEN;
} else {
  throw new Error(
    'Set ZOCDOC_CLIENT_ID and ZOCDOC_CLIENT_SECRET in .env.local (preferred), or VITE_ZOCDOC_TOKEN with an already-minted access token.'
  );
}

interface Probe {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;
  readonly raw: string;
}

/**
 * The response envelope is one of the things we are here to discover, so count
 * items defensively rather than assuming a shape.
 */
function countItems(body: unknown): number | null {
  if (Array.isArray(body)) return body.length;
  if (body && typeof body === 'object') {
    for (const value of Object.values(body)) {
      if (Array.isArray(value)) return value.length;
    }
  }
  return null;
}

function envelopeOf(body: unknown): string {
  if (Array.isArray(body)) return 'bare array';
  if (body && typeof body === 'object') {
    return `{ ${Object.keys(body).join(', ')} }`;
  }
  return typeof body;
}

async function probe(path: string, fixture?: string): Promise<Probe> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  });
  const raw = await res.text();

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    body = raw;
  }

  if (res.status === 567) {
    throw new Error(
      `Blocked by the sandbox network policy. Run in a separate terminal:\n` +
        `  sbx proxy rules add api-developer-sandbox.zocdoc.com --path "/v1/*" --verbs "GET"`
    );
  }
  if (res.status === 401) {
    const challenge = res.headers.get('www-authenticate') ?? '(no www-authenticate header)';
    throw new Error(
      `401 from the API. Challenge: ${challenge}\n` +
        `  error="invalid_token" means the bearer value is not an access token — a client_id/secret pair\n` +
        `  must be exchanged at the auth host first. Set ZOCDOC_CLIENT_ID / ZOCDOC_CLIENT_SECRET.\n` +
        `  error="expired_token" means it simply aged out; re-run to mint a fresh one.`
    );
  }

  if (res.ok && fixture) {
    await writeFile(join(OUT, `${fixture}.json`), JSON.stringify(body, null, 2), 'utf8');
  }

  return { status: res.status, statusText: res.statusText, body, raw };
}

function report(label: string, path: string, p: Probe): void {
  const count = countItems(p.body);
  console.log(
    `${label.padEnd(38)} ${String(p.status).padEnd(4)} ` +
      `${count === null ? 'n/a' : `${count} items`.padEnd(9)}  ${envelopeOf(p.body)}`
  );
  console.log(`${' '.repeat(38)} GET ${path}`);
}

await mkdir(OUT, { recursive: true });

// ---------------------------------------------------------------------------
// 1. Reference data. Also the source of real IDs for the discrimination probes.
// ---------------------------------------------------------------------------
console.log('\n=== Reference data ===');
console.log('label'.padEnd(38) + 'code ' + 'count'.padEnd(11) + 'envelope');

const specialties = await probe('/v1/specialties', 'specialties');
report('specialties', '/v1/specialties', specialties);

const visitReasons = await probe('/v1/visit_reasons', 'visit-reasons');
report('visit_reasons', '/v1/visit_reasons', visitReasons);

const insurancePlans = await probe('/v1/insurance_plans', 'insurance-plans');
report('insurance_plans', '/v1/insurance_plans', insurancePlans);

/** Pull the first id-ish field off the first item of a reference-data response. */
function firstId(body: unknown, ...candidateKeys: string[]): string | null {
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object'
      ? (Object.values(body).find(Array.isArray) as unknown[] | undefined)
      : undefined;
  const first = list?.[0];
  if (!first || typeof first !== 'object') return null;
  const record = first as Record<string, unknown>;
  for (const key of [...candidateKeys, 'id']) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

const specialtyId = firstId(specialties.body, 'specialty_id');
const visitReasonId = firstId(visitReasons.body, 'visit_reason_id');
const insurancePlanId = firstId(insurancePlans.body, 'insurance_plan_id');

console.log(
  `\nresolved ids -> specialty: ${specialtyId} | visit_reason: ${visitReasonId} | insurance_plan: ${insurancePlanId}`
);
console.log(
  `first-item keys (specialties): ${Object.keys((Array.isArray(specialties.body) ? specialties.body[0] : (Object.values(specialties.body as object).find(Array.isArray) as unknown[])?.[0]) ?? {}).join(', ')}`
);

// ---------------------------------------------------------------------------
// 2. Baseline. zip_code is the one param nobody disputes.
// ---------------------------------------------------------------------------
console.log('\n=== Provider locations: baseline ===');
const ZIP = '11201'; // documented in the testing-data guide as returning results
const baseline = await probe(`/v1/provider_locations?zip_code=${ZIP}`, 'provider-locations');
report('baseline (zip_code only)', `/v1/provider_locations?zip_code=${ZIP}`, baseline);

const baselineCount = countItems(baseline.body);

// ---------------------------------------------------------------------------
// 3. Parameter-name discrimination.
//
// A 200 alone proves nothing: unknown query params are usually ignored silently.
// So each spelling is sent twice --- once with a real id, once with a bogus one:
//
//   recognized spelling -> bogus value changes the result (400, or count drops)
//   ignored spelling    -> bogus value returns the baseline count unchanged
// ---------------------------------------------------------------------------
console.log('\n=== Parameter-name discrimination ===');
console.log(`baseline count to compare against: ${baselineCount}`);

const BOGUS = 'zzz-not-a-real-id-zzz';

const pairs: ReadonlyArray<{
  readonly guide: string;
  readonly openapi: string;
  readonly realValue: string | null;
}> = [
  { guide: 'specialty_id', openapi: 'specialty', realValue: specialtyId },
  { guide: 'visit_reason_id', openapi: 'visit_reason', realValue: visitReasonId },
  { guide: 'insurance_plan_id', openapi: 'accepted_insurance', realValue: insurancePlanId },
];

const verdicts: string[] = [];

for (const { guide, openapi, realValue } of pairs) {
  console.log(`\n-- ${guide} (booking guide) vs ${openapi} (OpenAPI) --`);

  for (const name of [guide, openapi]) {
    const bogusPath = `/v1/provider_locations?zip_code=${ZIP}&${name}=${BOGUS}`;
    const bogus = await probe(bogusPath);
    report(`${name}=<bogus>`, bogusPath, bogus);

    let realCount: number | null = null;
    if (realValue) {
      const realPath = `/v1/provider_locations?zip_code=${ZIP}&${name}=${encodeURIComponent(realValue)}`;
      const real = await probe(realPath);
      report(`${name}=<real>`, realPath, real);
      realCount = countItems(real.body);
    }

    const bogusCount = countItems(bogus.body);
    const recognized = bogus.status >= 400 || (bogusCount !== null && bogusCount !== baselineCount);
    verdicts.push(
      `${name}: ${recognized ? 'RECOGNIZED' : 'ignored'} ` +
        `(bogus -> ${bogus.status}/${bogusCount}, real -> ${realCount}, baseline ${baselineCount})`
    );
  }
}

// ---------------------------------------------------------------------------
// 4. Paging — the booking guide claims page / page_size, OpenAPI does not list them.
// ---------------------------------------------------------------------------
console.log('\n=== Paging ===');
const pagedPath = `/v1/provider_locations?zip_code=${ZIP}&page=1&page_size=2`;
const paged = await probe(pagedPath, 'provider-locations-paged');
report('page=1&page_size=2', pagedPath, paged);
const pagedCount = countItems(paged.body);
verdicts.push(
  `page/page_size: ${pagedCount === 2 ? 'HONORED (got exactly 2)' : `unclear (got ${pagedCount}, baseline ${baselineCount})`}`
);

// ---------------------------------------------------------------------------
// 5. Documented sandbox behaviors, used later as component-state test inputs.
// ---------------------------------------------------------------------------
console.log('\n=== Documented empty / error scenarios ===');
const emptyPath = `/v1/provider_locations?zip_code=99734`;
const empty = await probe(emptyPath, 'provider-locations-empty');
report('zip 99734 (expect empty)', emptyPath, empty);

const errorPath = `/v1/provider_locations?zip_code=10112`;
const errored = await probe(errorPath);
report('zip 10112 (expect 500)', errorPath, errored);

// ---------------------------------------------------------------------------
// 6. Availability — needs a real provider_location_id from the baseline response.
// ---------------------------------------------------------------------------
console.log('\n=== Availability ===');
const providerLocationId = firstId(baseline.body, 'provider_location_id');
console.log(`provider_location_id from baseline: ${providerLocationId}`);

const baselineFirst = Array.isArray(baseline.body)
  ? baseline.body[0]
  : (Object.values(baseline.body as object).find(Array.isArray) as unknown[] | undefined)?.[0];
console.log(
  `provider-location object keys: ${Object.keys((baselineFirst as object) ?? {}).join(', ')}`
);

if (providerLocationId && visitReasonId) {
  const availPath =
    `/v1/provider_locations/availability?provider_location_ids=${encodeURIComponent(providerLocationId)}` +
    `&visit_reason_id=${encodeURIComponent(visitReasonId)}&patient_type=new`;
  const avail = await probe(availPath, 'availability');
  report('availability', availPath, avail);
  console.log(`\navailability body (first 800 chars):\n${avail.raw.slice(0, 800)}`);
} else {
  console.log(
    'SKIPPED — could not resolve a provider_location_id and visit_reason_id from earlier responses.'
  );
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n=== VERDICTS (copy into docs/api-contract-notes.md) ===');
for (const verdict of verdicts) console.log(`  ${verdict}`);
console.log(`\nFixtures written to ${OUT}`);
console.log('Next: read each fixture, confirm no PHI, then write docs/api-contract-notes.md.');
