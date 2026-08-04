/**
 * Diagnostic: find which credential pair is provisioned for the developer sandbox.
 *
 * Reads every numbered pair from .env.local and reports how far each one gets
 * through Auth0's checks. Secrets are never printed — only verdicts.
 *
 *   ZOCDOC_CLIENT_ID_1=...      ZOCDOC_CLIENT_SECRET_1=...
 *   ZOCDOC_CLIENT_ID_2=...      ZOCDOC_CLIENT_SECRET_2=...
 *   (the unnumbered ZOCDOC_CLIENT_ID / _SECRET pair is included too)
 *
 * Run: node scripts/find-sandbox-credentials.ts
 *
 * Endpoint and audience are the documented sandbox values from
 * https://api-docs.zocdoc.com/guides/authentication.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const TOKEN_URL = 'https://auth-api-developer-sandbox.zocdoc.com/oauth/token';
const CANONICAL_URL = 'https://production-api-developer-sandbox.us.auth0.com/oauth/token';
const AUDIENCE = 'https://api-developer-sandbox.zocdoc.com/';

const raw = await readFile(join(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
for (const line of raw.split('\n')) {
  const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

interface Pair {
  readonly label: string;
  readonly id: string;
  readonly secret: string;
}

const pairs: Pair[] = [];
if (env.ZOCDOC_CLIENT_ID && env.ZOCDOC_CLIENT_SECRET) {
  pairs.push({ label: 'unnumbered', id: env.ZOCDOC_CLIENT_ID, secret: env.ZOCDOC_CLIENT_SECRET });
}
for (let n = 1; n <= 20; n++) {
  const id = env[`ZOCDOC_CLIENT_ID_${n}`];
  const secret = env[`ZOCDOC_CLIENT_SECRET_${n}`];
  if (id && secret) pairs.push({ label: `pair ${n}`, id, secret });
}

if (pairs.length === 0) {
  throw new Error(
    'No credential pairs found. Add ZOCDOC_CLIENT_ID_1 / ZOCDOC_CLIENT_SECRET_1 (and _2, _3, …) to .env.local.'
  );
}

/**
 * Auth0's verdicts, established empirically against this tenant. The status code
 * matters as much as the message: 401 and 403 both say "Unauthorized" but mean
 * different things.
 *
 * The 403 is deliberately worded to claim NOTHING about the audience. Probing
 * this tenant on 2026-08-04 showed 403 is returned identically for the correct
 * audience, a nonsense audience, an omitted audience, and even a bogus
 * `grant_type` — so the denial happens before Auth0 parses the grant type or
 * resolves the audience. An earlier version of this file asserted "audience OK"
 * here; that was wrong, and it misdirected the ask to Zocdoc. The secret is the
 * only input that changes the outcome: wrong secret -> 401, correct -> 403.
 */
function classify(status: number, body: string): { verdict: string; success: boolean } {
  if (status === 200 && body.includes('access_token')) {
    return { verdict: 'SUCCESS — token issued', success: true };
  }
  if (body.includes('Invalid domain')) {
    return { verdict: 'secret OK, but client not enabled for the custom domain', success: false };
  }
  if (body.includes('Service not enabled within domain')) {
    return { verdict: 'secret OK, audience not enabled for this client', success: false };
  }
  if (status === 403) {
    return {
      verdict: 'secret OK — but client denied at the token endpoint (no grants of any kind)',
      success: false,
    };
  }
  if (status === 401) {
    return { verdict: 'rejected — wrong secret, or unknown client_id', success: false };
  }
  return { verdict: `unexpected: ${status} ${body.slice(0, 120)}`, success: false };
}

async function attempt(
  url: string,
  pair: Pair
): Promise<{ verdict: string; success: boolean; token?: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: pair.id,
      client_secret: pair.secret,
      audience: AUDIENCE,
    }),
  });
  const body = await res.text();
  const result = classify(res.status, body);
  if (result.success) {
    const parsed = JSON.parse(body) as { access_token: string; expires_in?: number };
    return { ...result, token: parsed.access_token };
  }
  return result;
}

console.log(`Testing ${pairs.length} credential pair(s)`);
console.log(`audience: ${AUDIENCE}\n`);

let winner: { pair: Pair; url: string; token: string } | null = null;

for (const pair of pairs) {
  // client_id is a public identifier, safe to show; the secret never is.
  console.log(`${pair.label} — client_id ${pair.id}`);
  for (const [name, url] of [
    ['documented (vanity)', TOKEN_URL],
    ['canonical tenant', CANONICAL_URL],
  ] as const) {
    try {
      const result = await attempt(url, pair);
      console.log(`  ${name.padEnd(22)} ${result.verdict}`);
      if (result.success && result.token && !winner) {
        winner = { pair, url, token: result.token };
      }
    } catch (error) {
      console.log(`  ${name.padEnd(22)} request failed: ${(error as Error).message}`);
    }
  }
  console.log();
}

if (winner) {
  console.log('='.repeat(70));
  console.log(`WORKING PAIR: ${winner.pair.label} (client_id ${winner.pair.id})`);
  console.log(`token endpoint: ${winner.url}`);
  console.log(`token length: ${winner.token.length}`);
  console.log(
    '\nPut this pair in .env.local as ZOCDOC_CLIENT_ID / ZOCDOC_CLIENT_SECRET, then run:'
  );
  console.log('  node scripts/verify-api.ts');
} else {
  console.log('='.repeat(70));
  console.log('No pair could mint a token for the developer sandbox.');
  console.log('If every pair reports "denied at the token endpoint", the clients authenticate');
  console.log('but are not provisioned to issue machine-to-machine tokens on this tenant.');
  console.log('That is a Zocdoc-side provisioning problem, not a code problem — and adding');
  console.log('more pairs from the same spreadsheet will not change it.');
}
