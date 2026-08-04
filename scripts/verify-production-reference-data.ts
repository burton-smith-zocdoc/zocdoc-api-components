/**
 * Records reference-data fixtures from the Zocdoc **production** developer API.
 *
 * Run: node scripts/verify-production-reference-data.ts
 *   (Node 24 strips TypeScript natively — no tsx needed.)
 *
 * ## Why this is a separate script from `verify-api.ts`
 *
 * `verify-api.ts` targets the sandbox. Rather than add a production flag to it — a flag
 * is one typo away from an unintended production call — this script hard-codes a path
 * allowlist and refuses everything else.
 *
 * ## Scope, and why it is drawn here
 *
 * **Every request is a GET, and the method is not a parameter anywhere in this file.**
 * That is the load-bearing guarantee, not a stylistic choice: it structurally prevents
 * `POST /v1/appointments`, which on production would book a real appointment at a real
 * provider's office. Reads have no side effects; that write is irreversible and lands on
 * a third party. Making this script capable of booking is a deliberate change that
 * should be reviewed on its own, not a parameter someone can pass.
 *
 * Nothing requested here returns patient data (PHI-001):
 *
 * - Specialties, visit reasons, and insurance plans are catalogs — what a practice
 *   offers and which plans exist.
 * - Provider search and availability return *provider* and *timeslot* data: names,
 *   NPIs, practice addresses, open appointment times. Providers are not patients, and
 *   this is the same directory data zocdoc.com serves publicly. A search response
 *   carries no patient fields at all — there is no patient in a search.
 *
 * To keep that claim honest rather than assumed, `findPatientFields` walks every
 * recorded response for patient-shaped keys and refuses to write the fixture if it finds
 * any. If Zocdoc ever adds such a field, this fails loudly instead of committing it.
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

/**
 * The whole authorized surface. `get()` rejects anything not listed here.
 *
 * `POST /v1/appointments` is absent and must stay absent — see the header. Adding a path
 * here only ever widens *reads*, since this file has no way to issue anything else.
 */
const ALLOWED_PATHS = [
  '/v1/specialties',
  '/v1/visit_reasons',
  '/v1/insurance_plans',
  '/v1/provider_locations',
  '/v1/provider_locations/availability',
] as const;

/**
 * Keys that would indicate patient data in a response. Checked against every fixture
 * before it is written, so "these endpoints return no PHI" is enforced rather than
 * asserted. Deliberately includes near-misses like `patient_name`, which no endpoint
 * documents but which a future field could plausibly be called.
 */
const PATIENT_FIELD_NAMES = new Set([
  'patient',
  'patient_name',
  'patient_id',
  'developer_patient_id',
  'first_name',
  'last_name',
  'date_of_birth',
  'sex_at_birth',
  'gender',
  'email_address',
  'insurance_member_id',
  'insurance_group_number',
]);

/**
 * Walks a decoded JSON body and returns every patient-shaped key found, with its path.
 *
 * `provider.first_name` and `provider.last_name` are expected and allowed — a provider is
 * not a patient — so keys nested under a `provider` object are skipped. That exception is
 * narrow on purpose: anywhere *else*, a `first_name` is a finding.
 */
function findPatientFields(value: unknown, path = '', underProvider = false): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findPatientFields(item, `${path}[${index}]`, underProvider)
    );
  }
  if (!value || typeof value !== 'object') return [];

  const hits: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (!underProvider && PATIENT_FIELD_NAMES.has(key)) hits.push(childPath);
    hits.push(...findPatientFields(child, childPath, underProvider || key === 'provider'));
  }
  return hits;
}

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
  // Refuse rather than warn. A fixture is committed, so a patient field reaching disk is
  // the failure we cannot walk back; a script that stops is trivially recoverable.
  const hits = findPatientFields(probe.body);
  if (hits.length > 0) {
    throw new Error(
      `Refusing to write ${name}.json: found patient-shaped field(s) at ` +
        `${hits.slice(0, 10).join(', ')}${hits.length > 10 ? ` (+${hits.length - 10} more)` : ''}. ` +
        `Review this response by hand before recording anything from it.`
    );
  }

  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, `${name}.json`), `${JSON.stringify(probe.body, null, 2)}\n`);
  console.log(`  recorded : ${name}.json (scanned clean)`);
}

function report(label: string, probe: Probe): void {
  const count = countItems(probe.body);
  console.log(`\n-- ${label} --`);
  console.log(`  status   : ${probe.status}`);
  console.log(`  envelope : ${envelopeOf(probe.body)}`);
  console.log(`  items    : ${count ?? '(not a recognized list envelope)'}`);
  if (probe.status >= 400) console.log(`  body     : ${probe.raw.slice(0, 300)}`);
}

