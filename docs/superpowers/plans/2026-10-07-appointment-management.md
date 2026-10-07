# Appointment Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a patient look up a booked appointment by ID, cancel it, or move it to a new time, through new client functions and one new `<zd-appointment>` component.

**Architecture:**
- **Client.** Three thin wrappers join `createAppointment` in `client/appointments.ts`: `getAppointment`, `cancelAppointment` and `rescheduleAppointment`. They also export the spec's eligible-status sets.
- **Mock.** The mock transport serves all three endpoints statelessly, keyed on the sandbox's documented appointment IDs.
- **Component.** `<zd-appointment appointment-id>` fetches the appointment itself and runs the COMP-001 request-state machine. It has three modes: `view`, `cancel` and `reschedule`. Reschedule embeds the existing `<scoped-availability-picker>` locked to the appointment's location, visit reason and patient type, because the API only moves the time.

**Tech Stack:** TypeScript, Lit and Charm UX (`CharmElement`), Vitest (the `client` node project and the `components` browser project), axe-core, Storybook, Astro Starlight docs.

**Spec:** There's no design doc. This plan argues from:
- The Zocdoc OpenAPI bundle v1.177 (`https://api-docs.zocdoc.com/_bundle/apis/index.yaml`): operations `getAppointment`, `cancelAppointment` and `rescheduleAppointment`, and schemas `AppointmentStatusResponseData`, `CancelAppointmentRequestBody`, `CancellationReasonType`, `RescheduleAppointmentRequestBody`, `AppointmentBaseResponseData` and `AppointmentResponseData`.
- The testing-data guide (`https://api-docs.zocdoc.com/guides/testing-data`), for the appointment IDs per status plus the 404 and 500 IDs.
- `docs/api-contract-notes.md` (around line 354), for the fields GET returns live and the fields observed as `null`.

### Contract summary (copied from the spec)

| Call | Request | Success `data` | Errors | Allowed statuses |
|---|---|---|---|---|
| `GET /v1/appointments/{appointment_id}` | path ID | `AppointmentStatusResponseData`: everything in `AppointmentResponseData` (except `visit_type` becomes optional), plus required `start_time`, `provider_location_id`, `visit_reason_id`, and optional `created_time_utc`, `last_modified_time_utc`, `practice_id`, `visit_type`, `patient_type`, `notes`, `cancellation_reason`, `source` | 400, 401, 403, 404 | any |
| `POST /v1/appointments/cancel` | `{ appointment_id, cancellation_reason_type?, cancellation_reason? }`. `cancellation_reason` only with `other_patient_reason` or `other_provider_reason` | `{ appointment_id, appointment_status, developer_patient_id? }` | 400, 401, 403, 404, **409** | `pending_booking`, `booking_failed`, `confirmed`, `pending_reschedule`, `reschedule_failed`, `rescheduled` |
| `POST /v1/appointments/reschedule` | `{ appointment_id, start_time }`, both required. `start_time` is ISO-8601 with an offset | `AppointmentResponseData` (same shape as create) | 400, 401, 403, 404 | `pending_booking`, `confirmed`, `pending_reschedule`, `rescheduled` |

Scopes: `external.appointment.read` for GET, and `external.appointment.write` for cancel and reschedule. An appointment booked with a user credential can only be read or changed by that user.

## Global Constraints

- **Branch first.** `main` holds uncommitted insurance-fix work. Create `feat/appointment-management` before Task 1, and in each checkpoint stage **only** the files that task lists.
- **Don't run `git commit`.** Burton commits. Each task ends with a staging checkpoint.
- **Standards first.** Before writing code, spawn one sonnet subagent described as "Load engineering standards: Lit web components, TypeScript API client", then apply what it returns.
- **Fetch.** Only `client/http.ts` calls `fetch` (CLIENT-001). The new endpoints go through `request<T>()`.
- **Errors.** Never render `error.message` or `error.body`. User-facing copy goes through `userFacingError` or a fixed string (CLIENT-003).
- **PHI.** `notes` and `cancellation_reason` are free text and count as PHI. They're never rendered, logged or put in an error message (PHI-001). A thrown error never quotes an input value.
- **Test data.** Use only the sandbox IDs from the testing-data guide (PHI-002, TEST-003).
- **Component conventions:**
  - Extend `CharmElement`, declare `static override baseName`, and register through `project.scope.registerComponent` (PBZD-002, PBZD-004).
  - Write `<scoped-*>` tags and list every scoped tag in `dependencies()` (PBZD-003).
  - Emit through `this.emit()` with `{component}-{action}` names (COMP-003).
  - Use CSS nesting and logical properties (STYLE-001, I18N-003).
- **No automatic retry of cancel or reschedule.** Neither is documented as idempotent. Guard against double submits.
- **Generated files.** Never hand-edit `**/custom-elements.json`. Regenerate with `pnpm run cem` from the repo root.
- **Running tests.** Run commands from the repo root, `/Users/burton.smith/Projects/zocdoc-api-components`. Run `pnpm run build:types` once before the first component test run.

## Review Focus

1. **`appointment-id` changes while a lookup is in flight.** The late response for the old ID must not overwrite the new one. *(Task 3: "ignores a lookup that finishes after the id changed")*
2. **Double submit on Cancel.** A second press or call while the first cancel is in flight must not send a second POST. *(Task 3: "sends one cancel when called twice at once")*
3. **Cancel returns `409`** because the appointment was cancelled or marked no-show elsewhere. The patient should see that it can no longer be cancelled, plus its real current status, not "Something went wrong". *(Task 3: "on 409, says so and reloads the real status")*
4. **GET omits `patient_type`.** Reschedule keeps the original patient type, so guessing it would offer times the API may reject. "Change time" must not appear. *(Task 3: "does not offer a new time when the patient type is unknown")*
5. **Blank or whitespace `appointment-id`.** The client must refuse without sending `GET /v1/appointments/`, which hits a different endpoint. The component must stay idle. *(Task 1: "refuses a blank id without a request"; Task 3: "stays idle without an id")*

---

## File Structure

| File | Responsibility |
|---|---|
| `packages/api-components/src/client/types.ts` (modify) | `CancellationReasonType`, `AppointmentBaseResponseData`, `AppointmentDetails` |
| `packages/api-components/src/client/appointments.ts` (modify) | `getAppointment`, `cancelAppointment`, `rescheduleAppointment`, `CANCELLABLE_STATUSES`, `RESCHEDULABLE_STATUSES` |
| `packages/api-components/src/client/__tests__/appointment-management.test.ts` (create) | Wire-level tests for the three wrappers |
| `packages/api-components/src/client/mock/fixtures.ts` (modify) | Appointment `SCENARIOS` keys, `APPOINTMENTS`, `buildAppointment` |
| `packages/api-components/src/client/mock/transport.ts` (modify) | Routes and handlers for GET, cancel and reschedule |
| `packages/api-components/src/client/__tests__/mock-transport.test.ts` (modify) | Drives the new routes through the real wrappers |
| `packages/api-components/src/components/appointment/appointment.ts` (create) | `<zd-appointment>` |
| `packages/api-components/src/components/appointment/appointment.styles.ts` (create) | Its styles |
| `packages/api-components/src/components/appointment/index.ts` (create) | Registration |
| `packages/api-components/src/components/appointment/appointment.test.ts` (create) | Browser tests, including axe |
| `packages/api-components/src/components/appointment/appointment.stories.ts` (create) | Stories against the mock |
| `packages/api-components/src/index.ts` (modify) | Barrel export |
| `packages/api-components/src/components/booking/booking.ts` (modify, comment only) | Point the "no Back on confirmation" note at `<zd-appointment>` |
| `packages/docs/src/content/docs/components/appointment.mdx` (create) | Component page |
| `packages/docs/src/content/docs/client/endpoints.mdx`, `client/errors.mdx`, `guides/testing.mdx`, `guides/zocdoc-api.mdx` (modify) | Docs |

**Decision: one component, not separate cancel and reschedule components.** Both actions need the GET lookup first, for the status that decides what's allowed and the location, visit reason and patient type that reschedule needs. Two components would each repeat the fetch and the status gating, or would need a parent to share it, which COMP-002 and COMP-004 rule out. One standalone component that owns its own lookup is the smaller surface. `<zd-booking-confirmation>` stays unchanged: its `OUTCOMES` map is deliberately limited to booking results, and `<zd-appointment>` words its own outcomes.

---

### Task 1: Client endpoints

**Files:**
- Modify: `packages/api-components/src/client/types.ts` (add after `AppointmentResponseData`, around line 377)
- Modify: `packages/api-components/src/client/appointments.ts`
- Create: `packages/api-components/src/client/__tests__/appointment-management.test.ts`

**Interfaces:**
- Consumes: `request<T>(path, { method?, body? })` from `client/http.ts`; `ZocdocResponse<T>`, `AppointmentStatus`, `AppointmentResponseData`, `AppointmentVisitType`, `PatientType` from `client/types.ts`.
- Produces:
  - `type CancellationReasonType`
  - `interface AppointmentBaseResponseData { appointment_id: string; appointment_status: AppointmentStatus; developer_patient_id?: string | null }`
  - `interface AppointmentDetails` (fields below)
  - `CANCELLABLE_STATUSES: ReadonlySet<AppointmentStatus>`
  - `RESCHEDULABLE_STATUSES: ReadonlySet<AppointmentStatus>`
  - `getAppointment(appointmentId: string): Promise<AppointmentDetails>`
  - `cancelAppointment(input: CancelAppointmentInput): Promise<AppointmentBaseResponseData>`, where `CancelAppointmentInput = { appointmentId: string; reasonType?: CancellationReasonType; reason?: string }`
  - `rescheduleAppointment(input: RescheduleAppointmentInput): Promise<AppointmentResponseData>`, where `RescheduleAppointmentInput = { appointmentId: string; startTime: string }`

- [ ] **Step 1: Write the failing tests**

Create `packages/api-components/src/client/__tests__/appointment-management.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CANCELLABLE_STATUSES,
  RESCHEDULABLE_STATUSES,
  cancelAppointment,
  getAppointment,
  rescheduleAppointment,
} from '../appointments.js';
import { configureZocdoc, resetZocdocConfig } from '../configure.js';
import { ZocdocError, ZocdocNotFoundError } from '../errors.js';

/** The sandbox's confirmed appointment (TEST-003). */
const ID = 'd2ee5bd8-643a-42c8-8c5a-be450e903430';

function respond(body: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status,
          headers: { 'content-type': 'application/json' },
        })
    )
  );
}

function sent(): { url: string; method: string; body: unknown } {
  const [url, init] = vi.mocked(fetch).mock.calls[0] ?? [];
  return {
    url: String(url),
    method: init?.method ?? 'GET',
    body: init?.body === undefined ? undefined : JSON.parse(String(init.body)),
  };
}

const DETAILS = {
  appointment_id: ID,
  appointment_status: 'confirmed',
  is_provider_resource: false,
  confirmation_type: 'auto',
  start_time: '2026-08-05T09:00:00-04:00',
  provider_location_id: 'pr_confirmed|lo_confirmed',
  visit_reason_id: 'pc_TlZW-r06U0W3pCsIGtSI5B',
  patient_type: 'new',
  notes: null,
};

beforeEach(() => {
  configureZocdoc({ baseUrl: 'https://example.test', getToken: 'tok' });
});

afterEach(() => {
  resetZocdocConfig();
  vi.unstubAllGlobals();
});

describe('getAppointment', () => {
  it('GETs the appointment by id and unwraps data', async () => {
    respond({ request_id: 'req_test', data: DETAILS });

    const appointment = await getAppointment(ID);

    expect(sent()).toMatchObject({ url: `https://example.test/v1/appointments/${ID}`, method: 'GET' });
    expect(appointment).toEqual(DETAILS);
  });

  it('encodes the id into the path', async () => {
    respond({ request_id: 'req_test', data: DETAILS });

    await getAppointment('a/b');

    expect(sent().url).toBe('https://example.test/v1/appointments/a%2Fb');
  });

  it('refuses a blank id without a request', async () => {
    respond({});

    await expect(getAppointment('   ')).rejects.toThrow('appointmentId is required.');
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('throws ZocdocNotFoundError on 404', async () => {
    respond({ request_id: 'req_test', error_type: 'invalid_request', errors: [] }, 404);

    await expect(getAppointment(ID)).rejects.toBeInstanceOf(ZocdocNotFoundError);
  });
});

