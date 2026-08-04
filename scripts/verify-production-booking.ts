/**
 * Verifies the booking path — `POST /v1/appointments` — against the Zocdoc **production**
 * developer API, then cancels what it books.
 *
 * Run: node scripts/verify-production-booking.ts
 *   (Node 24 strips TypeScript natively — no tsx needed.)
 *
 * ## Why this is a third script, and why it duplicates the auth helpers
 *
 * `verify-api.ts` targets sandbox. `verify-production-reference-data.ts` reads production,
 * and its header makes a structural promise: *the HTTP method is not a parameter anywhere in
 * that file*, so it cannot book. Hoisting a shared request helper that understands POST
 * would quietly void that promise. Sharing only `loadEnvLocal` / `mintToken` would be
 * DRY-er, but this is the one script in the repo that can create a real appointment at a
 * real provider's office, and a reviewer should be able to read it top to bottom and see
 * everything it is capable of without following imports. Fifty duplicated lines of
 * token-minting is a fair price for that.
 *
 * ## What this does to the outside world, and how that is bounded
 *
 * A booking here is real: a real practice's calendar gets an appointment on it. Three
 * bounds, in descending order of how much they matter:
 *
 * 1. **The cancel is mandatory, not best-effort.** The booking happens inside a `try` whose
 *    `finally` cancels — so an exception, a failed status check, even a `throw` from the
 *    shape recorder still cancels. If the cancel itself fails, the script exits non-zero
 *    and prints the appointment id in a block that is hard to miss, because at that point a
 *    human has to clean up.
 * 2. **The furthest-out timeslot wins.** 30 days out rather than this afternoon, so in the
 *    seconds it is held it is the least likely slot to be one a real patient wanted.
 * 3. **The path allowlist is six entries** and, unlike the reference script, the method is
 *    per-path — a path may only be called with the method it is listed under. Four are GETs
 *    (three to find a bookable slot, one to read the booked appointment back); only two can
 *    write. The per-path methods are not decoration: on the first successful run the
 *    allowlist correctly refused a `GET /v1/appointments` this file had forgotten to
 *    declare, and the `finally` cancelled the appointment anyway before the error
 *    propagated.
 *
 * ## The patient is fabricated from reserved ranges, not invented plausibly
 *
 * PHI-002 says test data comes from the documented scenarios only. Those scenarios
 * (`pr_pending`, `pr_confirmed`, `pr_bookingfailed`) are **sandbox-only** — the guide's first
 * line says so — so on production there is nothing documented to use, and Burton authorized
 * production writes on 2026-08-04 knowing that. The rule's *purpose* still binds, though:
 * no test datum may correspond to a real person. So every field comes from a range reserved
 * by standard to be unusable:
 *
 * - **Phone `2125550123`** — NANP reserves 555-0100 through 555-0199 as fictional; the block
 *   is unassignable, so no one's phone can ring. It also satisfies Zocdoc's validation
 *   (digits 1 and 4 are `2` and `5`, neither `0` nor `1`).
 * - **Email `@example.com`** — RFC 2606 reserves `example.com` precisely so it can never be
 *   a real recipient. This matters more than it looks: booking triggers a confirmation
 *   message, and a plausible-looking address would have sent a stranger a real appointment
 *   confirmation for care they never requested.
 * - **Name / DOB / address** — obviously synthetic, not a name-shaped name.
 *
 * ## PHI
 *
 * Fabricated data is not PHI, but the *response* is patient-shaped, so:
 *
 * - Patient values are never logged (PHI-001). `PATIENT` is never passed to `console.log`,
 *   and request bodies are not echoed on error.
 * - **No appointment response is written to disk verbatim.** Only a key → type skeleton,
 *   with every value discarded. `__fixtures__/README.md` bans recording appointment
 *   responses from production; a shape is not a response, and the distinction is the whole
 *   reason the recorder below throws away values instead of redacting them.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'packages/api-components/src/client/__fixtures__');

const AUTH_URL = 'https://auth.zocdoc.com/oauth/token';
const AUDIENCE = 'https://api-developer.zocdoc.com/';
const BASE = 'https://api-developer.zocdoc.com';

/**
 * The authorized surface, method-scoped. `call()` rejects any pair not listed.
 *
 * Note what is absent: no reschedule, no attachment, no status update. Booking and
 * cancelling is the whole job.
 */