/** The list inside a paged envelope, whether `data` is the array or wraps it. */
function itemsOf(body: unknown, nestedKey?: string): Record<string, unknown>[] {
  const data = Array.isArray(body) ? body : (body as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (nestedKey && data && typeof data === 'object') {
    const nested = (data as Record<string, unknown>)[nestedKey];
    if (Array.isArray(nested)) return nested as Record<string, unknown>[];
  }
  return [];
}

/**
 * Specialties likely to have providers in a dense urban ZIP, most-common first.
 *
 * Taking the first specialty alphabetically is what made the earlier run useless: it
 * resolved to "Abdominal Radiologist", which correctly has zero bookable locations in
 * Brooklyn, so every downstream probe skipped for want of a provider_location_id. The
 * search below walks this list until a specialty actually returns results.
 */
const SPECIALTY_PREFERENCE = [
  'Dentist',
  'Primary Care Physician',
  'Dermatologist',
  'Optometrist',
  'Psychiatrist',
  'Podiatrist',
];

/**
 * Sorted copy of a list of names, so console output is stable between runs.
 *
 * Deliberately not `toSorted()`, which is the obvious choice and does not work here:
 * `tsconfig.base.json` sets `lib: ES2022` because this library ships to browsers, and
 * `Array#toSorted` is ES2023 — so it fails `tsc` even though the Node 24 runtime supports
 * it. Sorting a spread copy leaves the caller's array untouched, which is the only thing
 * the lint rule is guarding against.
 */
function sortedNames(values: string[]): string[] {
  // oxlint-disable-next-line no-array-sort -- sorts a copy, so nothing is mutated
  return [...values].sort();
}

/** YYYY-MM-DD, the format the availability date params take. */
function asDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type Specialty = { id: string; name: string; defaultVisitReasonId: string | null };

/** Specialties for the preferred names present in the response, in preference order. */
function preferredSpecialties(body: unknown): Specialty[] {
  const byName = new Map<string, Specialty>();
  for (const raw of itemsOf(body, 'specialties')) {
    const { id, name, default_visit_reason_id: visitReason } = raw;
    if (typeof id !== 'string' || typeof name !== 'string') continue;
    byName.set(name, {
      id,
      name,
      defaultVisitReasonId: typeof visitReason === 'string' ? visitReason : null,
    });
  }
  const picks = SPECIALTY_PREFERENCE.map((name) => byName.get(name)).filter(
    (pick): pick is Specialty => pick !== undefined
  );
  // Fall back to whatever came first, so the script still does something useful if none
  // of the preferred names are on this page of results.
  return picks.length > 0 ? picks : [...byName.values()].slice(0, 1);
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
const candidates = preferredSpecialties(specialties.body);
const specialtyId = candidates[0]?.id ?? null;
console.log(
  `\nspecialty candidates resolved: ${candidates.map((c) => `${c.name} (${c.id})`).join(', ') || '(none)'}`
);

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

// ---------------------------------------------------------------------------
// Provider search and availability. Reads only.
//
// These resolve four things the spec leaves open, each of which currently blocks or
// misinforms downstream work:
//
//   1. The original Task 2 question: are the search params `specialty_id` or `specialty`?
//      Settled from the spec, but never confirmed against a running server.
//   2. `booking_requirements.required_fields` — the spec says "Options include …", which
//      is non-exhaustive, so the patient form cannot be built from the docs alone.
//   3. The `timeslots` item shape, live rather than spec-derived.
//   4. Whether the `|` in a provider_location_id must be percent-encoded in a query
//      string. The spec never says, and the examples show it unescaped.

console.log(`\n=== Provider search on ${BASE} (GET only) ===`);

/** Brooklyn. A real ZIP on production, so this returns real practices. */
const ZIP = '11201';

/**
 * Walk the candidate specialties looking for one whose results include a location with a
 * non-null `first_availability_date_in_provider_local_time`.
 *
 * Stopping at the first *non-empty* result is not good enough. In this directory every
 * Dentist in every market sampled has a null first-availability date, so the availability
 * probe below returns ten empty timeslot arrays and teaches nothing — the endpoint is
 * behaving correctly, there is simply nothing to book. A location advertising a first
 * availability date is the one that can actually exercise the timeslot shape, so prefer
 * that and fall back to any non-empty result only if none is found.
 */
let search: Probe | null = null;
let searched: Specialty | null = null;
for (const candidate of candidates) {
  // Sequential on purpose: this stops as soon as a usable specialty turns up, so running
  // the candidates in parallel would issue production requests we do not need.
  // oxlint-disable-next-line no-await-in-loop
  const probe = await get(token, '/v1/provider_locations', {
    zip_code: ZIP,
    specialty_id: candidate.id,
    visit_type: 'all',
  });
  report(
    `/v1/provider_locations?zip_code=${ZIP}&specialty_id=${candidate.id} (${candidate.name})`,
    probe
  );

  const found = itemsOf(probe.body, 'provider_locations');
  const bookable = found.filter(
    (location) => location.first_availability_date_in_provider_local_time !== null
  ).length;
  console.log(`  locations: ${found.length} (${bookable} with a first-availability date)`);

  // Keep the first non-empty result as a fallback, but keep looking for a bookable one.
  if (
    search === null ||
    (search.status === 200 && itemsOf(search.body, 'provider_locations').length === 0)
  ) {
    search = probe;
    searched = candidate;
  }
  if (probe.status !== 200) break;
  if (bookable > 0) {
    search = probe;
    searched = candidate;
    break;
  }
}

/**
 * The disputed spelling, sent *instead of* `specialty_id`.
 *
 * The tell is which error comes back. `specialty` being silently ignored means the
 * request has neither required filter, so it should fail the "one of specialty_id or
 * visit_reason_id is required" check — which proves the parameter is unrecognized far
 * more directly than a 200 with suspicious results would.
 */
const wrongSpelling = await get(token, '/v1/provider_locations', {
  zip_code: ZIP,
  specialty: specialtyId ?? '',
});
report(`/v1/provider_locations?zip_code=${ZIP}&specialty=… (disputed spelling)`, wrongSpelling);
if (wrongSpelling.status >= 400) {
  console.log('  => `specialty` is NOT accepted; the required-filter check rejected it.');
} else {
  console.log('  => 200. Inspect whether results were filtered at all before concluding.');
}

if (search?.status === 200) {
  await record('provider-locations', search);

  // `data` is an object here, not an array — results nest at data.provider_locations.
  const locations = itemsOf(search.body, 'provider_locations');

  // Probe against a location that advertises availability if there is one; those are the
  // only results that can exercise the timeslot shape.
  const first =
    locations.find(
      (location) => location.first_availability_date_in_provider_local_time !== null
    ) ?? locations[0];
  const locationId =
    typeof first?.provider_location_id === 'string' ? first.provider_location_id : null;

  // Structural output only — key names and counts, not real providers' details.
  if (first) {
    console.log(`  keys     : ${sortedNames(Object.keys(first)).join(', ')}`);
  }

  // (2) The actual required_fields values, across every result rather than just the first.
  const requiredFields = new Set<string>();
  for (const location of locations) {
    const requirements = location.booking_requirements as { required_fields?: unknown } | undefined;
    const fields = requirements?.required_fields;
    if (!Array.isArray(fields)) continue;
    for (const field of fields) {
      if (typeof field === 'string') requiredFields.add(field);
    }
  }
  console.log(
    `  required_fields observed: ${requiredFields.size > 0 ? sortedNames([...requiredFields]).join(', ') : '(none in this sample)'}`
  );

  if (locationId) {
    /**
     * The visit reason has to be one this provider actually offers, or availability comes
     * back empty for a reason that has nothing to do with the schedule. Each result lists
     * `provider.visit_reason_ids`, so prefer the specialty default when the provider
     * supports it and otherwise take one it does.
     */
    const provider = (first?.provider ?? {}) as {
      visit_reason_ids?: unknown;
      default_visit_reason_id?: unknown;
    };
    const supported = Array.isArray(provider.visit_reason_ids)
      ? provider.visit_reason_ids.filter((id): id is string => typeof id === 'string')
      : [];
    const specialtyDefault = searched?.defaultVisitReasonId ?? null;
    const visitReasonId =
      specialtyDefault !== null && supported.includes(specialtyDefault)
        ? specialtyDefault
        : (supported[0] ?? provider.default_visit_reason_id ?? specialtyDefault);

    if (typeof visitReasonId === 'string') {
      console.log(`\n=== Availability on ${BASE} (GET only) ===`);

      /**
       * Ask as broadly as the endpoint allows, because a narrow ask returning nothing
       * proves nothing about the timeslot shape:
       *
       * - Every location from the search, not just the first. The endpoint takes up to
       *   50 ids, and one bookable provider anywhere in the batch is enough.
       * - The full window. `end_date_in_provider_local_time` defaults to 7 days out and
       *   accepts up to 31 days after the start.
       * - `published_context=direct_listing`, which the spec says "returns all slots",
       *   versus `condition_driven_search` limiting results to providers with budget.
       */
      const batch = locations
        .map((location) => location.provider_location_id)
        .filter((id): id is string => typeof id === 'string')
        .slice(0, 50);

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // (4) URLSearchParams percent-encodes `|` to %7C automatically, which is the
      // correct behaviour — so this call also demonstrates the encoded form works.
      const availability = await get(token, '/v1/provider_locations/availability', {
        provider_location_ids: batch.join(','),
        visit_reason_id: visitReasonId,
        patient_type: 'new',
        start_date_in_provider_local_time: asDate(startDate),
        end_date_in_provider_local_time: asDate(endDate),
        published_context: 'direct_listing',
      });
      report(
        `/v1/provider_locations/availability (${batch.length} ids, ${asDate(startDate)}..${asDate(endDate)})`,
        availability
      );

      if (availability.status === 200) {
        await record('availability', availability);
        const items = (availability.body as { data?: Record<string, unknown>[] })?.data ?? [];
        const counts = items.map((item) =>
          Array.isArray(item.timeslots) ? item.timeslots.length : -1
        );
        console.log(`  entries  : ${items.length}`);
        console.log(`  timeslots per entry: ${counts.join(', ')}`);

        // (3) The live timeslot shape, from wherever in the batch one turns up.
        const withSlots = items.find(
          (item) => Array.isArray(item.timeslots) && item.timeslots.length > 0
        );
        const slot = (withSlots?.timeslots as Record<string, unknown>[] | undefined)?.[0];
        if (slot) {
          console.log(`  slot keys: ${sortedNames(Object.keys(slot)).join(', ')}`);
          console.log(`  entry keys: ${sortedNames(Object.keys(withSlots!)).join(', ')}`);
        } else {
          console.log('  no timeslots anywhere in the batch — shape still unobserved.');
        }
      }

      // (4) again, the other half: the same id with its `|` left raw. Built by hand,
      // since URLSearchParams would encode it and hide the difference.
      const rawUrl =
        `${BASE}/v1/provider_locations/availability` +
        `?provider_location_ids=${locationId}` +
        `&visit_reason_id=${visitReasonId}&patient_type=new`;
      const rawResponse = await fetch(rawUrl, {
        method: 'GET',
        headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      });
      console.log(
        `\n  unencoded \`|\` in provider_location_ids -> ${rawResponse.status}` +
          ` (encoded %7C -> ${availability.status})`
      );
      console.log(
        rawResponse.status === availability.status
          ? '  => both accepted; encoding is not required by the server, though it is still correct.'
          : '  => they differ; the `|` must be percent-encoded. Worth documenting.'
      );
    } else {
      console.log('\nSKIPPED availability — no default_visit_reason_id on the first result.');
    }
  } else {
    console.log('\nSKIPPED availability — no provider_location_id in the search response.');
  }
}

// ---------------------------------------------------------------------------
// How far does availability reach with these credentials?
//
// The batch above returned zero timeslots for all ten locations across a full 31-day
// window, and every one of them reported `first_availability_date_in_provider_local_time:
// null` in the search itself. Two explanations fit, and they lead to different work:
//
//   a) The query was wrong — wrong visit reason, wrong window, wrong market.
//   b) These credentials see the directory but no bookable availability in it.
//
// (a) is already ruled out for the visit reason: every provider's `visit_reason_ids`
// contains the one that was sent. This sweeps several markets and specialties and counts
// how many results carry a non-null first-availability date. All zero points at (b), which
// means live timeslot fixtures are not obtainable here and Task 12's must come from the
// spec — worth knowing before anyone spends a day trying to record one.

console.log(`\n=== Availability reach across markets (GET only) ===`);

const MARKETS = ['11201', '10003', '60601', '90012'];
let sampled = 0;
let bookable = 0;

for (const zip of MARKETS) {
  for (const candidate of candidates) {
    // Sequential on purpose — a survey, not a hot path, and it keeps the production
    // request rate low.
    // oxlint-disable-next-line no-await-in-loop
    const probe = await get(token, '/v1/provider_locations', {
      zip_code: zip,
      specialty_id: candidate.id,
      visit_type: 'all',
    });
    if (probe.status !== 200) {
      console.log(`  ${zip} / ${candidate.name}: HTTP ${probe.status}`);
      continue;
    }
    const found = itemsOf(probe.body, 'provider_locations');
    const withDate = found.filter(
      (location) => location.first_availability_date_in_provider_local_time !== null
    ).length;
    sampled += found.length;
    bookable += withDate;
    console.log(
      `  ${zip} / ${candidate.name}: ${found.length} locations, ${withDate} with a first-availability date`
    );
  }
}

console.log(
  `\n  ${bookable} of ${sampled} sampled locations report any availability to these credentials.`
);
console.log(
  bookable === 0
    ? '  => Directory reads work; availability does not. Timeslot fixtures must come from the spec.'
    : '  => Some locations are bookable — re-run the availability probe against one of those.'
);

console.log(`\nFixtures written to ${OUT}`);
console.log('Next: read each fixture and confirm it is catalog data only before staging.');