describe('cancelAppointment', () => {
  beforeEach(() => {
    respond({ request_id: 'req_test', data: { appointment_id: ID, appointment_status: 'cancelled' } });
  });

  it('POSTs only the id when no reason is given', async () => {
    const result = await cancelAppointment({ appointmentId: ID });

    expect(sent()).toEqual({
      url: 'https://example.test/v1/appointments/cancel',
      method: 'POST',
      body: { appointment_id: ID },
    });
    expect(result).toEqual({ appointment_id: ID, appointment_status: 'cancelled' });
  });

  it('sends the reason type', async () => {
    await cancelAppointment({ appointmentId: ID, reasonType: 'patient_no_longer_available' });

    expect(sent().body).toEqual({
      appointment_id: ID,
      cancellation_reason_type: 'patient_no_longer_available',
    });
  });

  it('sends free text with an other_* reason type', async () => {
    await cancelAppointment({
      appointmentId: ID,
      reasonType: 'other_patient_reason',
      reason: 'Test reason',
    });

    expect(sent().body).toEqual({
      appointment_id: ID,
      cancellation_reason_type: 'other_patient_reason',
      cancellation_reason: 'Test reason',
    });
  });

  it('refuses free text without an other_* reason type, without quoting it', async () => {
    const attempt = cancelAppointment({
      appointmentId: ID,
      reasonType: 'patient_no_longer_available',
      reason: 'Test reason',
    });

    await expect(attempt).rejects.toThrow(/other_patient_reason/);
    await expect(attempt).rejects.not.toThrow(/Test reason/);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('surfaces a 409 as a ZocdocError with that status', async () => {
    respond({ request_id: 'req_test', error_type: 'invalid_request', errors: [] }, 409);

    const error = await cancelAppointment({ appointmentId: ID }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ZocdocError);
    expect((error as ZocdocError).status).toBe(409);
  });
});

describe('rescheduleAppointment', () => {
  it('POSTs the id and the start time verbatim', async () => {
    respond({
      request_id: 'req_test',
      data: {
        appointment_id: ID,
        appointment_status: 'rescheduled',
        is_provider_resource: false,
        confirmation_type: 'auto',
        visit_type: 'in_person',
      },
    });

    const result = await rescheduleAppointment({
      appointmentId: ID,
      startTime: '2026-08-06T14:00:00-04:00',
    });

    expect(sent()).toEqual({
      url: 'https://example.test/v1/appointments/reschedule',
      method: 'POST',
      body: { appointment_id: ID, start_time: '2026-08-06T14:00:00-04:00' },
    });
    expect(result.appointment_status).toBe('rescheduled');
  });

  it('refuses a blank start time without a request', async () => {
    respond({});

    await expect(rescheduleAppointment({ appointmentId: ID, startTime: '' })).rejects.toThrow(
      'startTime is required.'
    );
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});

describe('eligible statuses', () => {
  it('match the spec for cancel', () => {
    expect([...CANCELLABLE_STATUSES].sort()).toEqual(
      [
        'booking_failed',
        'confirmed',
        'pending_booking',
        'pending_reschedule',
        'reschedule_failed',
        'rescheduled',
      ].sort()
    );
  });

  it('match the spec for reschedule', () => {
    expect([...RESCHEDULABLE_STATUSES].sort()).toEqual(
      ['confirmed', 'pending_booking', 'pending_reschedule', 'rescheduled'].sort()
    );
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm exec vitest run --project client packages/api-components/src/client/__tests__/appointment-management.test.ts`
Expected: FAIL. The imports `getAppointment`, `cancelAppointment`, `rescheduleAppointment`, `CANCELLABLE_STATUSES` and `RESCHEDULABLE_STATUSES` don't exist yet.

- [ ] **Step 3: Add the types**

In `packages/api-components/src/client/types.ts`, directly after the closing `}` of `AppointmentResponseData`:

```ts
/**
 * Why an appointment was cancelled. Optional on the request but recommended. Free text in
 * `cancellation_reason` is only accepted with one of the two `other_*` values.
 */
export type CancellationReasonType =
  | 'patient_no_longer_needs_appointment'
  | 'patient_no_longer_available'
  | 'other_patient_reason'
  | 'missing_needed_patient_information'
  | 'payment_or_insurance_issue'
  | 'patient_or_visit_type_not_accepted'
  | 'provider_not_available'
  | 'rescheduling_patient'
  | 'other_provider_reason';

/** The `data` of `POST /v1/appointments/cancel`: the spec's `AppointmentBaseResponseData`. */
export interface AppointmentBaseResponseData {
  appointment_id: string;
  appointment_status: AppointmentStatus;
  developer_patient_id?: string | null;
}

/**
 * The `data` of `GET /v1/appointments/{appointment_id}` (`AppointmentStatusResponseData`).
 *
 * The create response's fields, except `visit_type`, which the lookup makes optional, plus
 * what a lookup adds. `provider_location_id`, `visit_reason_id` and `patient_type` are what a
 * reschedule has to search availability with, because the API only moves the time.
 *
 * `notes` and `cancellation_reason` are free text and treated as PHI (PHI-001). Both, and
 * `source`, were observed as `null` live; see `docs/api-contract-notes.md`.
 */
export interface AppointmentDetails extends Omit<AppointmentResponseData, 'visit_type'> {
  start_time: string;
  provider_location_id: string;
  visit_reason_id: string;
  visit_type?: AppointmentVisitType;
  patient_type?: PatientType;
  created_time_utc?: string;
  last_modified_time_utc?: string;
  practice_id?: string;
  cancellation_reason?: string | null;
  source?: string | null;
}
```

- [ ] **Step 4: Add the endpoints**

In `packages/api-components/src/client/appointments.ts`, replace the type import on line 2 with:

```ts
import type {
  AppointmentBaseResponseData,
  AppointmentDetails,
  AppointmentResponseData,
  AppointmentStatus,
  CancellationReasonType,
  Patient,
  PatientType,
  ZocdocResponse,
} from './types.js';
```

Append to the end of the file:

```ts
/** The statuses `POST /v1/appointments/cancel` accepts. Anything else is a 409. */
export const CANCELLABLE_STATUSES: ReadonlySet<AppointmentStatus> = new Set<AppointmentStatus>([
  'pending_booking',
  'booking_failed',
  'confirmed',
  'pending_reschedule',
  'reschedule_failed',
  'rescheduled',
]);

/** The statuses `POST /v1/appointments/reschedule` accepts. */
export const RESCHEDULABLE_STATUSES: ReadonlySet<AppointmentStatus> = new Set<AppointmentStatus>([
  'pending_booking',
  'confirmed',
  'pending_reschedule',
  'rescheduled',
]);

/** The two reason types the API accepts free text with. */
const FREE_TEXT_REASONS: ReadonlySet<CancellationReasonType> = new Set<CancellationReasonType>([
  'other_patient_reason',
  'other_provider_reason',
]);

/**
 * Refused locally rather than sent: a blank id would turn `GET /v1/appointments/{id}` into
 * `GET /v1/appointments/`, which is a different endpoint with a different response.
 */
function required(value: string, name: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${name} is required.`);
  return trimmed;
}

/** Looks up one appointment, including the fields a reschedule needs. */
export async function getAppointment(appointmentId: string): Promise<AppointmentDetails> {
  const id = required(appointmentId, 'appointmentId');
  const response = await request<ZocdocResponse<AppointmentDetails>>(
    `/v1/appointments/${encodeURIComponent(id)}`
  );
  return response.data;
}

export interface CancelAppointmentInput {
  appointmentId: string;
  reasonType?: CancellationReasonType;
  /** Free text, only with `other_patient_reason` or `other_provider_reason`. Treated as PHI. */
  reason?: string;
}

/**
 * Cancels an appointment. A 409 means its status no longer allows it, usually because it
 * was already cancelled or marked a no-show. Don't retry automatically: the API doesn't
 * document the call as idempotent.
 */
export async function cancelAppointment(
  input: CancelAppointmentInput
): Promise<AppointmentBaseResponseData> {
  const id = required(input.appointmentId, 'appointmentId');

  if (
    input.reason !== undefined &&
    (input.reasonType === undefined || !FREE_TEXT_REASONS.has(input.reasonType))
  ) {
    // Names the rule, never the text, which can be PHI.
    throw new Error(
      'reason is only accepted with reasonType other_patient_reason or other_provider_reason.'
    );
  }

  const response = await request<ZocdocResponse<AppointmentBaseResponseData>>(
    '/v1/appointments/cancel',
    {
      method: 'POST',
      body: {
        appointment_id: id,
        ...(input.reasonType === undefined ? {} : { cancellation_reason_type: input.reasonType }),
        ...(input.reason === undefined ? {} : { cancellation_reason: input.reason }),
      },
    }
  );
  return response.data;
}

export interface RescheduleAppointmentInput {
  appointmentId: string;
  /**
   * A `start_time` from `getAvailability` for the appointment's own provider location,
   * visit reason and patient type, unchanged and offset included.
   */
  startTime: string;
}

/**
 * Moves an appointment to a new time at the same location, for the same visit reason and
 * patient type. Like booking, a resolved promise isn't proof: check `appointment_status`.
 */
export async function rescheduleAppointment(
  input: RescheduleAppointmentInput
): Promise<AppointmentResponseData> {
  const id = required(input.appointmentId, 'appointmentId');
  const startTime = required(input.startTime, 'startTime');

  const response = await request<ZocdocResponse<AppointmentResponseData>>(
    '/v1/appointments/reschedule',
    { method: 'POST', body: { appointment_id: id, start_time: startTime } }
  );
  return response.data;
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `pnpm exec vitest run --project client packages/api-components/src/client/__tests__/appointment-management.test.ts packages/api-components/src/client/__tests__/appointments.test.ts`
Expected: PASS. The existing `createAppointment` tests still pass.

- [ ] **Step 6: Checkpoint (stage only)**

```bash
git add packages/api-components/src/client/types.ts packages/api-components/src/client/appointments.ts packages/api-components/src/client/__tests__/appointment-management.test.ts
```

---

### Task 2: Mock transport routes

**Files:**
- Modify: `packages/api-components/src/client/mock/fixtures.ts` (`SCENARIOS`, around line 28; new exports after `DEFAULT_BOOKING`, around line 431)
- Modify: `packages/api-components/src/client/mock/transport.ts` (imports; new handlers after `handleCreateAppointment`; routing in `createMockTransport`)
- Modify: `packages/api-components/src/client/__tests__/mock-transport.test.ts`

**Interfaces:**
- Consumes: everything Task 1 produced.
- Produces:
  - New `SCENARIOS` keys: `appointmentPending`, `appointmentConfirmed`, `appointmentConfirmedExisting`, `appointmentBookingFailed`, `appointmentCancelled`, `appointmentNoShow`, `appointmentPendingReschedule`, `appointmentRescheduled`, `appointmentRescheduleFailed`, `appointmentNotFound`, `appointmentError`.
  - `APPOINTMENTS: Record<string, MockAppointment>`.
  - `buildAppointment(id: string, today: string): AppointmentDetails | undefined`.
  - Mock behavior: GET returns the fixture. Cancel returns `cancelled`, or 409 if the status isn't cancellable. Reschedule returns `rescheduled`, or 400 if the status isn't reschedulable. The not-found ID gives 404 and the error ID gives 500 on all three. Any other ID gives 404.

**Decision: stateless.** The guide doesn't say whether sandbox state persists between calls, and the mock stores nothing elsewhere. Cancelling the confirmed appointment twice succeeds twice. Tests for 409 use the cancelled or no-show IDs.

- [ ] **Step 1: Write the failing tests**

In `packages/api-components/src/client/__tests__/mock-transport.test.ts`:

1. Extend the imports:

```ts
import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  rescheduleAppointment,
} from '../appointments.js';
import { ZocdocError, ZocdocNotFoundError } from '../errors.js';
import {
  APPOINTMENTS,
  BOOKINGS,
  PROVIDER_LOCATIONS,
  SCENARIOS,
  SPECIALTIES,
} from '../mock/fixtures.js';
```

   Merge these with the existing import lines rather than duplicating them. If `ZocdocError` is already imported, keep one import.

2. Add this block inside `describe('createMockTransport', ...)`, after the `availability` describe. The existing `beforeEach` already configures the mock transport.

```ts
  describe('appointment management', () => {
    async function statusOf(error: Promise<unknown>): Promise<number | undefined> {
      const caught = await error.catch((e: unknown) => e);
      return caught instanceof ZocdocError ? caught.status : undefined;
    }

    it('looks up every documented appointment with its own location and visit reason', async () => {
      for (const [id, fixture] of Object.entries(APPOINTMENTS)) {
        const appointment = await getAppointment(id);

        expect(appointment).toMatchObject({
          appointment_id: id,
          appointment_status: fixture.status,
          provider_location_id: fixture.providerLocationId,
          visit_reason_id: fixture.visitReasonId,
          patient_type: fixture.patientType,
        });
        // Offset kept, as the API sends it.
        expect(appointment.start_time).toMatch(/T09:00:00-04:00$/);
      }
    });

    it('returns 404 for the documented not-found id and for unknown ids', async () => {
      await expect(getAppointment(SCENARIOS.appointmentNotFound)).rejects.toBeInstanceOf(
        ZocdocNotFoundError
      );
      await expect(getAppointment('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
        ZocdocNotFoundError
      );
    });

    it('returns 500 for the documented error id on all three endpoints', async () => {
      const id = SCENARIOS.appointmentError;

      expect(await statusOf(getAppointment(id))).toBe(500);
      expect(await statusOf(cancelAppointment({ appointmentId: id }))).toBe(500);
      expect(
        await statusOf(rescheduleAppointment({ appointmentId: id, startTime: '2026-08-06T14:00:00-04:00' }))
      ).toBe(500);
    });

    it('cancels a confirmed appointment', async () => {
      const result = await cancelAppointment({
        appointmentId: SCENARIOS.appointmentConfirmed,
        reasonType: 'patient_no_longer_available',
      });

      expect(result).toEqual({
        appointment_id: SCENARIOS.appointmentConfirmed,
        appointment_status: 'cancelled',
      });
    });

    it('returns 409 for an appointment that is already cancelled or a no-show', async () => {
      expect(await statusOf(cancelAppointment({ appointmentId: SCENARIOS.appointmentCancelled }))).toBe(409);
      expect(await statusOf(cancelAppointment({ appointmentId: SCENARIOS.appointmentNoShow }))).toBe(409);
    });

    it('reschedules a confirmed appointment', async () => {
      const result = await rescheduleAppointment({
        appointmentId: SCENARIOS.appointmentConfirmed,
        startTime: '2026-08-06T14:00:00-04:00',
      });

      expect(result).toMatchObject({
        appointment_id: SCENARIOS.appointmentConfirmed,
        appointment_status: 'rescheduled',
      });
    });

    it('rejects rescheduling a status the spec does not allow', async () => {
      const startTime = '2026-08-06T14:00:00-04:00';

      expect(
        await statusOf(rescheduleAppointment({ appointmentId: SCENARIOS.appointmentBookingFailed, startTime }))
      ).toBe(400);
      expect(
        await statusOf(rescheduleAppointment({ appointmentId: SCENARIOS.appointmentCancelled, startTime }))
      ).toBe(400);
    });

    it('uses the same appointment ids as booking', () => {
      // A demo that books then manages must land on the same fixture.
      for (const { appointmentId, status } of Object.values(BOOKINGS)) {
        expect(APPOINTMENTS[appointmentId]?.status).toBe(status);
      }
    });
  });
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm exec vitest run --project client packages/api-components/src/client/__tests__/mock-transport.test.ts`
Expected: FAIL. `APPOINTMENTS` isn't exported, and the new `SCENARIOS` keys are undefined.

- [ ] **Step 3: Add the fixtures**

In `packages/api-components/src/client/mock/fixtures.ts`:

1. Inside `SCENARIOS`, before `insurancePlanMissing`, add:

```ts
  /**
   * `GET /v1/appointments/{id}` returns each documented status for these ids. They are the
   * ids `BOOKINGS` hands back, so a flow that books and then manages lands on one fixture.
   */
  appointmentPending: '2b29f79b-6d7f-472a-9603-d0c378bc9531',
  appointmentConfirmed: 'd2ee5bd8-643a-42c8-8c5a-be450e903430',
  /** Confirmed, for an existing patient. */
  appointmentConfirmedExisting: '423e6a11-8dac-4873-b933-d8d02f9a370f',
  appointmentBookingFailed: '34e4ead3-ca69-4448-9438-58702dd1048f',
  appointmentCancelled: '21990114-ea71-4d7d-9d1e-00c43ae44bcd',
  appointmentNoShow: 'a0a7770d-e667-416c-9f06-9c3b40a7bb84',
  appointmentPendingReschedule: '63f995c2-49c4-40c8-a93a-140fb32e913b',
  appointmentRescheduled: '8507d05f-cbe5-4732-b72a-22add9c80120',
  appointmentRescheduleFailed: '84d04f67-b2cf-4afd-ab64-193072498ed5',
  /** Returns a 404 on get, cancel and reschedule. */
  appointmentNotFound: '83f5cf14-3eb1-4034-be1f-e7c3058aad21',
  /** Returns a 500 on get, cancel and reschedule. */
  appointmentError: 'dc69a428-8a73-461b-bd7b-df755910a3fb',
```

2. Add `AppointmentDetails` and `PatientType` to the file's existing `import type { ... } from '../types.js'`.

3. After `DEFAULT_BOOKING`, add:

```ts
export interface MockAppointment {
  status: AppointmentStatus;
  providerLocationId: string;
  visitReasonId: string;
  patientType: PatientType;
}

/**
 * The sandbox's documented appointments, keyed by appointment id. Location and visit reason
 * are the guide's own. The guide gives a patient type only for the two confirmed entries,
 * so the rest use `new`.
 */
export const APPOINTMENTS: Record<string, MockAppointment> = {
  [SCENARIOS.appointmentPending]: {
    status: 'pending_booking',
    providerLocationId: SCENARIOS.providerLocationPending,
    visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
    patientType: 'new',
  },
  [SCENARIOS.appointmentConfirmed]: {
    status: 'confirmed',
    providerLocationId: SCENARIOS.providerLocationConfirmed,
    visitReasonId: 'pc_TlZW-r06U0W3pCsIGtSI5B',
    patientType: 'new',
  },
  [SCENARIOS.appointmentConfirmedExisting]: {
    status: 'confirmed',
    providerLocationId: SCENARIOS.providerLocationConfirmed,
    visitReasonId: 'pc_TlZW-r06U0W3pCsIGtSI5B',
    patientType: 'existing',
  },
  [SCENARIOS.appointmentBookingFailed]: {
    status: 'booking_failed',
    providerLocationId: SCENARIOS.providerLocationBookingFailed,
    visitReasonId: 'pc_zZWhkaURvEGlZpSimNILaB',
    patientType: 'new',
  },
  [SCENARIOS.appointmentCancelled]: {
    status: 'cancelled',
    providerLocationId: SCENARIOS.providerLocationCancelled,
    visitReasonId: 'pc_p1KdCTTzuU6A04ZjEt837x',
    patientType: 'new',
  },
  [SCENARIOS.appointmentNoShow]: {
    status: 'no_show',
    providerLocationId: SCENARIOS.providerLocationNoShow,
    visitReasonId: 'pc_T1T3MOA0kUuE201i1ZfIWR',
    patientType: 'new',
  },
  [SCENARIOS.appointmentPendingReschedule]: {
    status: 'pending_reschedule',
    providerLocationId: SCENARIOS.providerLocationPendingReschedule,
    visitReasonId: 'pc_FRO-18leckytNKtruw5dLR',
    patientType: 'new',
  },
  [SCENARIOS.appointmentRescheduled]: {
    status: 'rescheduled',
    providerLocationId: SCENARIOS.providerLocationRescheduled,
    visitReasonId: 'pc_peZqujk5w0jL8SblyLoIoz',
    patientType: 'new',
  },
  [SCENARIOS.appointmentRescheduleFailed]: {
    status: 'reschedule_failed',
    providerLocationId: SCENARIOS.providerLocationRescheduleFailed,
    visitReasonId: 'pc_PS_BTW9rmkuIfaIH_Hxdwg',
    patientType: 'new',
  },
};

/**
 * One lookup response. The time is a week after `today`, so it never drifts into the past.
 * The free-text fields are `null` because that's what production sends.
 */
export function buildAppointment(id: string, today: string): AppointmentDetails | undefined {
  const fixture = APPOINTMENTS[id];
  if (!fixture) return undefined;

  return {
    appointment_id: id,
    appointment_status: fixture.status,
    is_provider_resource: false,
    confirmation_type: fixture.status.startsWith('pending') ? 'manual' : 'auto',
    visit_type: 'in_person',
    start_time: `${addDays(today, 7)}T09:00:00-04:00`,
    provider_location_id: fixture.providerLocationId,
    visit_reason_id: fixture.visitReasonId,
    patient_type: fixture.patientType,
    notes: null,
    cancellation_reason: null,
    source: null,
  };
}
```

`addDays` is a function declaration further up the file, so calling it here is fine.

- [ ] **Step 4: Add the handlers and routes**

In `packages/api-components/src/client/mock/transport.ts`:

1. Add the imports:

```ts
import { CANCELLABLE_STATUSES, RESCHEDULABLE_STATUSES } from '../appointments.js';
```

   Then add `APPOINTMENTS` and `buildAppointment` to the existing `./fixtures.js` import.

2. After `handleCreateAppointment`, add:

```ts
/** The two documented error ids, then any id the fixtures don't know, which is a 404. */
function appointmentSentinel(id: string): Response | undefined {
  if (id === SCENARIOS.appointmentError) {
    return json(errorBody('Simulated server error.', 'api_error'), 500);
  }
  if (!APPOINTMENTS[id]) {
    return json(errorBody('Appointment not found.', 'invalid_request'), 404);
  }
  return undefined;
}

/** Serves `GET /v1/appointments/{appointment_id}`. */
function handleGetAppointment(id: string): Response {
  return (
    appointmentSentinel(id) ??
    json({ request_id: 'req_mock', data: buildAppointment(id, todayIso()) })
  );
}

/**
 * Serves `POST /v1/appointments/cancel`. Stateless: the fixture's status decides, so the
 * same appointment can be cancelled twice. The free-text reason is checked and dropped,
 * never echoed (PHI-001).
 */
function handleCancelAppointment(rawBody: unknown): Response {
  const body = rawBody as
    | { appointment_id?: string; cancellation_reason_type?: string; cancellation_reason?: string }
    | undefined;
  const id = body?.appointment_id ?? '';

  if (!id) return json(errorBody('appointment_id is required.', 'invalid_request'), 400);
  if (
    body?.cancellation_reason !== undefined &&
    body.cancellation_reason_type !== 'other_patient_reason' &&
    body.cancellation_reason_type !== 'other_provider_reason'
  ) {
    return json(
      errorBody('cancellation_reason requires an other_* reason type.', 'invalid_request'),
      400
    );
  }

  const sentinel = appointmentSentinel(id);
  if (sentinel) return sentinel;

  if (!CANCELLABLE_STATUSES.has(APPOINTMENTS[id]!.status)) {
    return json(
      errorBody('Appointment cannot be cancelled in its current status.', 'invalid_request'),
      409
    );
  }

  return json({
    request_id: 'req_mock',
    data: { appointment_id: id, appointment_status: 'cancelled' },
  });
}

/**
 * Serves `POST /v1/appointments/reschedule`. It doesn't check that `start_time` was an
 * offered slot, which the real API does.
 */
function handleRescheduleAppointment(rawBody: unknown): Response {
  const body = rawBody as { appointment_id?: string; start_time?: string } | undefined;
  const id = body?.appointment_id ?? '';

  if (!id || !body?.start_time) {
    return json(errorBody('appointment_id and start_time are required.', 'invalid_request'), 400);
  }

  const sentinel = appointmentSentinel(id);
  if (sentinel) return sentinel;

  if (!RESCHEDULABLE_STATUSES.has(APPOINTMENTS[id]!.status)) {
    return json(
      errorBody('Appointment cannot be rescheduled in its current status.', 'invalid_request'),
      400
    );
  }

  return json({
    request_id: 'req_mock',
    data: {
      appointment_id: id,
      appointment_status: 'rescheduled',
      is_provider_resource: false,
      confirmation_type: 'auto',
      visit_type: 'in_person',
    },
  });
}

/** `request` always stringifies, so a non-string body means a caller bypassed it. */
function jsonBody(init: RequestInit): unknown {
  return typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
}

const APPOINTMENT_PATH = /^\/v1\/appointments\/([^/]+)$/;
```

3. In `createMockTransport`, replace the existing `/v1/appointments` POST block with:

```ts
    if (path === '/v1/appointments/cancel' && init.method === 'POST') {
      return handleCancelAppointment(jsonBody(init));
    }

    if (path === '/v1/appointments/reschedule' && init.method === 'POST') {
      return handleRescheduleAppointment(jsonBody(init));
    }

    if (path === '/v1/appointments' && init.method === 'POST') {
      return handleCreateAppointment(jsonBody(init));
    }

    const appointmentPath = APPOINTMENT_PATH.exec(path);
    if (appointmentPath && (init.method ?? 'GET') === 'GET') {
      return handleGetAppointment(decodeURIComponent(appointmentPath[1]!));
    }
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `pnpm exec vitest run --project client packages/api-components/src/client/__tests__/mock-transport.test.ts`
Expected: PASS, including the existing booking and availability cases.

- [ ] **Step 6: Run the whole client project**

Run: `pnpm test:client`
Expected: PASS.

- [ ] **Step 7: Checkpoint (stage only)**

```bash
git add packages/api-components/src/client/mock/fixtures.ts packages/api-components/src/client/mock/transport.ts packages/api-components/src/client/__tests__/mock-transport.test.ts
```

---

### Task 3: `<zd-appointment>`

**Files:**
- Create: `packages/api-components/src/components/appointment/appointment.ts`
- Create: `packages/api-components/src/components/appointment/appointment.styles.ts`
- Create: `packages/api-components/src/components/appointment/index.ts`
- Create: `packages/api-components/src/components/appointment/appointment.test.ts`

**Interfaces:**
- Consumes:
  - From Task 1: `getAppointment`, `cancelAppointment`, `rescheduleAppointment`, `CANCELLABLE_STATUSES`, `RESCHEDULABLE_STATUSES`, `AppointmentDetails`, `CancellationReasonType`.
  - From Task 2: the `SCENARIOS.appointment*` IDs, in tests.
  - Existing: `renderRequestState`, `requestStateDependencies`, `RequestState` (`utilities/request-state.ts`); `userFacingError` (`utilities/error-message.ts`); `formatAppointmentTime` (`utilities/provider-time.ts`); `ZdAvailabilityPicker` and `SlotSelectDetail` (`components/availability-picker/availability-picker.ts`); `ErrorDetail`, `TypedEmit`, `TypedEventTarget` (`components/events.ts`); `ZocdocError`, `ZocdocNotFoundError` (`client/errors.ts`).
- Produces:
  - `class ZdAppointment`, with tag `zd-appointment` and `baseName` `'appointment'`.
  - Properties: `appointmentId?: string` (attribute `appointment-id`) and `providerName?: string` (attribute `provider-name`).
  - Methods: `load(): Promise<void>`, `cancel(reasonType?: CancellationReasonType): Promise<void>`, `reschedule(startTime: string): Promise<void>`.
  - Events:
    - `appointment-cancel`: `AppointmentCancelDetail { appointmentId: string; status: AppointmentStatus }`
    - `appointment-reschedule`: `AppointmentRescheduleDetail { appointmentId: string; status: AppointmentStatus; startTime: string }`
    - `appointment-error`: `AppointmentErrorDetail extends ErrorDetail { action: 'load' | 'cancel' | 'reschedule'; status?: AppointmentStatus }`
  - Event map type: `ZdAppointmentEventMap`.
  - CSS parts:
    - From `renderRequestState` (unchanged): `status`, `loading`, `loading-message`, `empty`, `error`, `retry`.
    - Panel: `panel`, `heading`, `details`, `appointment-status`, `provider`, `when`, `reference`, `notice`, `action-error`, `actions`, `reschedule`, `cancel`.
    - Cancel mode: `cancel-form`, `reason`, `confirm-cancel`, `keep`.
    - Reschedule mode: `picker`, `confirm-reschedule`, `back`.

  The status line uses the part `appointment-status`, not `status`, because `renderRequestState` already owns `status`.

**Behavior rules (also in code comments):**
- **Actions offered.**
  - "Change time" requires a status in `RESCHEDULABLE_STATUSES` **and** a known `patient_type`.
  - "Cancel appointment" requires a status in `CANCELLABLE_STATUSES`, except `booking_failed`. The spec allows cancelling a booking that never happened, but offering it to a patient reads as if they have an appointment.
- **Outcome checks.**
  - A 200 from cancel with any status other than `cancelled` is a failure.
  - A 200 from reschedule must be `rescheduled`, `pending_reschedule` or `confirmed`. Anything else is a failure, like booking's `booking_failed`.
- **Focus.** Focus moves to `[part="panel"]` on every mode change, but not on first paint (A11Y-003).
- **Announcements.** The outcome notice is a `role="status"` element that stays mounted for the panel's lifetime, so its text change is announced (A11Y-002). Action errors use a danger, assertive `scoped-alert` that mounts on error.

- [ ] **Step 1: Write the failing tests**

Create `packages/api-components/src/components/appointment/appointment.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import { ZocdocError, ZocdocNotFoundError } from '../../client/errors.js';
import { buildTimeslots, SCENARIOS } from '../../client/mock/fixtures.js';
import type { AppointmentDetails, AppointmentResponseData } from '../../client/types.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, queryPart, settled, shadow } from '../../utils/test/mount.js';
import './index.js';

/** `{ spy: true }` so `vi.spyOn` can redefine the exports in browser mode (TEST-002). */
vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });

const ID = SCENARIOS.appointmentConfirmed;
/** 9 AM at a practice on `-04:00`. The runner is UTC, so the offset is what's under test. */
const START_TIME = '2026-08-05T09:00:00-04:00';
const NEW_TIME = '2026-08-06T14:00:00-04:00';
/** A provider name from the fixture directory, not a patient's (PHI-002). */
const PROVIDER = 'Dr. Avery Sandoval, MD';

type Manage = HTMLElement & {
  appointmentId?: string;
  cancel(reasonType?: string): Promise<void>;
  reschedule(startTime: string): Promise<void>;
};

type Picker = HTMLElement & {
  providerLocationId?: string;
  visitReasonId?: string;
  patientType: string;
  hidePatientType: boolean;
};

function details(overrides: Partial<AppointmentDetails> = {}): AppointmentDetails {
  return {
    appointment_id: ID,
    appointment_status: 'confirmed',
    is_provider_resource: false,
    confirmation_type: 'auto',
    visit_type: 'in_person',
    start_time: START_TIME,
    provider_location_id: SCENARIOS.providerLocationConfirmed,
    visit_reason_id: 'pc_TlZW-r06U0W3pCsIGtSI5B',
    patient_type: 'new',
    ...overrides,
  };
}

function rescheduled(status: AppointmentResponseData['appointment_status']): AppointmentResponseData {
  return {
    appointment_id: ID,
    appointment_status: status,
    is_provider_resource: false,
    confirmation_type: 'auto',
    visit_type: 'in_person',
  };
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function record(element: HTMLElement, name: string): CustomEvent[] {
  const seen: CustomEvent[] = [];
  element.addEventListener(name, (event) => seen.push(event as CustomEvent));
  return seen;
}

function text(element: HTMLElement, name: string): string {
  return part(element, name).textContent?.trim() ?? '';
}

async function mountLoaded(appointment = details()): Promise<Manage> {
  vi.spyOn(appointments, 'getAppointment').mockResolvedValue(appointment);
  const element = await mount<Manage>(
    `<zd-appointment appointment-id="${appointment.appointment_id}" provider-name="${PROVIDER}"></zd-appointment>`
  );
  await vi.waitFor(() => part(element, 'panel'));
  await settled(element);
  return element;
}

async function click(element: Manage, name: string): Promise<void> {
  part(element, name).click();
  await settled(element);
}

describe('zd-appointment', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'cancelAppointment').mockResolvedValue({
      appointment_id: ID,
      appointment_status: 'cancelled',
    });
    vi.spyOn(appointments, 'rescheduleAppointment').mockResolvedValue(rescheduled('rescheduled'));
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([
      {
        provider_location_id: SCENARIOS.providerLocationConfirmed,
        first_availability: null,
        timeslots: buildTimeslots('2026-08-06', ['14:00']),
      },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('lookup', () => {
    it('shows the status, provider, time and confirmation number', async () => {
      const element = await mountLoaded();

      expect(appointments.getAppointment).toHaveBeenCalledWith(ID);
      expect(text(element, 'appointment-status')).toBe('Confirmed');
      expect(text(element, 'provider')).toBe(PROVIDER);
      expect(text(element, 'when')).toContain('9:00');
      expect(text(element, 'reference')).toBe(ID);
    });

    it('stays idle without an id', async () => {
      const spy = vi.spyOn(appointments, 'getAppointment');
      const element = await mount<Manage>('<zd-appointment appointment-id="  "></zd-appointment>');

      expect(spy).not.toHaveBeenCalled();
      expect(queryPart(element, 'panel')).toBeNull();
      expect(queryPart(element, 'error')).toBeNull();
    });

    it('ignores a lookup that finishes after the id changed', async () => {
      const first = deferred<AppointmentDetails>();
      vi.spyOn(appointments, 'getAppointment')
        .mockReturnValueOnce(first.promise)
        .mockResolvedValueOnce(
          details({ appointment_id: SCENARIOS.appointmentPending, appointment_status: 'pending_booking' })
        );
      const element = await mount<Manage>(`<zd-appointment appointment-id="${ID}"></zd-appointment>`);

      element.appointmentId = SCENARIOS.appointmentPending;
      await vi.waitFor(() => part(element, 'panel'));
      first.resolve(details());
      await first.promise;
      await settled(element);

      expect(text(element, 'reference')).toBe(SCENARIOS.appointmentPending);
    });

    it('shows a not-found message and emits appointment-error on 404', async () => {
      const error = new ZocdocNotFoundError();
      vi.spyOn(appointments, 'getAppointment').mockRejectedValue(error);
      const element = document.createElement('div');
      const seen = record(element, 'appointment-error');
      element.innerHTML = `<zd-appointment appointment-id="${SCENARIOS.appointmentNotFound}"></zd-appointment>`;
      const manage = element.firstElementChild as Manage;
      document.body.append(element);

      await vi.waitFor(() => part(manage, 'error'));

      expect(text(manage, 'error')).toContain('could not find this appointment');
      expect(seen[0]?.detail).toEqual({ error, action: 'load' });
      element.remove();
    });
  });

  describe('actions offered', () => {
    it.each([
      ['confirmed', true, true],
      ['pending_booking', true, true],
      ['pending_reschedule', true, true],
      ['rescheduled', true, true],
      ['reschedule_failed', false, true],
      ['booking_failed', false, false],
      ['cancelled', false, false],
      ['no_show', false, false],
    ] as const)('%s: change time %s, cancel %s', async (status, canMove, canCancel) => {
      const element = await mountLoaded(details({ appointment_status: status }));

      expect(queryPart(element, 'reschedule') !== null).toBe(canMove);
      expect(queryPart(element, 'cancel') !== null).toBe(canCancel);
    });

    it('does not offer a new time when the patient type is unknown', async () => {
      const element = await mountLoaded(details({ patient_type: undefined }));

      expect(queryPart(element, 'reschedule')).toBeNull();
      expect(queryPart(element, 'cancel')).not.toBeNull();
    });
  });

  describe('cancel', () => {
    it('asks first, moves focus, and sends the chosen reason', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-cancel');
      expect(shadow(element).activeElement).toBeNull();

      await click(element, 'cancel');
      expect(shadow(element).activeElement).toBe(part(element, 'panel'));
      expect(appointments.cancelAppointment).not.toHaveBeenCalled();

      const reason = part<HTMLElement & { value: string }>(element, 'reason');
      reason.value = 'patient_no_longer_available';
      reason.dispatchEvent(new Event('change'));
      part<HTMLFormElement>(element, 'cancel-form').requestSubmit();

      await vi.waitFor(() => expect(text(element, 'appointment-status')).toBe('Cancelled'));
      expect(appointments.cancelAppointment).toHaveBeenCalledWith({
        appointmentId: ID,
        reasonType: 'patient_no_longer_available',
      });
      expect(text(element, 'notice')).toBe('Your appointment is cancelled.');
      expect(queryPart(element, 'actions')).toBeNull();
      expect(seen[0]?.detail).toEqual({ appointmentId: ID, status: 'cancelled' });
    });

    it('returns to the details without a request when the patient keeps it', async () => {
      const element = await mountLoaded();

      await click(element, 'cancel');
      await click(element, 'keep');

      expect(queryPart(element, 'cancel-form')).toBeNull();
      expect(appointments.cancelAppointment).not.toHaveBeenCalled();
    });

    it('sends one cancel when called twice at once', async () => {
      const element = await mountLoaded();
      const pending = deferred<{ appointment_id: string; appointment_status: 'cancelled' }>();
      vi.mocked(appointments.cancelAppointment).mockReturnValueOnce(pending.promise);

      const first = element.cancel();
      const second = element.cancel();
      pending.resolve({ appointment_id: ID, appointment_status: 'cancelled' });
      await Promise.all([first, second]);

      expect(appointments.cancelAppointment).toHaveBeenCalledTimes(1);
    });

    it('on 409, says so and reloads the real status', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-error');
      vi.mocked(appointments.cancelAppointment).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 409.', 409)
      );
      vi.mocked(appointments.getAppointment).mockResolvedValueOnce(
        details({ appointment_status: 'no_show' })
      );

      await element.cancel();
      await settled(element);

      expect(appointments.getAppointment).toHaveBeenCalledTimes(2);
      expect(text(element, 'appointment-status')).toBe('Missed');
      expect(text(element, 'action-error')).toContain('can no longer be cancelled');
      expect(queryPart(element, 'actions')).toBeNull();
      expect(seen[0]?.detail.action).toBe('cancel');
    });

    it('shows generic copy, never the error message, on other failures', async () => {
      const element = await mountLoaded();
      await click(element, 'cancel');
      vi.mocked(appointments.cancelAppointment).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      await element.cancel();
      await settled(element);

      expect(text(element, 'action-error')).toBe('Something went wrong. Please try again.');
      expect(queryPart(element, 'cancel-form')).not.toBeNull();
    });

    it('treats a 200 that is not cancelled as a failure', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-error');
      vi.mocked(appointments.cancelAppointment).mockResolvedValueOnce({
        appointment_id: ID,
        appointment_status: 'confirmed',
      });

      await element.cancel();
      await settled(element);

      expect(text(element, 'appointment-status')).toBe('Confirmed');
      expect(queryPart(element, 'action-error')).not.toBeNull();
      expect(seen[0]?.detail).toMatchObject({ action: 'cancel', status: 'confirmed' });
    });
  });

  describe('reschedule', () => {
    it('locks the picker to the appointment and books the chosen time', async () => {
      const element = await mountLoaded();
      const seen = record(element, 'appointment-reschedule');

      await click(element, 'reschedule');
      expect(shadow(element).activeElement).toBe(part(element, 'panel'));

      const picker = part<Picker>(element, 'picker');
      expect(picker.providerLocationId).toBe(SCENARIOS.providerLocationConfirmed);
      expect(picker.visitReasonId).toBe('pc_TlZW-r06U0W3pCsIGtSI5B');
      expect(picker.patientType).toBe('new');
      expect(picker.hidePatientType).toBe(true);
      expect(part(element, 'confirm-reschedule').hasAttribute('disabled')).toBe(true);

      picker.dispatchEvent(
        new CustomEvent('slot-select', {
          detail: { startTime: NEW_TIME, providerLocationId: SCENARIOS.providerLocationConfirmed },
        })
      );
      await settled(element);
      await click(element, 'confirm-reschedule');

      await vi.waitFor(() => expect(text(element, 'appointment-status')).toBe('Rescheduled'));
      expect(appointments.rescheduleAppointment).toHaveBeenCalledWith({
        appointmentId: ID,
        startTime: NEW_TIME,
      });
      expect(text(element, 'when')).toContain('2:00');
      expect(text(element, 'notice')).toBe('Your appointment has a new time.');
      expect(seen[0]?.detail).toEqual({ appointmentId: ID, status: 'rescheduled', startTime: NEW_TIME });
    });

    it('words a pending reschedule as waiting on the practice', async () => {
      const element = await mountLoaded();
      vi.mocked(appointments.rescheduleAppointment).mockResolvedValueOnce(
        rescheduled('pending_reschedule')
      );

      await element.reschedule(NEW_TIME);
      await settled(element);

      expect(text(element, 'notice')).toContain('still has to accept');
    });

    it('treats a 200 with reschedule_failed as a failure and keeps the old time', async () => {
      const element = await mountLoaded();
      await click(element, 'reschedule');
      const seen = record(element, 'appointment-error');
      vi.mocked(appointments.rescheduleAppointment).mockResolvedValueOnce(
        rescheduled('reschedule_failed')
      );

      await element.reschedule(NEW_TIME);
      await settled(element);

      expect(text(element, 'action-error')).toContain('could not be booked');
      expect(queryPart(element, 'picker')).not.toBeNull();
      expect(seen[0]?.detail).toMatchObject({ action: 'reschedule', status: 'reschedule_failed' });
    });
  });

  describe('accessibility', () => {
    it('has no violations in view, cancel and reschedule modes', async () => {
      const element = await mountLoaded();
      await expectNoViolations(element);

      await click(element, 'cancel');
      await expectNoViolations(element);

      await click(element, 'keep');
      await click(element, 'reschedule');
      await vi.waitFor(() => part(part(element, 'picker'), 'slot'));
      await expectNoViolations(element);
    });

    it('has no violations in the error state', async () => {
      vi.spyOn(appointments, 'getAppointment').mockRejectedValue(new Error('offline'));
      const element = await mount<Manage>(`<zd-appointment appointment-id="${ID}"></zd-appointment>`);
      await vi.waitFor(() => part(element, 'error'));

      await expectNoViolations(element);
    });
  });
});
```

Before relying on `part(part(element, 'picker'), 'slot')` in the accessibility test, check the picker's slot button part name with `grep -n '@csspart' packages/api-components/src/components/availability-picker/availability-picker.ts`. If the name isn't `slot`, use the name it lists for a time button.

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `pnpm run build:types && pnpm exec vitest run --project components packages/api-components/src/components/appointment/appointment.test.ts`
Expected: FAIL. `./index.js` doesn't exist.

- [ ] **Step 3: Write the styles**

Create `packages/api-components/src/components/appointment/appointment.styles.ts`:

```ts
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .panel {
    display: grid;
    gap: 1rem;

    /* The panel takes focus on every mode change (A11Y-003), so it needs a visible ring. */
    &:focus-visible {
      outline: var(--zd-focus-outline-width) var(--zd-focus-outline-style)
        var(--zd-focus-outline-color);
      outline-offset: 2px;
    }
  }

  .heading {
    margin: 0;
    font-size: 1.25rem;
  }

  .details {
    display: grid;
    gap: 0.5rem;
    margin: 0;

    div {
      display: grid;
      gap: 0.125rem;
    }

    dt {
      font-weight: 600;
    }

    dd {
      margin: 0;
    }
  }

  .notice:empty {
    display: none;
  }

  .cancel-form {
    display: grid;
    gap: 1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;
```

`.notice:empty` hides the box, not the live region: the element stays in the tree and the region still exists before text arrives.

- [ ] **Step 4: Write the component**

Create `packages/api-components/src/components/appointment/appointment.ts`:

```ts
import { CharmElement, ZdAlert, ZdButton, ZdSelect } from '@zocdoc/api-primitive-components';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  CANCELLABLE_STATUSES,
  RESCHEDULABLE_STATUSES,
  cancelAppointment,
  getAppointment,
  rescheduleAppointment,
} from '../../client/appointments.js';
import { ZocdocError, ZocdocNotFoundError } from '../../client/errors.js';
import type {
  AppointmentDetails,
  AppointmentStatus,
  CancellationReasonType,
} from '../../client/types.js';
import { userFacingError } from '../../utilities/error-message.js';
import { formatAppointmentTime } from '../../utilities/provider-time.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../../utilities/request-state.js';
import {
  ZdAvailabilityPicker,
  type SlotSelectDetail,
} from '../availability-picker/availability-picker.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
import styles from './appointment.styles.js';

/** The appointment was cancelled. */
export interface AppointmentCancelDetail {
  appointmentId: string;
  status: AppointmentStatus;
}

/** The appointment moved. `startTime` is the slot the patient chose, offset included. */
export interface AppointmentRescheduleDetail {
  appointmentId: string;
  status: AppointmentStatus;
  startTime: string;
}

/**
 * A lookup, cancel or reschedule failed. `status` is set when the API answered 200 with an
 * outcome that isn't the one asked for, and then `error` is a synthetic one naming only it.
 */
export interface AppointmentErrorDetail extends ErrorDetail {
  action: 'load' | 'cancel' | 'reschedule';
  status?: AppointmentStatus;
}

export interface ZdAppointmentEventMap {
  'appointment-cancel': CustomEvent<AppointmentCancelDetail>;
  'appointment-reschedule': CustomEvent<AppointmentRescheduleDetail>;
  'appointment-error': CustomEvent<AppointmentErrorDetail>;
}

type Mode = 'view' | 'cancel' | 'reschedule';

/** The panel heading per mode. It's also the panel's accessible name. */
const HEADINGS: Record<Mode, string> = {
  view: 'Your appointment',
  cancel: 'Cancel this appointment?',
  reschedule: 'Choose a new time',
};

/** Every documented status in patient words. An undocumented one falls back below. */
const STATUS_TEXT: Record<AppointmentStatus, string> = {
  pending_booking: 'Requested. The practice still has to accept it.',
  confirmed: 'Confirmed',
  booking_failed: 'Not booked. The booking did not go through.',
  cancelled: 'Cancelled',
  no_show: 'Missed',
  pending_reschedule: 'Time change requested. The practice still has to accept it.',
  rescheduled: 'Rescheduled',
  reschedule_failed: 'The time change did not go through. Contact the practice to check your time.',
};

/** Only the reasons a patient would give. The provider-side values aren't theirs to pick. */
const CANCEL_REASONS: readonly { value: CancellationReasonType; label: string }[] = [
  { value: 'patient_no_longer_needs_appointment', label: 'I no longer need this appointment' },
  { value: 'patient_no_longer_available', label: 'I can no longer make this time' },
  { value: 'rescheduling_patient', label: 'I am booking a different time' },
];

/** A reschedule that answers 200 with anything else hasn't moved the appointment. */
const MOVED_STATUSES: ReadonlySet<AppointmentStatus> = new Set<AppointmentStatus>([
  'rescheduled',
  'pending_reschedule',
  'confirmed',
]);

/**
 * Looks up a booked appointment by ID and lets the patient cancel it or move it to a new
 * time.
 *
 * It fetches its own appointment, the way the availability picker fetches its own times, so
 * it can be the whole of a "manage your appointment" page (COMP-004). Reschedule embeds the
 * picker locked to the appointment's location, visit reason and patient type, because the
 * API moves only the time. Times for anything else would be rejected.
 *
 * Neither action retries by itself. The API doesn't document either as idempotent, so each
 * one sends at most one request at a time.
 *
 * @tag zd-appointment
 * @event appointment-cancel - Emitted with `{ appointmentId, status }` once cancelled.
 * @event appointment-reschedule - Emitted with `{ appointmentId, status, startTime }` once moved.
 * @event appointment-error - Emitted with `{ error, action, status? }` when a lookup, cancel or reschedule fails.
 * @csspart panel - The container for every mode, and the focus target on each mode change.
 * @csspart heading - The panel heading.
 * @csspart details - The list of appointment details.
 * @csspart appointment-status - The status, in patient words.
 * @csspart provider - The provider name, when `provider-name` is set.
 * @csspart when - The appointment's date and time, in the provider's zone.
 * @csspart reference - The confirmation number.
 * @csspart notice - The polite live region announcing a completed action.
 * @csspart action-error - The alert shown when an action fails.
 * @csspart actions - The row of action buttons.
 * @csspart reschedule - The "Change time" button.
 * @csspart cancel - The "Cancel appointment" button.
 * @csspart cancel-form - The cancel confirmation form.
 * @csspart reason - The cancellation reason select.
 * @csspart confirm-cancel - The button that sends the cancel.
 * @csspart keep - The button that backs out of cancelling.
 * @csspart picker - The embedded availability picker.
 * @csspart confirm-reschedule - The button that sends the new time.
 * @csspart back - The button that backs out of rescheduling.
 */
export class ZdAppointment extends CharmElement {
  public static override baseName = 'appointment';

  declare public addEventListener: TypedEventTarget<ZdAppointmentEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdAppointmentEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdAppointmentEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [...requestStateDependencies, ZdAlert, ZdButton, ZdSelect, ZdAvailabilityPicker];
  }

  /** The appointment to load. Changing it reloads. */
  @property({ attribute: 'appointment-id' })
  public appointmentId?: string;

  /** Who the appointment is with. The lookup doesn't return a name, so the host passes it. */
  @property({ attribute: 'provider-name' })
  public providerName?: string;

  @state() protected requestState: RequestState = 'idle';
  @state() protected errorMessage?: string;
  @state() protected appointment?: AppointmentDetails;
  @state() protected mode: Mode = 'view';
  @state() protected busy = false;
  @state() protected notice?: string;
  @state() protected actionError?: string;
  @state() protected reasonType?: CancellationReasonType;
  @state() protected newStartTime?: string;

  /** Bumped by every load, so a late answer for an older ID is dropped. */
  private loadToken = 0;
  private renderedMode?: Mode;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('appointmentId')) void this.load();
  }

  /**
   * Moves focus to the panel on a mode change (A11Y-003). Not on first paint: focus belongs
   * to the host page until the patient does something.
   */
  protected override updated(): void {
    const previous = this.renderedMode;
    this.renderedMode = this.mode;

    if (!previous || previous === this.mode) return;
    this.shadowRoot?.querySelector<HTMLElement>('[part="panel"]')?.focus();
  }

  /** Fetches the appointment. Safe to call repeatedly. Stays idle without an ID. */
  public async load(): Promise<void> {
    const token = ++this.loadToken;
    const id = this.appointmentId?.trim();

    this.mode = 'view';
    this.notice = undefined;
    this.actionError = undefined;
    this.reasonType = undefined;
    this.newStartTime = undefined;

    if (!id) {
      this.appointment = undefined;
      this.requestState = 'idle';
      return;
    }

    this.requestState = 'loading';
    this.errorMessage = undefined;

    try {
      const appointment = await getAppointment(id);
      if (token !== this.loadToken) return;

      this.appointment = appointment;
      this.requestState = 'success';
    } catch (error: unknown) {
      if (token !== this.loadToken) return;

      this.appointment = undefined;
      this.requestState = 'error';
      this.errorMessage =
        error instanceof ZocdocNotFoundError
          ? 'We could not find this appointment. Check the confirmation number and try again.'
          : userFacingError(error);
      this.emit('appointment-error', { detail: { error, action: 'load' } });
    }
  }

  /**
   * Cancels the loaded appointment. Public so a host page can drive it. Returns without a
   * request while another action is in flight.
   */
  public async cancel(reasonType?: CancellationReasonType): Promise<void> {
    const appointment = this.appointment;
    if (this.busy || !appointment) return;

    const token = this.loadToken;
    this.busy = true;
    this.actionError = undefined;

    try {
      const result = await cancelAppointment({
        appointmentId: appointment.appointment_id,
        ...(reasonType === undefined ? {} : { reasonType }),
      });

      if (result.appointment_status !== 'cancelled') {
        this.actionError = 'This appointment could not be cancelled. Please contact the practice.';
        this.emit('appointment-error', {
          detail: {
            error: new Error(`Appointment status: ${result.appointment_status}`),
            action: 'cancel',
            status: result.appointment_status,
          },
        });
        return;
      }

      this.emit('appointment-cancel', {
        detail: { appointmentId: result.appointment_id, status: result.appointment_status },
      });
      if (token !== this.loadToken) return;

      this.appointment = { ...appointment, appointment_status: result.appointment_status };
      this.mode = 'view';
      this.reasonType = undefined;
      this.notice = 'Your appointment is cancelled.';
    } catch (error: unknown) {
      this.emit('appointment-error', { detail: { error, action: 'cancel' } });

      if (error instanceof ZocdocError && error.status === 409) {
        // Its status changed elsewhere. Show the real one rather than the stale one.
        await this.load();
        this.actionError = 'This appointment can no longer be cancelled. Its current status is shown.';
      } else {
        this.actionError = userFacingError(error);
      }
    } finally {
      this.busy = false;
    }
  }

  /**
   * Moves the loaded appointment to `startTime`, which must be a slot from its own
   * location, visit reason and patient type. Returns without a request while another
   * action is in flight.
   */
  public async reschedule(startTime: string): Promise<void> {
    const appointment = this.appointment;
    if (this.busy || !appointment) return;

    const token = this.loadToken;
    this.busy = true;
    this.actionError = undefined;

    try {
      const result = await rescheduleAppointment({
        appointmentId: appointment.appointment_id,
        startTime,
      });

      if (!MOVED_STATUSES.has(result.appointment_status)) {
        // Stays on the picker: the likeliest fix is another time.
        this.actionError = 'The new time could not be booked. Try choosing another time.';
        this.emit('appointment-error', {
          detail: {
            error: new Error(`Appointment status: ${result.appointment_status}`),
            action: 'reschedule',
            status: result.appointment_status,
          },
        });
        return;
      }

      this.emit('appointment-reschedule', {
        detail: {
          appointmentId: result.appointment_id,
          status: result.appointment_status,
          startTime,
        },
      });
      if (token !== this.loadToken) return;

      this.appointment = {
        ...appointment,
        appointment_status: result.appointment_status,
        start_time: startTime,
      };
      this.mode = 'view';
      this.newStartTime = undefined;
      this.notice =
        result.appointment_status === 'pending_reschedule'
          ? 'Your change was sent. The practice still has to accept the new time.'
          : 'Your appointment has a new time.';
    } catch (error: unknown) {
      this.actionError = userFacingError(error);
      this.emit('appointment-error', { detail: { error, action: 'reschedule' } });
    } finally {
      this.busy = false;
    }
  }

  protected setMode(mode: Mode): void {
    this.mode = mode;
    this.actionError = undefined;
    this.notice = undefined;
    if (mode !== 'reschedule') this.newStartTime = undefined;
  }

  /** `booking_failed` is cancellable per the spec, but there's nothing for a patient to cancel. */
  protected canCancel(appointment: AppointmentDetails): boolean {
    const status = appointment.appointment_status;
    return CANCELLABLE_STATUSES.has(status) && status !== 'booking_failed';
  }

  /** Reschedule keeps the original patient type. If the lookup omits it, don't guess. */
  protected canReschedule(appointment: AppointmentDetails): boolean {
    return RESCHEDULABLE_STATUSES.has(appointment.appointment_status) && Boolean(appointment.patient_type);
  }

  protected renderDetails(appointment: AppointmentDetails): unknown {
    const when = formatAppointmentTime(appointment.start_time);
    const status =
      STATUS_TEXT[appointment.appointment_status] ?? 'Contact the practice to check this appointment.';

    return this.html`
      <dl class="details" part="details">
        <div><dt>Status</dt><dd part="appointment-status">${status}</dd></div>
        ${this.providerName ? this.html`<div><dt>Provider</dt><dd part="provider">${this.providerName}</dd></div>` : nothing}
        ${when ? this.html`<div><dt>When</dt><dd part="when">${when}</dd></div>` : nothing}
        <div><dt>Confirmation number</dt><dd part="reference">${appointment.appointment_id}</dd></div>
      </dl>
    `;
  }

  protected renderActions(appointment: AppointmentDetails): unknown {
    const canMove = this.canReschedule(appointment);
    const canCancel = this.canCancel(appointment);
    if (!canMove && !canCancel) return nothing;

    return this.html`
      <div class="actions" part="actions">
        ${canMove ? this.html`<scoped-button part="reschedule" variant="primary" @click=${() => this.setMode('reschedule')}>Change time</scoped-button>` : nothing}
        ${canCancel ? this.html`<scoped-button part="cancel" variant="secondary" @click=${() => this.setMode('cancel')}>Cancel appointment</scoped-button>` : nothing}
      </div>
    `;
  }

  protected renderCancel(): unknown {
    return this.html`
      <form
        class="cancel-form"
        part="cancel-form"
        @submit=${(event: Event) => {
          event.preventDefault();
          void this.cancel(this.reasonType);
        }}
      >
        <scoped-select
          part="reason"
          label="Reason (optional)"
          .value=${this.reasonType ?? ''}
          @change=${(event: Event) => {
            const value = (event.target as ZdSelect).value;
            this.reasonType = value ? (value as CancellationReasonType) : undefined;
          }}
        >
          <option value="" .selected=${!this.reasonType}>Choose a reason…</option>
          ${CANCEL_REASONS.map(
            (reason) => this.html`<option value=${reason.value} .selected=${this.reasonType === reason.value}>${reason.label}</option>`
          )}
        </scoped-select>
        <div class="actions">
          <scoped-button part="confirm-cancel" type="submit" variant="destructive" ?disabled=${this.busy}>Cancel appointment</scoped-button>
          <scoped-button part="keep" type="button" ?disabled=${this.busy} @click=${() => this.setMode('view')}>Keep appointment</scoped-button>
        </div>
      </form>
    `;
  }

  protected renderReschedule(appointment: AppointmentDetails): unknown {
    const startTime = this.newStartTime;

    return this.html`
      <scoped-availability-picker
        part="picker"
        .providerLocationId=${appointment.provider_location_id}
        .visitReasonId=${appointment.visit_reason_id}
        .patientType=${appointment.patient_type ?? 'new'}
        .hidePatientType=${true}
        .selectedStartTime=${startTime}
        @slot-select=${(event: CustomEvent<SlotSelectDetail>) => {
          this.newStartTime = event.detail.startTime;
        }}
      ></scoped-availability-picker>
      <div class="actions">
        <scoped-button
          part="confirm-reschedule"
          variant="primary"
          ?disabled=${!startTime || this.busy}
          @click=${() => {
            if (startTime) void this.reschedule(startTime);
          }}
        >Confirm new time</scoped-button>
        <scoped-button part="back" ?disabled=${this.busy} @click=${() => this.setMode('view')}>Back</scoped-button>
      </div>
    `;
  }

  /**
   * `notice` stays mounted for the panel's lifetime, so its text change is announced
   * (A11Y-002). `action-error` mounts with its text, and its alert role announces on insertion.
   */
  protected renderPanel(): unknown {
    const appointment = this.appointment;
    if (!appointment) return nothing;

    let body: unknown;
    if (this.mode === 'cancel') body = this.renderCancel();
    else if (this.mode === 'reschedule') body = this.renderReschedule(appointment);
    else body = this.renderActions(appointment);

    return this.html`
      <section class="panel" part="panel" tabindex="-1" aria-labelledby="panel-heading">
        <h2 class="heading" part="heading" id="panel-heading">${HEADINGS[this.mode]}</h2>
        ${this.renderDetails(appointment)}
        <p class="notice" part="notice" role="status">${this.notice ?? nothing}</p>
        ${this.actionError ? this.html`<scoped-alert part="action-error" variant="danger" politeness="assertive" open>${this.actionError}</scoped-alert>` : nothing}
        ${body}
      </section>
    `;
  }

  protected override render(): unknown {
    // `empty` can't happen for a lookup by ID (a missing one is a 404, so `error`), but the
    // helper takes the message regardless.
    return renderRequestState(this.requestState, {
      emptyMessage: 'We could not find this appointment.',
      errorMessage: this.errorMessage,
      loadingMessage: 'Loading your appointment…',
      onRetry: () => void this.load(),
      children: () => this.renderPanel(),
    });
  }
}
```

Check two things against the existing code before moving on:
- **`render()`.** If `renderRequestState` is used inside `this.html\`...\`` elsewhere (the picker wraps it), wrap it the same way.
- **The 409 copy.** It says "Its current status is shown", and the test asserts "can no longer be cancelled". Keep the two in step.

- [ ] **Step 5: Register the component**

Create `packages/api-components/src/components/appointment/index.ts`:

```ts
import { project } from '@zocdoc/api-primitive-components';
import { ZdAppointment } from './appointment.js';

project.scope.registerComponent(ZdAppointment);

export { ZdAppointment };
export type {
  AppointmentCancelDetail,
  AppointmentErrorDetail,
  AppointmentRescheduleDetail,
  ZdAppointmentEventMap,
} from './appointment.js';
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `pnpm exec vitest run --project components packages/api-components/src/components/appointment/appointment.test.ts`
Expected: PASS.

If the `reason` select doesn't take `.value` from the test, set the value the way `patient-form.test.ts` drives its select (`grep -n "sex_at_birth" packages/api-components/src/components/patient-form/patient-form.test.ts`). Change only the test interaction, not the component.

- [ ] **Step 7: Lint and format**

Run: `pnpm lint && pnpm format:check`
Expected: no new findings in `components/appointment/`. Run `pnpm format` if `format:check` flags the new files.

- [ ] **Step 8: Checkpoint (stage only)**

```bash
git add packages/api-components/src/components/appointment/
```

---

### Task 4: Exports, stories and generated references

**Files:**
- Modify: `packages/api-components/src/index.ts`
- Create: `packages/api-components/src/components/appointment/appointment.stories.ts`
- Modify: `packages/api-components/src/components/booking/booking.ts` (the doc comment above `renderStepSection`, around line 850)
- Regenerated: `packages/api-components/custom-elements.json` and `.claude/skills/api-components/references/*`. Don't read or hand-edit `custom-elements.json`.

**Interfaces:**
- Consumes: `ZdAppointment` and its detail types from Task 3; `configureZocdocMock` and `SCENARIOS` from Task 2.
- Produces: the public exports `ZdAppointment`, `AppointmentCancelDetail`, `AppointmentRescheduleDetail`, `AppointmentErrorDetail` and `ZdAppointmentEventMap`; the React wrapper (generated); the agent reference `zd-appointment.md` (generated).

- [ ] **Step 1: Barrel export**

In `packages/api-components/src/index.ts`, add this in alphabetical position, before the `ZdAvailabilityGrid` export:

```ts
export {
  ZdAppointment,
  type AppointmentCancelDetail,
  type AppointmentErrorDetail,
  type AppointmentRescheduleDetail,
  type ZdAppointmentEventMap,
} from './components/appointment/index.js';
```

- [ ] **Step 2: Stories**

Create `packages/api-components/src/components/appointment/appointment.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { ZdAppointment } from './appointment.js';
import './index.js';

/**
 * Driven by the mock with the sandbox's own appointment IDs, so each story is the state the
 * real sandbox returns for that ID. The mock is stateless: cancelling here and reloading
 * shows the original status again.
 */
configureZocdocMock();

const meta: Meta<ZdAppointment> = {
  title: 'API Components/Appointment',
  component: 'zd-appointment',
  args: {
    appointmentId: SCENARIOS.appointmentConfirmed,
    providerName: 'Dr. Avery Sandoval, MD',
  },
  render: (args) => html`
    <zd-appointment
      appointment-id=${args.appointmentId ?? ''}
      provider-name=${args.providerName ?? ''}
    ></zd-appointment>
  `,
};

export default meta;
type Story = StoryObj<ZdAppointment>;

/** Confirmed. Both actions are offered. */
export const Confirmed: Story = {};

/** Waiting on the practice. Both actions are still offered. */
export const Pending: Story = { args: { appointmentId: SCENARIOS.appointmentPending } };

/** A time change waiting on the practice. */
export const PendingReschedule: Story = {
  args: { appointmentId: SCENARIOS.appointmentPendingReschedule },
};

/** A failed time change. Only cancelling is offered. */
export const RescheduleFailed: Story = {
  args: { appointmentId: SCENARIOS.appointmentRescheduleFailed },
};

/** Already cancelled. No actions. */
export const Cancelled: Story = { args: { appointmentId: SCENARIOS.appointmentCancelled } };

/** Marked as a no-show. No actions. */
export const NoShow: Story = { args: { appointmentId: SCENARIOS.appointmentNoShow } };

/** The documented 404 ID. */
export const NotFound: Story = { args: { appointmentId: SCENARIOS.appointmentNotFound } };

/** The documented 500 ID. Retry is offered. */
export const ServerError: Story = { args: { appointmentId: SCENARIOS.appointmentError } };
```

- [ ] **Step 3: Update the booking comment**

In `packages/api-components/src/components/booking/booking.ts`, in the doc comment above `renderStepSection`, replace:

```
   * There is no Back button on the confirmation. A booked appointment is not a step to
   * reconsider — cancelling one is a different request this library does not make.
```

with:

```
   * There is no Back button on the confirmation. A booked appointment is not a step to
   * reconsider — cancelling or moving one is `<zd-appointment>`'s job, on its own page.
```

- [ ] **Step 4: Regenerate the manifest and agent references**

Run: `pnpm run cem`
Expected: success. `git status` shows `packages/api-components/custom-elements.json` changed and a new `.claude/skills/api-components/references/zd-appointment.md`.

Spot-check the new reference without opening the manifest: `grep -n "appointment-cancel\|appointment-id" .claude/skills/api-components/references/zd-appointment.md`.

- [ ] **Step 5: Typecheck and the full test suite**

Run: `pnpm typecheck 2>&1 | tail -5`
Expected: no more errors than before Task 1 (record the count then), and none in `appointment` files. Check with `pnpm typecheck 2>&1 | grep -i appointment`, which should print nothing new.

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Checkpoint (stage only)**

```bash
git add packages/api-components/src/index.ts packages/api-components/src/components/appointment/appointment.stories.ts packages/api-components/src/components/booking/booking.ts packages/api-components/custom-elements.json .claude/skills/api-components/references/
```

`custom-elements.json` and the references already carry uncommitted insurance-fix changes. Tell Burton they're mixed before staging them.

---

### Task 5: Docs

**Files:**
- Create: `packages/docs/src/content/docs/components/appointment.mdx`
- Modify: `packages/docs/src/content/docs/client/endpoints.mdx` (line 133 and a new section)
- Modify: `packages/docs/src/content/docs/client/errors.mdx` (status table and event table)
- Modify: `packages/docs/src/content/docs/guides/testing.mdx` (line 80 and a new table)
- Modify: `packages/docs/src/content/docs/guides/zocdoc-api.mdx` (table and line 48)

**Interfaces:**
- Consumes: the names from Tasks 1 to 4, exactly as written there.
- Produces: docs only.

- [ ] **Step 1: Component page**

Create `packages/docs/src/content/docs/components/appointment.mdx`. The "API Components" sidebar autogenerates, so there's no config change.

````mdx
---
title: Appointment
description: Look up, cancel, or reschedule a booked appointment
---

import { Aside } from '@astrojs/starlight/components';
import PreviewRuntime from '@/components/PreviewRuntime.astro';

<PreviewRuntime />

The `<zd-appointment>` component loads a booked appointment by its ID, shows its status and time, and lets the patient cancel it or move it to a new time.

## Usage

```html preview
<zd-appointment
  appointment-id="d2ee5bd8-643a-42c8-8c5a-be450e903430"
  provider-name="Dr. Avery Sandoval, MD"
></zd-appointment>
```

The example uses the sandbox's confirmed appointment ID. In the docs it runs against the mock, which doesn't store anything, so a cancelled appointment comes back confirmed when you reload.

## Attributes

| Attribute | Property | Type | Description |
|---|---|---|---|
| `appointment-id` | `appointmentId` | `string` | The `appointment_id` from booking. Changing it reloads |
| `provider-name` | `providerName` | `string` | Who the appointment is with. The lookup doesn't return a name, so pass the one you showed at booking |

## What Patients Can Do

The appointment's status decides which actions appear:

| Status | Change time | Cancel |
|---|---|---|
| `confirmed`, `pending_booking`, `pending_reschedule`, `rescheduled` | Yes | Yes |
| `reschedule_failed` | No | Yes |
| `booking_failed`, `cancelled`, `no_show` | No | No |

"Change time" also requires the lookup to return `patient_type`. A reschedule keeps the original location, visit reason, and patient type, so the component shows times only for those. Without the patient type it can't tell which times the API will accept.

Cancelling asks for confirmation first, with an optional reason.

## Methods

| Method | Description |
|---|---|
| `load()` | Fetches the appointment again |
| `cancel(reasonType?)` | Cancels without the confirmation step. `reasonType` is a `CancellationReasonType` |
| `reschedule(startTime)` | Moves the appointment to `startTime`, a timeslot for its own location, visit reason, and patient type |

While one action is in flight, a second call does nothing. Neither action retries by itself.

## Events

| Event | Detail | Description |
|---|---|---|
| `appointment-cancel` | `{ appointmentId, status }` | The appointment was cancelled |
| `appointment-reschedule` | `{ appointmentId, status, startTime }` | The appointment moved. `status` may be `pending_reschedule` while the practice reviews it |
| `appointment-error` | `{ error, action, status? }` | A lookup, cancel, or reschedule failed. `action` is `load`, `cancel`, or `reschedule`. `status` is set when the API returned `200` with an outcome that isn't the one asked for |

The embedded picker's `availability-error` and `slot-select` events also bubble out.

<Aside type="danger">
  `detail.error` is for your error handling, not your UI. Never render or log `error.body`.
</Aside>

## Zocdoc API

| Action | Endpoint | Scope |
|---|---|---|
| Look up | `GET /v1/appointments/{appointment_id}` | `external.appointment.read` |
| Cancel | `POST /v1/appointments/cancel` | `external.appointment.write` |
| Change time | `GET /v1/provider_locations/availability`, then `POST /v1/appointments/reschedule` | `external.appointment.write` |

An appointment booked with a user credential can only be viewed or changed by that user. Machine-to-machine credentials can reach any appointment booked by the developer's machine-to-machine credentials. If cancel returns `409` because the appointment changed elsewhere, the component reloads it and says it can no longer be cancelled.

See Zocdoc's [Cancel](https://api-docs.zocdoc.com/guides/patient/cancel-appointments) and [Reschedule](https://api-docs.zocdoc.com/guides/patient/reschedule-appointments) guides.

## Accessibility

- Loading and errors use the same live regions as the other components
- A completed action is announced through a polite status region
- A failed action is announced as an alert
- Focus moves to the panel on each change between viewing, cancelling, and choosing a time

## Styling

| CSS part | Element |
|---|---|
| `panel` | The container for every mode, and the focus target |
| `heading` | The panel heading |
| `details` | The details list |
| `appointment-status`, `provider`, `when`, `reference` | The individual details |
| `notice` | The status message after an action |
| `action-error` | The alert when an action fails |
| `actions`, `reschedule`, `cancel` | The action row and its buttons |
| `cancel-form`, `reason`, `confirm-cancel`, `keep` | The cancel confirmation |
| `picker`, `confirm-reschedule`, `back` | The new-time step |
````

- [ ] **Step 2: Endpoints**

In `packages/docs/src/content/docs/client/endpoints.mdx`, replace line 133, the paragraph starting "Use `appointment_id` to reschedule or cancel.", with:

```mdx
Use `appointment_id` with the functions below to look up, cancel, or reschedule the appointment, or use [`<zd-appointment>`](/zocdoc-api-components/components/appointment/). To hear about status changes, such as a pending booking becoming confirmed, subscribe your backend to Zocdoc [Webhooks](https://api-docs.zocdoc.com/guides/webhooks).

### getAppointment

`GET /v1/appointments/{appointment_id}`: one appointment, including the `provider_location_id`, `visit_reason_id`, and `patient_type` a reschedule needs. Requires the `external.appointment.read` scope.

```typescript
import { getAppointment } from '@zocdoc/api-components';

const appointment = await getAppointment('d2ee5bd8-643a-42c8-8c5a-be450e903430');
// appointment.appointment_status, appointment.start_time, appointment.patient_type, ...
```

A blank ID throws before any request is sent. An unknown ID throws `ZocdocNotFoundError`. `notes` and `cancellation_reason` are patient free text, so treat them as PHI.

### cancelAppointment

`POST /v1/appointments/cancel`. Requires `external.appointment.write`.

```typescript
import { cancelAppointment, CANCELLABLE_STATUSES } from '@zocdoc/api-components';

if (CANCELLABLE_STATUSES.has(appointment.appointment_status)) {
  const result = await cancelAppointment({
    appointmentId: appointment.appointment_id,
    reasonType: 'patient_no_longer_available',
  });
  // result.appointment_status: 'cancelled'
}
```

| Name | Type | Required | Description |
|---|---|---|---|
| `appointmentId` | `string` | Yes | The appointment to cancel |
| `reasonType` | `CancellationReasonType` | No | Recommended when known |
| `reason` | `string` | No | Free text. Only with `other_patient_reason` or `other_provider_reason`, otherwise the call throws before sending |

An appointment whose status doesn't allow cancelling (`cancelled` or `no_show`) returns `409`.

### rescheduleAppointment

`POST /v1/appointments/reschedule`: move an appointment to a new time at the same location, for the same visit reason and patient type. Requires `external.appointment.write`.

```typescript
import { getAvailability, rescheduleAppointment } from '@zocdoc/api-components';

const [entry] = await getAvailability({
  providerLocationIds: [appointment.provider_location_id],
  visitReasonId: appointment.visit_reason_id,
  patientType: appointment.patient_type,
});

const result = await rescheduleAppointment({
  appointmentId: appointment.appointment_id,
  startTime: entry.timeslots[0].start_time, // Exactly as returned
});
// result.appointment_status: 'rescheduled' | 'pending_reschedule' | ...
```

Only `pending_booking`, `confirmed`, `pending_reschedule`, and `rescheduled` appointments can move. `RESCHEDULABLE_STATUSES` holds that list. As with booking, check `appointment_status` on the result.

<Aside type="caution">
  Don't retry `cancelAppointment` or `rescheduleAppointment` automatically. The API doesn't document either as idempotent.
</Aside>
```

The inner TypeScript fences go into the MDX file as plain triple-backtick fences.

- [ ] **Step 3: Errors**

In `packages/docs/src/content/docs/client/errors.mdx`:

1. In the hierarchy table, change the `ZocdocError` row's "Typical cause" cell to:

   ```
   `400` validation errors, `403` missing scope, `409` an appointment that can no longer be cancelled, `429` rate limit, `5xx` server errors
   ```

2. Add a row to the component events table:

   ```
   | `appointment-error` | `<zd-appointment>`. `detail.action` says which call failed, and `detail.status` is set when the API returned `200` with an outcome that isn't the one asked for |
   ```

3. In the last paragraph, after "a retry could double-book.", add: " The same goes for `cancelAppointment` and `rescheduleAppointment`."

- [ ] **Step 4: Testing guide**

In `packages/docs/src/content/docs/guides/testing.mdx`:

1. Replace line 80 with:

   ```
   In the mock, any other location confirms. Zocdoc's guide also documents sandbox scenarios for endpoints these components don't call yet, including `/v1/providers` by NPI, facilities, and insurance mappings.
   ```

2. After that paragraph, before `### Insurance plans`, add:

```mdx
### Appointments (`GET /v1/appointments/{id}`, cancel, reschedule)

These are the IDs booking returns, so a test can book and then manage the same appointment:

| Appointment ID | `SCENARIOS` key | Status |
|---|---|---|
| `2b29f79b-6d7f-472a-9603-d0c378bc9531` | `appointmentPending` | `pending_booking` |
| `d2ee5bd8-643a-42c8-8c5a-be450e903430` | `appointmentConfirmed` | `confirmed` (new patient) |
| `423e6a11-8dac-4873-b933-d8d02f9a370f` | `appointmentConfirmedExisting` | `confirmed` (existing patient) |
| `34e4ead3-ca69-4448-9438-58702dd1048f` | `appointmentBookingFailed` | `booking_failed` |
| `21990114-ea71-4d7d-9d1e-00c43ae44bcd` | `appointmentCancelled` | `cancelled` |
| `a0a7770d-e667-416c-9f06-9c3b40a7bb84` | `appointmentNoShow` | `no_show` |
| `63f995c2-49c4-40c8-a93a-140fb32e913b` | `appointmentPendingReschedule` | `pending_reschedule` |
| `8507d05f-cbe5-4732-b72a-22add9c80120` | `appointmentRescheduled` | `rescheduled` |
| `84d04f67-b2cf-4afd-ab64-193072498ed5` | `appointmentRescheduleFailed` | `reschedule_failed` |
| `83f5cf14-3eb1-4034-be1f-e7c3058aad21` | `appointmentNotFound` | `404` on all three calls |
| `dc69a428-8a73-461b-bd7b-df755910a3fb` | `appointmentError` | `500` on all three calls |

In the mock, cancel returns `cancelled`, or `409` for `cancelled` and `no_show`. Reschedule returns `rescheduled`, or `400` for a status that can't move. The mock is stateless, so a cancelled appointment looks up with its original status again. The mock doesn't check that a reschedule time was offered. The real API does.
```

- [ ] **Step 5: API overview**

In `packages/docs/src/content/docs/guides/zocdoc-api.mdx`:

1. Add a row to the mapping table after "Confirm":

   ```
   | Manage | `GET /v1/appointments/{id}`, `POST /v1/appointments/cancel`, `POST /v1/appointments/reschedule` | `getAppointment`, `cancelAppointment`, `rescheduleAppointment` | `<zd-appointment>` | `<zd-appointment>` |
   ```

2. Replace line 48 with:

   ```
   - To reschedule or cancel an appointment, use the returned `appointment_id` with [`<zd-appointment>`](/zocdoc-api-components/components/appointment/) or the client functions. A reschedule keeps the location, visit reason, and patient type, and only moves the time. See Zocdoc's [Reschedule](https://api-docs.zocdoc.com/guides/patient/reschedule-appointments) and [Cancel](https://api-docs.zocdoc.com/guides/patient/cancel-appointments) guides.
   ```

- [ ] **Step 6: Build the docs and check for drift**

Run: `pnpm --filter ./packages/docs build`. If the filter doesn't resolve, run `cd packages/docs && pnpm build`.
Expected: success, with one more page than before.

Run: `pnpm docs:check`
Expected: exits 0 once Task 4's regenerated files are staged. If it reports drift, rerun `pnpm run cem` and restage.

- [ ] **Step 7: Checkpoint (stage only)**

```bash
git add packages/docs/src/content/docs/components/appointment.mdx packages/docs/src/content/docs/client/endpoints.mdx packages/docs/src/content/docs/client/errors.mdx packages/docs/src/content/docs/guides/testing.mdx packages/docs/src/content/docs/guides/zocdoc-api.mdx
```

`zocdoc-api.mdx` and `testing.mdx` may already carry uncommitted changes from the earlier docs work. Mention that when handing back.

---

## Out of Scope

- Looking up the provider by `provider_location_id` (`GET /v1/provider_locations/{id}`) to show a name and photo. The host passes `provider-name` for now.
- A cancellation reason with free text (`other_patient_reason` plus text). The client supports it, but the component doesn't collect it.
- A manage page in `packages/demo`.
- Webhooks for status changes.