const ALLOWED: ReadonlyArray<{ method: 'GET' | 'POST'; path: string }> = [
  { method: 'GET', path: '/v1/specialties' },
  { method: 'GET', path: '/v1/provider_locations' },
  { method: 'GET', path: '/v1/provider_locations/availability' },
  { method: 'GET', path: '/v1/appointments' },
  { method: 'POST', path: '/v1/appointments' },
  { method: 'POST', path: '/v1/appointments/cancel' },
];

/**
 * Dermatologist in Brooklyn, because availability in this directory is sparse: across four
 * ZIP codes on 2026-08-04, only 2 of 41 sampled locations had any availability at all, and
 * every Dentist result had none. This is one of the two that works.
 */
const ZIP = '11201';
const SPECIALTY_ID = 'sp_101';

/**
 * The fabricated patient. Reserved ranges only — see the header for why each one.
 *
 * Never logged, never written to disk.
 */
const PATIENT = {
  first_name: 'Apiverify',
  last_name: 'Testpatient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '2125550123',
  email_address: 'zocdoc-api-verify@example.com',
  patient_address: {
    address1: '1 Test Street',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: ZIP,
  },
} as const;

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
 * Reports Auth0's `error` / `error_description` verbatim on failure, which is safe: those
 * describe the client and the grant, never the secret.
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
 * Issue one allowlisted (method, path) call.
 *
 * `pathForAllowlist` exists because `GET /v1/appointments/{id}` has a variable path that
 * cannot be matched literally. Rather than loosen the allowlist to a prefix match, the
 * caller states which allowlist entry it believes it is using, and gets refused if that
 * entry is not there.
 */
async function call(
  token: string,
  method: 'GET' | 'POST',
  path: string,
  options: { query?: Record<string, string>; body?: unknown; pathForAllowlist?: string } = {}
): Promise<Probe> {
  const claimed = options.pathForAllowlist ?? path;
  if (!ALLOWED.some((entry) => entry.method === method && entry.path === claimed)) {
    throw new Error(
      `Refusing ${method} ${claimed}: not in ALLOWED. This script is scoped to booking ` +
        `and cancelling one appointment. Widening it is a deliberate, reviewable change.`
    );
  }

  const url = new URL(path, BASE);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });

  const raw = await response.text();
  let body: unknown = raw;
  try {
    body = JSON.parse(raw);
  } catch {
    // Leave `body` as the raw text.
  }
  return { status: response.status, body, raw };
}

/** YYYY-MM-DD, the format the availability date params take. */
function asDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Describes a decoded body as key path → type, discarding every value.
 *
 * Arrays collapse to their first element's shape with a count, so a 164-slot list becomes
 * one entry rather than 164. Values are *dropped*, not masked: there is no redaction step
 * to get wrong, and nothing patient-shaped can survive a function that only ever emits
 * `typeof`.
 */
function shapeOf(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.length === 0 ? [] : [shapeOf(value[0]), `… ${value.length} items`];
  }
  if (value === null) return 'null';
  if (typeof value !== 'object') return typeof value;

  const shape: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) shape[key] = shapeOf(child);
  return shape;
}

interface Slot {
  providerLocationId: string;
  startTime: string;
  visitReasonId: string;
}

/**
 * The specialty's default visit reason.
 *
 * Needed *before* availability can be queried: `/v1/provider_locations/availability` rejects
 * a call without `visit_reason_id` and `patient_type` (400, `invalid_request`) even though
 * both read like filters. Learned the hard way on 2026-08-04.
 */
async function defaultVisitReasonId(token: string): Promise<string> {
  const probe = await call(token, 'GET', '/v1/specialties');
  if (probe.status !== 200) {
    throw new Error(`Specialties failed: ${probe.status} ${probe.raw.slice(0, 200)}`);
  }

  const data = (probe.body as { data?: unknown }).data;
  const items = Array.isArray(data)
    ? data
    : (((data as { specialties?: unknown })?.specialties ?? []) as unknown[]);

  for (const item of items) {
    const { id, default_visit_reason_id: visitReasonId } = item as Record<string, unknown>;
    if (id === SPECIALTY_ID && typeof visitReasonId === 'string') return visitReasonId;
  }
  throw new Error(`No default_visit_reason_id found for ${SPECIALTY_ID}.`);
}

/** Find a bookable timeslot: search the ZIP, probe availability, take the furthest-out slot. */
async function findSlot(token: string, visitReasonId: string): Promise<Slot> {
  const search = await call(token, 'GET', '/v1/provider_locations', {
    query: { zip_code: ZIP, specialty_id: SPECIALTY_ID, visit_type: 'all' },
  });
  if (search.status !== 200) {
    throw new Error(`Provider search failed: ${search.status} ${search.raw.slice(0, 200)}`);
  }

  const data = (search.body as { data?: { provider_locations?: unknown } }).data;
  const locations = Array.isArray(data?.provider_locations) ? data.provider_locations : [];
  const ids = locations
    .map((entry) => (entry as { provider_location_id?: unknown }).provider_location_id)
    .filter((id): id is string => typeof id === 'string');
  console.log(`  search   : ${ids.length} location(s) in ${ZIP} for ${SPECIALTY_ID}`);
  if (ids.length === 0) throw new Error('No provider locations to probe.');

  // 30 days, not 31: `availability_range_in_days` rejects 31 with a 400. The docs describe
  // the window as "max 31 days", which is off by one against what the API accepts.
  const start = new Date();
  const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  const availability = await call(token, 'GET', '/v1/provider_locations/availability', {
    query: {
      provider_location_ids: ids.join(','),
      visit_reason_id: visitReasonId,
      patient_type: 'new',
      start_date_in_provider_local_time: asDate(start),
      end_date_in_provider_local_time: asDate(end),
      published_context: 'direct_listing',
    },
  });
  if (availability.status !== 200) {
    throw new Error(
      `Availability failed: ${availability.status} ${availability.raw.slice(0, 500)}`
    );
  }

  const entries = (availability.body as { data?: unknown }).data;
  for (const entry of Array.isArray(entries) ? entries : []) {
    const { provider_location_id: locationId, timeslots } = entry as {
      provider_location_id?: unknown;
      timeslots?: unknown;
    };
    if (typeof locationId !== 'string' || !Array.isArray(timeslots) || timeslots.length === 0) {
      continue;
    }

    // Furthest-out slot, so the slot held during the book/cancel round trip is the one a
    // real patient is least likely to have wanted.
    const slot = timeslots.at(-1) as { start_time?: unknown; visit_reason_id?: unknown };
    if (typeof slot.start_time !== 'string' || typeof slot.visit_reason_id !== 'string') continue;

    console.log(`  slot     : ${timeslots.length} available, taking the last (${slot.start_time})`);
    return {
      providerLocationId: locationId,
      startTime: slot.start_time,
      visitReasonId: slot.visit_reason_id,
    };
  }

  throw new Error(
    `No location in ${ZIP} reported any availability. Availability here is sparse — see ` +
      `docs/api-contract-notes.md. Re-run later or widen the market.`
  );
}

/** Pull `data.appointment_id` / `data.appointment_status` out of a booking-ish response. */
function appointmentOf(body: unknown): { id: string | null; status: string | null } {
  const data = (body as { data?: unknown })?.data;
  if (!data || typeof data !== 'object') return { id: null, status: null };
  const { appointment_id: id, appointment_status: status } = data as Record<string, unknown>;
  return {
    id: typeof id === 'string' ? id : null,
    status: typeof status === 'string' ? status : null,
  };
}

async function main(): Promise<void> {
  const env = await loadEnvLocal();
  const clientId = env.ZOCDOC_CLIENT_ID;
  const clientSecret = env.ZOCDOC_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('ZOCDOC_CLIENT_ID and ZOCDOC_CLIENT_SECRET must be set in .env.local.');
  }

  console.log('\n=== Booking verification (PRODUCTION — books, then cancels) ===\n');
  const token = await mintToken(clientId, clientSecret);
  console.log('  auth     : token minted');

  const visitReasonId = await defaultVisitReasonId(token);
  console.log(`  reason   : ${visitReasonId} (default for ${SPECIALTY_ID})`);

  const slot = await findSlot(token, visitReasonId);

  console.log('\n-- POST /v1/appointments --');
  const booking = await call(token, 'POST', '/v1/appointments', {
    body: {
      appointment_type: 'providers',
      data: {
        start_time: slot.startTime,
        visit_reason_id: slot.visitReasonId,
        provider_location_id: slot.providerLocationId,
        patient_type: 'new',
        patient: PATIENT,
      },
    },
  });

  console.log(`  status   : ${booking.status}`);
  const { id: appointmentId, status: bookingStatus } = appointmentOf(booking.body);
  console.log(`  appt     : ${appointmentId ?? '(none returned)'} / ${bookingStatus ?? '?'}`);

  if (booking.status >= 400) {
    // Safe to print: 4xx bodies here describe the *request contract* (missing field, bad
    // enum), and the request carried no real patient data to echo back.
    console.log(`  body     : ${booking.raw.slice(0, 500)}`);
  }

  if (!appointmentId) {
    console.log('\n  Nothing was booked, so there is nothing to cancel.');
    return;
  }

  try {
    console.log('\n-- GET /v1/appointments/{id} --');
    const status = await call(token, 'GET', `/v1/appointments/${appointmentId}`, {
      pathForAllowlist: '/v1/appointments',
    });
    console.log(`  status   : ${status.status}`);
    console.log(`  appt     : ${appointmentOf(status.body).status ?? '?'}`);

    await mkdir(OUT, { recursive: true });
    await writeFile(
      join(OUT, 'appointment-response-shape.json'),
      `${JSON.stringify(
        {
          note: 'Key → type only. No values, patient or otherwise, are recorded here.',
          recorded: asDate(new Date()),
          'POST /v1/appointments': shapeOf(booking.body),
          'GET /v1/appointments/{id}': shapeOf(status.body),
        },
        null,
        2
      )}\n`
    );
    console.log('  recorded : appointment-response-shape.json (types only, no values)');
  } finally {
    console.log('\n-- POST /v1/appointments/cancel --');
    const cancel = await call(token, 'POST', '/v1/appointments/cancel', {
      body: {
        appointment_id: appointmentId,
        cancellation_reason_type: 'other_patient_reason',
        cancellation_reason: 'Automated API contract verification — not a real patient.',
      },
    });
    console.log(`  status   : ${cancel.status}`);
    console.log(`  appt     : ${appointmentOf(cancel.body).status ?? '?'}`);

    if (cancel.status >= 400 || appointmentOf(cancel.body).status !== 'cancelled') {
      console.log(`  body     : ${cancel.raw.slice(0, 500)}`);
      console.log(
        `\n${'!'.repeat(78)}\n` +
          `CANCEL DID NOT CONFIRM. A real appointment may still be on a real provider's\n` +
          `calendar. Cancel it by hand:\n\n  appointment_id: ${appointmentId}\n\n` +
          `${'!'.repeat(78)}\n`
      );
      process.exitCode = 1;
    } else {
      console.log('  clean    : appointment cancelled, nothing left on the calendar');
    }
  }
}

await main();
