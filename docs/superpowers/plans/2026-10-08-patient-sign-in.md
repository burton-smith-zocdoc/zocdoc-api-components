# Patient Sign-In (`<zd-sign-in>`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `<zd-sign-in>` and the `PatientAuth` seam behind it, backed by `createMockPatientAuth()`, so a host can build the signed-in booking and appointment flows today and swap in the real PKCE factory later without other changes.

**Architecture:** `client/patient-auth.ts` defines the `PatientAuth` interface and an in-memory mock with no network calls. `components/sign-in/` is a `CharmElement` that takes a `PatientAuth` as a property. It runs `idle | loading | success | error`, calls `auth.signIn({ loginHint })` on submit and `auth.completeSignIn()` when `auth` is set, and emits `sign-in-complete` and `sign-in-error`. It never configures the client and never talks to another component.

**Tech Stack:** TypeScript, Lit on Charm UX (`CharmElement`, `this.html`, `<scoped-*>`), Vitest (`client` node project, `components` browser project), Storybook, Astro Starlight docs.

**Spec:** `docs/superpowers/specs/2026-10-08-patient-sign-in-design.md`

## Global Constraints

- The token never appears in an event detail, attribute, log or error message. `sign-in-complete` carries `{}`.
- The email never appears in an event detail, attribute, log or error message (PHI-001). `email` is `@property({ attribute: false })`.
- The mock makes no network calls and keeps state in memory only (PHI-003). Its token is exactly `'mock-patient-token-not-a-credential'`.
- `getToken` rejects with `ZocdocAuthError` when signed out (CLIENT-002, CLIENT-003).
- The error state shows exactly "We couldn't sign you in. Please try again." It never renders `error.message` (CLIENT-003).
- Exact copy, all in DOM text nodes (I18N-001):
  - Default heading: "Sign in to manage your appointments"
  - Email label: "Email address (optional)"
  - Button: "Continue with Zocdoc"
  - Helper text: "You'll finish signing in on Zocdoc."
  - Loading status: "Signing in…"
  - Success status: "You're signed in."
- `baseName = 'sign-in'`, registered through `project.scope.registerComponent` (PBZD-002, PBZD-004). Templates use `this.html` and `<scoped-*>`, and every scoped tag is listed in `dependencies` (PBZD-003).
- Emit only through `this.emit()`, typed by `ZdSignInEventMap` (COMP-003).
- CSS uses nesting and logical properties (STYLE-001, I18N-003).
- Test emails use `@example.com` (PHI-002, RFC 2606). Component tests use a stub `PatientAuth`, never `fetch` (TEST-002).
- Out of scope, so don't build any of it: `createPatientAuth`, sign-out, `anonymous_token`, and demo site changes.
- Baselines on `main` at `dd9336d`: `pnpm typecheck` reports 22 pre-existing `error TS` lines. Record the full-suite count in Task 0.
- Commit messages end with:
  ```
  Generated with AI

  Co-Authored-By: Claude Code
  ```

## Review Focus

1. **`auth` is replaced while a sign-in is in flight.** A host swapping the mock for a new instance must not have the old promise flip the new instance to `success` or emit for it. Pinned in Task 2 ("drops a sign-in that settles after auth was replaced").
2. **`completeSignIn()` rejects when `auth` is set,** for example because of a bad or expired code on the callback URL. The patient must see the error state and the host must get `sign-in-error`. Before the fix it would sit idle with no explanation. Pinned in Task 2 ("shows the error when completing a returned sign-in fails").
3. **Pressing the real button submits the form.** Charm's button is form-associated and calls `requestSubmit` on its form, and the form sits in our shadow root. A test that only calls `requestSubmit()` itself would pass with the button broken. Pinned in Task 2 ("clicking the button submits").
4. **Focus after a state change** (A11Y-003). The button disables while loading, so the browser drops focus to `body`. After an error, focus must land on "Try again". After retry it must land on the submit button, and after success on the panel. Pinned in Task 2 ("moves focus after each patient action").
5. **`auth` is cleared or a second sign-in starts after success.** Setting `auth = undefined` must return to idle with the button disabled and nothing thrown. A submit in `success` must not call `signIn` again. Pinned in Task 2 ("clearing auth goes back to a disabled form") and ("does not sign in again once signed in").

---

### Task 0: Branch, worktree and baseline

**Files:**
- Add: `docs/superpowers/specs/2026-10-08-patient-sign-in-design.md` (currently untracked on `main`)
- Add: `docs/superpowers/plans/2026-10-08-patient-sign-in.md` (this file)

`main` has unrelated uncommitted changes under `packages/docs/.astro/` and `packages/docs/src/styles/preview.css`. They belong to someone else, so leave them alone and work in a worktree.

- [ ] **Step 1: Create the worktree**

```bash
cd /Users/burton.smith/Projects/zocdoc-api-components
git worktree add .claude/worktrees/feat-patient-sign-in -b feat/patient-sign-in main
cp docs/superpowers/specs/2026-10-08-patient-sign-in-design.md .claude/worktrees/feat-patient-sign-in/docs/superpowers/specs/
cp docs/superpowers/plans/2026-10-08-patient-sign-in.md .claude/worktrees/feat-patient-sign-in/docs/superpowers/plans/
cd .claude/worktrees/feat-patient-sign-in
pnpm install
```

Run every later command from the worktree.

- [ ] **Step 2: Record the baseline**

```bash
pnpm typecheck 2>&1 | grep -c "error TS"
pnpm test 2>&1 | tail -5
```

Expected: `22` from typecheck. Write down the test totals, because Task 3 compares against them.

- [ ] **Step 3: Commit the spec and plan**

```bash
git add docs/superpowers/specs/2026-10-08-patient-sign-in-design.md docs/superpowers/plans/2026-10-08-patient-sign-in.md
git commit -m "docs: design and plan patient sign-in

Generated with AI

Co-Authored-By: Claude Code"
```

Once that commit exists, delete the untracked spec and plan copies from the main checkout. They now live on the branch.

---

### Task 1: The `PatientAuth` seam and its mock

**Files:**
- Create: `packages/api-components/src/client/patient-auth.ts`
- Test: `packages/api-components/src/client/__tests__/patient-auth.test.ts`
- Modify: `packages/api-components/src/index.ts`. Add `export * from './client/patient-auth.js';` after `export * from './client/errors.js';`.
- Modify: `packages/api-components/src/bundle.ts`. Add the same line after its `export * from './client/errors.js';`.

**Interfaces:**
- Produces:
  - `export interface SignInOptions { loginHint?: string }`
  - `export interface PatientAuth { signIn(options?: SignInOptions): Promise<void>; completeSignIn(): Promise<boolean>; getToken(): Promise<string>; isSignedIn(): boolean }`
  - `export interface MockPatientAuthOptions { fail?: boolean }`
  - `export const MOCK_PATIENT_TOKEN = 'mock-patient-token-not-a-credential'`
  - `export function createMockPatientAuth(options?: MockPatientAuthOptions): PatientAuth`

`createMockPatientAuth` goes in the main barrel, not the `./mock` subpath, because the spec's host snippet imports it from `@zocdoc/api-components`. It's about 20 lines and pulls in no fixtures, so the `./mock` rationale in `index.ts` doesn't apply.

- [ ] **Step 1: Write the failing tests**

Create `packages/api-components/src/client/__tests__/patient-auth.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZocdocAuthError } from '../errors.js';
import { MOCK_PATIENT_TOKEN, createMockPatientAuth } from '../patient-auth.js';

describe('createMockPatientAuth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects getToken with ZocdocAuthError before sign-in', async () => {
    const auth = createMockPatientAuth();

    expect(auth.isSignedIn()).toBe(false);
    await expect(auth.getToken()).rejects.toBeInstanceOf(ZocdocAuthError);
  });

  it('resolves the mock token after sign-in', async () => {
    const auth = createMockPatientAuth();

    await auth.signIn({ loginHint: 'patient@example.com' });

    expect(auth.isSignedIn()).toBe(true);
    await expect(auth.getToken()).resolves.toBe(MOCK_PATIENT_TOKEN);
    expect(MOCK_PATIENT_TOKEN).toBe('mock-patient-token-not-a-credential');
  });

  /** "Resolves on a microtask": a caller sees `loading` for at least one turn, like the real one. */
  it('is not signed in until signIn settles', async () => {
    const auth = createMockPatientAuth();

    const pending = auth.signIn();
    expect(auth.isSignedIn()).toBe(false);

    await pending;
    expect(auth.isSignedIn()).toBe(true);
  });

  it('rejects signIn and stays signed out with fail', async () => {
    const auth = createMockPatientAuth({ fail: true });

    await expect(auth.signIn()).rejects.toThrow();
    expect(auth.isSignedIn()).toBe(false);
    await expect(auth.getToken()).rejects.toBeInstanceOf(ZocdocAuthError);
  });

  it('has nothing to complete', async () => {
    await expect(createMockPatientAuth().completeSignIn()).resolves.toBe(false);
  });

  /** State lives in the closure, not the module, so one page can hold two independent mocks. */
  it('keeps each instance separate', async () => {
    const first = createMockPatientAuth();
    const second = createMockPatientAuth();

    await first.signIn();

    expect(first.isSignedIn()).toBe(true);
    expect(second.isSignedIn()).toBe(false);
  });

  /** PHI-003: the mock is the one implementation guaranteed never to leave the page. */
  it('never calls fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const auth = createMockPatientAuth();

    await auth.completeSignIn();
    await auth.getToken().catch(() => undefined);
    await auth.signIn({ loginHint: 'patient@example.com' });
    await auth.getToken();
    await createMockPatientAuth({ fail: true })
      .signIn()
      .catch(() => undefined);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:client patient-auth`
Expected: FAIL with `Failed to resolve import "../patient-auth.js"` or a similar message.

- [ ] **Step 3: Write the implementation**

Create `packages/api-components/src/client/patient-auth.ts`:

```ts
import { ZocdocAuthError } from './errors.js';

/**
 * Signing a patient in with their own Zocdoc account, so booking and appointment calls run
 * under the patient's token rather than the integrator's. Under a patient token Zocdoc lets
 * only that patient read or change what they booked.
 *
 * This is the seam, not the flow. Zocdoc's authorization code + PKCE flow is expected shortly
 * and needs an SPA client ID we don't have yet, so the only implementation today is
 * `createMockPatientAuth`. The real `createPatientAuth({ clientId, redirectUri, environment })`
 * will implement this same interface, and swapping one for the other is meant to be the only
 * change a host page makes.
 *
 * It lives in `client/` rather than in `<zd-sign-in>` because the token is a client concern
 * (CLIENT-002): the host hands `getToken` to `configureZocdoc` without needing the element.
 */

export interface SignInOptions {
  /** Pre-fills Zocdoc's login page. PII: never logged, never put in an error message. */
  loginHint?: string;
}

export interface PatientAuth {
  /** Starts sign-in. The real implementation navigates away and never resolves. */
  signIn(options?: SignInOptions): Promise<void>;
  /**
   * Finishes a sign-in that returned to this page. Resolves `true` if a sign-in was completed,
   * `false` if there was nothing to complete.
   */
  completeSignIn(): Promise<boolean>;
  /** Pass to `configureZocdoc({ getToken })`. Rejects with `ZocdocAuthError` when signed out. */
  getToken(): Promise<string>;
  isSignedIn(): boolean;
}

export interface MockPatientAuthOptions {
  /** Makes `signIn` reject, for exercising the error state. */
  fail?: boolean;
}

/** What the mock hands back once signed in. Named so nobody mistakes it for a credential. */
export const MOCK_PATIENT_TOKEN = 'mock-patient-token-not-a-credential';

/**
 * A `PatientAuth` that signs in instantly, in memory, with no network call (PHI-003). It
 * ignores `loginHint`, so the email a patient typed goes nowhere.
 *
 * The token it returns is not one Zocdoc accepts, so pair it with `configureZocdocMock()`, or
 * expect a 401 from the live API.
 */
export function createMockPatientAuth(options: MockPatientAuthOptions = {}): PatientAuth {
  let signedIn = false;

  return {
    async signIn(): Promise<void> {
      await Promise.resolve();
      if (options.fail) throw new Error('Mock sign-in failed.');
      signedIn = true;
    },
    async completeSignIn(): Promise<boolean> {
      return false;
    },
    async getToken(): Promise<string> {
      if (!signedIn) throw new ZocdocAuthError();
      return MOCK_PATIENT_TOKEN;
    },
    isSignedIn(): boolean {
      return signedIn;
    },
  };
}
```

Then add `export * from './client/patient-auth.js';` to `index.ts` and `bundle.ts` as listed under Files.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:client patient-auth`
Expected: PASS, 7 tests.

Run: `pnpm typecheck 2>&1 | grep -c "error TS"`
Expected: `22`, which means nothing new.

- [ ] **Step 5: Lint, format and commit**

```bash
pnpm lint
pnpm exec oxfmt packages/api-components/src/client/patient-auth.ts packages/api-components/src/client/__tests__/patient-auth.test.ts
git add packages/api-components/src/client/patient-auth.ts packages/api-components/src/client/__tests__/patient-auth.test.ts packages/api-components/src/index.ts packages/api-components/src/bundle.ts
git commit -m "feat(client): add the PatientAuth seam and its mock

Generated with AI

Co-Authored-By: Claude Code"
```

---

### Task 2: The `<zd-sign-in>` component

**Files:**
- Create: `packages/api-components/src/components/sign-in/sign-in.ts`
- Create: `packages/api-components/src/components/sign-in/sign-in.styles.ts`
- Create: `packages/api-components/src/components/sign-in/index.ts`
- Test: `packages/api-components/src/components/sign-in/sign-in.test.ts`
- Modify: `packages/api-components/src/index.ts` and `packages/api-components/src/bundle.ts`. Append the component export block after the `ZdProviderSearch` block in each. `bundle.test.ts` fails if only one of them has it.
- Modify: `AGENTS.md`, the Component Events table. Add two rows after the last `zd-booking` row.
- Modify: `.claude/skills/api-components/SKILL.md`. Update the component counts.
- Regenerate: `packages/api-components/custom-elements.json`, `.claude/skills/api-components/references/` (via `pnpm run docs:check`).

**Interfaces:**
- Consumes: `PatientAuth` and `SignInOptions` from `../../client/patient-auth.js` (Task 1).
- Produces:
  - `export class ZdSignIn extends CharmElement` (`zd-sign-in`) with:
    - `auth?: PatientAuth` (property only)
    - `email: string` (property only, default `''`)
    - `hideEmail: boolean` (attribute `hide-email`)
  - `export type SignInCompleteDetail = Record<string, never>`
  - `export interface ZdSignInEventMap { 'sign-in-complete': CustomEvent<SignInCompleteDetail>; 'sign-in-error': CustomEvent<ErrorDetail> }`
  - Parts: `panel`, `heading`, `status`, `error`, `retry`, `form`, `email`, `help`, `submit`.

**Behaviour decisions the spec leaves open, so pin them here:**
- The "connect logic" runs in `willUpdate` whenever `auth` changes, including the first time it's set. This is the same pattern as `zd-appointment`'s `appointmentId`.
- If `isSignedIn()` is already true, the component goes straight to `success` and doesn't call `completeSignIn()` at all.
- While `completeSignIn()` is pending, the component stays `idle` with the form usable. Showing loading would flash "Signing in…" on every page load, since the mock resolves `false` at once. If a submit has moved the component off `idle` before completion settles, the completion result is ignored.
- If `completeSignIn()` rejects, the component goes to `error` and emits `sign-in-error`. This covers Review Focus 2.
- `email` is passed as the `loginHint` even when `hide-email` is set. That lets a host that already knows the email prefill Zocdoc's page without showing the field.
- The email field uses the `label` slot rather than the `label` attribute, so the label is a DOM text node (I18N-001).

- [ ] **Step 1: Write the failing tests**

Create `packages/api-components/src/components/sign-in/sign-in.test.ts`:

```ts
import type { ZdInput } from '@zocdoc/api-primitive-components';
import { describe, expect, it, vi, type Mock } from 'vitest';
import type { PatientAuth } from '../../client/patient-auth.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, part, queryPart, settled, shadow } from '../../utils/test/mount.js';
import type { ZdSignIn } from './sign-in.js';
import './index.js';

/** RFC 2606's reserved domain, so it can't be anyone's address (PHI-002). */
const EMAIL = 'patient@example.com';

/** What a stub's rejection says. The component must never put it on screen (CLIENT-003). */
const STUB_ERROR = 'stub-developer-message';

type Stub = PatientAuth & {
  signIn: Mock<PatientAuth['signIn']>;
  completeSignIn: Mock<PatientAuth['completeSignIn']>;
  isSignedIn: Mock<PatientAuth['isSignedIn']>;
};

/** A `PatientAuth` the test drives directly (TEST-002). Signed out, nothing to complete. */
function stubAuth(): Stub {
  return {
    signIn: vi.fn<PatientAuth['signIn']>().mockResolvedValue(undefined),
    completeSignIn: vi.fn<PatientAuth['completeSignIn']>().mockResolvedValue(false),
    getToken: vi.fn<PatientAuth['getToken']>().mockResolvedValue('stub-token-not-a-credential'),
    isSignedIn: vi.fn<PatientAuth['isSignedIn']>().mockReturnValue(false),
  };
}

/** A promise the test settles by hand, for holding the component in `loading`. */
function deferred(): { promise: Promise<void>; resolve: () => void; reject: (error: unknown) => void } {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Lets a settled `auth` promise run its continuation, then waits for the render it caused. */
async function flush(element: HTMLElement): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await settled(element);
}

async function mountWith(auth?: PatientAuth, markup = '<zd-sign-in></zd-sign-in>'): Promise<ZdSignIn> {
  const element = await mount<ZdSignIn>(markup);
  if (auth) element.auth = auth;
  await flush(element);
  return element;
}

async function typeEmail(element: ZdSignIn, value: string): Promise<void> {
  const input = part<ZdInput>(element, 'email');
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await settled(element);
}

async function submit(element: ZdSignIn): Promise<void> {
  part<HTMLFormElement>(element, 'form').requestSubmit();
  await flush(element);
}

function listen(element: ZdSignIn): { complete: CustomEvent[]; error: CustomEvent[] } {
  const events = { complete: [] as CustomEvent[], error: [] as CustomEvent[] };
  element.addEventListener('sign-in-complete', (event) => events.complete.push(event));
  element.addEventListener('sign-in-error', (event) => events.error.push(event));
  return events;
}

function text(element: ZdSignIn): string {
  return shadow(element).textContent ?? '';
}

/** Every attribute value on the host and everything under it, through nested shadow roots. */
function attributeValues(root: Element | ShadowRoot): string[] {
  const own = root instanceof Element ? [...root.attributes].map((attribute) => attribute.value) : [];
  const inner = root instanceof Element && root.shadowRoot ? attributeValues(root.shadowRoot) : [];
  const children = [...root.children].flatMap((child) => attributeValues(child));
  return [...own, ...inner, ...children];
}

describe('zd-sign-in', () => {
  describe('idle', () => {
    it('renders the default heading, field, button and helper text', async () => {
      const element = await mountWith(stubAuth());

      expect(text(element)).toContain('Sign in to manage your appointments');
      expect(text(element)).toContain('Email address (optional)');
      expect(part(element, 'submit').textContent).toContain('Continue with Zocdoc');
      expect(part(element, 'help').textContent).toContain("You'll finish signing in on Zocdoc.");
      expect(part(element, 'email').getAttribute('type')).toBe('email');
      expect(part(element, 'email').getAttribute('autocomplete')).toBe('email');
    });

    it('disables the button without auth', async () => {
      const element = await mountWith();

      expect(part(element, 'submit').hasAttribute('disabled')).toBe(true);
    });

    it('hides the email field with hide-email', async () => {
      const element = await mountWith(stubAuth(), '<zd-sign-in hide-email></zd-sign-in>');

      expect(queryPart(element, 'email')).toBeNull();
      expect(part(element, 'submit').hasAttribute('disabled')).toBe(false);
    });
  });

  describe('signing in', () => {
    it('passes the email as loginHint, trimmed', async () => {
      const auth = stubAuth();
      const element = await mountWith(auth);

      await typeEmail(element, `  ${EMAIL}  `);
      await submit(element);

      expect(auth.signIn).toHaveBeenCalledTimes(1);
      expect(auth.signIn).toHaveBeenCalledWith({ loginHint: EMAIL });
    });

    it('passes undefined when the email is blank', async () => {
      const auth = stubAuth();
      const element = await mountWith(auth);

      await typeEmail(element, '   ');
      await submit(element);

      expect(auth.signIn).toHaveBeenCalledWith({ loginHint: undefined });
    });

    it('clicking the button submits', async () => {
      const auth = stubAuth();
      const element = await mountWith(auth);

      part(element, 'submit').click();
      await flush(element);

      expect(auth.signIn).toHaveBeenCalledTimes(1);
    });

    it('shows loading while signIn is pending', async () => {
      const auth = stubAuth();
      const pending = deferred();
      auth.signIn.mockReturnValue(pending.promise);
      const element = await mountWith(auth);

      await submit(element);

      expect(part(element, 'status').textContent).toContain('Signing in…');
      expect(part(element, 'status').getAttribute('aria-live')).toBe('polite');
      expect(part(element, 'submit').hasAttribute('disabled')).toBe(true);

      pending.resolve();
      await flush(element);
    });

    it('calls signIn once for two quick submits', async () => {
      const auth = stubAuth();
      const pending = deferred();
      auth.signIn.mockReturnValue(pending.promise);
      const element = await mountWith(auth);

      const form = part<HTMLFormElement>(element, 'form');
      form.requestSubmit();
      form.requestSubmit();
      await flush(element);

      expect(auth.signIn).toHaveBeenCalledTimes(1);

      pending.resolve();
      await flush(element);
    });

    it('goes to success and emits sign-in-complete with an empty detail', async () => {
      const element = await mountWith(stubAuth());
      const events = listen(element);

      await submit(element);

      expect(part(element, 'status').textContent).toContain("You're signed in.");
      expect(queryPart(element, 'form')).toBeNull();
      expect(events.complete).toHaveLength(1);
      expect(events.complete[0]!.detail).toEqual({});
      expect(events.error).toHaveLength(0);
    });

    it('does not sign in again once signed in', async () => {
      const auth = stubAuth();
      const element = await mountWith(auth);
      await submit(element);

      // The form is gone, so nothing a patient can press reaches signIn. Re-setting the same
      // email must not bring it back either.
      element.email = EMAIL;
      await flush(element);

      expect(queryPart(element, 'form')).toBeNull();
      expect(auth.signIn).toHaveBeenCalledTimes(1);
    });
  });

  describe('error', () => {
    it('shows a fixed alert, never the error message, and emits sign-in-error', async () => {
      const auth = stubAuth();
      const failure = new Error(STUB_ERROR);
      auth.signIn.mockRejectedValue(failure);
      const element = await mountWith(auth);
      const events = listen(element);

      await submit(element);

      const alert = part(element, 'error');
      expect(alert.textContent).toContain("We couldn't sign you in. Please try again.");
      expect(alert.getAttribute('politeness')).toBe('assertive');
      expect(alert.shadowRoot?.querySelector('[role="alert"]')).not.toBeNull();
      expect(text(element)).not.toContain(STUB_ERROR);
      expect(events.error).toHaveLength(1);
      expect(events.error[0]!.detail).toEqual({ error: failure });
      expect(events.complete).toHaveLength(0);
    });

    it('goes back to idle on retry', async () => {
      const auth = stubAuth();
      auth.signIn.mockRejectedValueOnce(new Error(STUB_ERROR));
      const element = await mountWith(auth);
      await submit(element);

      part(element, 'retry').click();
      await settled(element);

      expect(queryPart(element, 'error')).toBeNull();
      expect(part(element, 'form')).not.toBeNull();

      await submit(element);
      expect(auth.signIn).toHaveBeenCalledTimes(2);
      expect(part(element, 'status').textContent).toContain("You're signed in.");
    });
  });

  describe('when auth is set', () => {
    it('emits sign-in-complete when a returned sign-in completes', async () => {
      const auth = stubAuth();
      auth.completeSignIn.mockResolvedValue(true);
      const element = await mount<ZdSignIn>('<zd-sign-in></zd-sign-in>');
      const events = listen(element);

      element.auth = auth;
      await flush(element);

      expect(auth.completeSignIn).toHaveBeenCalledTimes(1);
      expect(part(element, 'status').textContent).toContain("You're signed in.");
      expect(events.complete).toHaveLength(1);
    });

    it('stays idle when there is nothing to complete', async () => {
      const auth = stubAuth();
      const element = await mount<ZdSignIn>('<zd-sign-in></zd-sign-in>');
      const events = listen(element);

      element.auth = auth;
      await flush(element);

      expect(part(element, 'form')).not.toBeNull();
      expect(events.complete).toHaveLength(0);
    });

    it('starts in success without an event when already signed in', async () => {
      const auth = stubAuth();
      auth.isSignedIn.mockReturnValue(true);
      const element = await mount<ZdSignIn>('<zd-sign-in></zd-sign-in>');
      const events = listen(element);

      element.auth = auth;
      await flush(element);

      expect(part(element, 'status').textContent).toContain("You're signed in.");
      expect(events.complete).toHaveLength(0);
      expect(auth.completeSignIn).not.toHaveBeenCalled();
    });

    it('shows the error when completing a returned sign-in fails', async () => {
      const auth = stubAuth();
      auth.completeSignIn.mockRejectedValue(new Error(STUB_ERROR));
      const element = await mount<ZdSignIn>('<zd-sign-in></zd-sign-in>');
      const events = listen(element);

      element.auth = auth;
      await flush(element);

      expect(part(element, 'error')).not.toBeNull();
      expect(text(element)).not.toContain(STUB_ERROR);
      expect(events.error).toHaveLength(1);
    });

    it('resets to idle and completes again when auth is replaced', async () => {
      const first = stubAuth();
      first.signIn.mockRejectedValue(new Error(STUB_ERROR));
      const element = await mountWith(first);
      await submit(element);
      expect(part(element, 'error')).not.toBeNull();

      const second = stubAuth();
      element.auth = second;
      await flush(element);

      expect(queryPart(element, 'error')).toBeNull();
      expect(part(element, 'form')).not.toBeNull();
      expect(second.completeSignIn).toHaveBeenCalledTimes(1);
    });

    it('drops a sign-in that settles after auth was replaced', async () => {
      const first = stubAuth();
      const pending = deferred();
      first.signIn.mockReturnValue(pending.promise);
      const element = await mountWith(first);
      const events = listen(element);
      await submit(element);

      element.auth = stubAuth();
      await flush(element);
      pending.resolve();
      await flush(element);

      expect(part(element, 'form')).not.toBeNull();
      expect(events.complete).toHaveLength(0);
    });

    it('clearing auth goes back to a disabled form', async () => {
      const element = await mountWith(stubAuth());
      await submit(element);

      element.auth = undefined;
      await flush(element);

      expect(part(element, 'submit').hasAttribute('disabled')).toBe(true);
    });
  });

  describe('the email (PHI-001)', () => {
    it('never appears in an attribute or an event detail', async () => {
      const auth = stubAuth();
      auth.signIn.mockRejectedValueOnce(new Error(STUB_ERROR));
      const element = await mountWith(auth);
      const events = listen(element);

      await typeEmail(element, EMAIL);
      expect(attributeValues(element).some((value) => value.includes(EMAIL))).toBe(false);

      await submit(element);
      part(element, 'retry').click();
      await settled(element);
      await submit(element);

      expect(attributeValues(element).some((value) => value.includes(EMAIL))).toBe(false);
      const details = [...events.complete, ...events.error].map((event) =>
        JSON.stringify(event.detail)
      );
      expect(details.some((detail) => detail.includes(EMAIL))).toBe(false);
      expect(events.error).toHaveLength(1);
      expect(events.complete).toHaveLength(1);
    });
  });

  describe('focus (A11Y-003)', () => {
    it('moves focus after each patient action', async () => {
      const auth = stubAuth();
      auth.signIn.mockRejectedValueOnce(new Error(STUB_ERROR));
      const element = await mountWith(auth);

      // First paint takes no focus: it belongs to the host page until the patient acts.
      expect(shadow(element).activeElement).toBeNull();

      await submit(element);
      expect(shadow(element).activeElement).toBe(part(element, 'retry'));

      part(element, 'retry').click();
      await settled(element);
      expect(shadow(element).activeElement).toBe(part(element, 'submit'));

      await submit(element);
      expect(shadow(element).activeElement).toBe(part(element, 'panel'));
    });
  });

  describe('accessibility (A11Y-005)', () => {
    it('has no violations in idle, loading, success and error', async () => {
      const auth = stubAuth();
      const pending = deferred();
      auth.signIn.mockReturnValueOnce(pending.promise);
      const element = await mountWith(auth);
      await expectNoViolations(element);

      await submit(element);
      await expectNoViolations(element);

      pending.reject(new Error(STUB_ERROR));
      await flush(element);
      expect(part(element, 'error')).not.toBeNull();
      await expectNoViolations(element);

      part(element, 'retry').click();
      await settled(element);
      await submit(element);
      expect(part(element, 'status').textContent).toContain("You're signed in.");
      await expectNoViolations(element);
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:components sign-in`
Expected: FAIL with `Failed to resolve import "./index.js"`.

- [ ] **Step 3: Write the styles**

Create `packages/api-components/src/components/sign-in/sign-in.styles.ts`:

```ts
import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  .panel {
    display: grid;
    gap: 1rem;

    /* The panel takes focus after a successful sign-in (A11Y-003), so it needs a visible ring. */
    &:focus-visible {
      outline: var(--zd-focus-outline-width) var(--zd-focus-outline-style)
        var(--zd-focus-outline-color);
      outline-offset: 2px;
    }
  }

  .heading {
    h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    ::slotted(*) {
      margin: 0;
    }
  }

  /*
   * Stays mounted in every state so a screen reader is already watching it when "Signing in…"
   * arrives (A11Y-002). Empty, it takes no room.
   */
  .status {
    margin: 0;
  }

  .form {
    display: grid;
    gap: 0.75rem;
    justify-items: start;

    /* The field takes the panel's width; the button keeps its own. */
    .email {
      justify-self: stretch;
    }
  }

  .help {
    margin: 0;
  }
`;
```

- [ ] **Step 4: Write the component**

Create `packages/api-components/src/components/sign-in/sign-in.ts`:

```ts
import {
  CharmElement,
  ZdAlert,
  ZdButton,
  ZdInput,
  ZdSpinner,
} from '@zocdoc/api-primitive-components';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { PatientAuth } from '../../client/patient-auth.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
import styles from './sign-in.styles.js';

/**
 * A sign-in finished. Deliberately empty: the token is read through `auth.getToken`, and never
 * travels on an event a page script or an extension could be listening to.
 */
export type SignInCompleteDetail = Record<string, never>;

export interface ZdSignInEventMap {
  'sign-in-complete': CustomEvent<SignInCompleteDetail>;
  'sign-in-error': CustomEvent<ErrorDetail>;
}

/** COMP-001 without `empty`: a sign-in has no empty result. */
type SignInState = 'idle' | 'loading' | 'success' | 'error';

/** The part that takes focus after the render a patient's action caused (A11Y-003). */
type FocusTarget = 'panel' | 'submit' | 'retry';

/** What the polite region says per state. Errors go to the alert instead. */
const STATUS_TEXT: Partial<Record<SignInState, string>> = {
  loading: 'Signing in…',
  success: "You're signed in.",
};

/**
 * Lets a patient sign in with their Zocdoc account, so the booking and appointment components
 * run under the patient's own token.
 *
 * **Experimental.** Zocdoc's user authentication isn't available yet, so today this runs
 * against `createMockPatientAuth()`. The real flow will be a drop-in `PatientAuth`.
 *
 * There's no password field on purpose. Zocdoc's login page is hosted by Zocdoc, and its
 * Google and Apple sign-in only work on Zocdoc's domain. A look-alike credential form on a
 * partner site would also train patients to type their Zocdoc password where phishing pages ask
 * for it. The optional email only pre-fills Zocdoc's page as `login_hint`.
 *
 * The component doesn't configure the client. The host passes `auth.getToken` to
 * `configureZocdoc` itself (COMP-002, COMP-004).
 *
 * @tag zd-sign-in
 * @slot heading - Replaces the default "Sign in to manage your appointments" heading. Slot an empty element to drop it, for example inside a dialog that has its own.
 * @event sign-in-complete - Emitted with `{}` once the patient is signed in. Read the token through `auth.getToken`.
 * @event sign-in-error - Emitted with `{ error }` when signing in, or completing a returned sign-in, fails.
 * @csspart panel - The container, and the focus target after a successful sign-in.
 * @csspart heading - The heading wrapper.
 * @csspart status - The polite live region announcing loading and success.
 * @csspart error - The alert shown when sign-in fails.
 * @csspart retry - The button in the alert that returns to the form.
 * @csspart form - The sign-in form.
 * @csspart email - The optional email field.
 * @csspart help - The line saying sign-in finishes on Zocdoc.
 * @csspart submit - The "Continue with Zocdoc" button.
 */
export class ZdSignIn extends CharmElement {
  public static override baseName = 'sign-in';

  declare public addEventListener: TypedEventTarget<ZdSignInEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdSignInEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdSignInEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdAlert, ZdButton, ZdInput, ZdSpinner];
  }

  /**
   * What signs the patient in. Required: without it the button is disabled. Setting a new one
   * starts over from idle and completes any sign-in that returned to this page.
   */
  @property({ attribute: false })
  public auth?: PatientAuth;

  /**
   * The email field's value, sent to Zocdoc as `login_hint`. Property-only so it never lands in
   * the DOM, where it would end up in a screenshot or a page cache (PHI-001). It's still sent
   * when `hide-email` is set, so a host that already knows it can pre-fill Zocdoc's page.
   */
  @property({ attribute: false })
  public email = '';

  /** Leaves out the optional email field. */
  @property({ type: Boolean, attribute: 'hide-email' })
  public hideEmail = false;

  @state() protected signInState: SignInState = 'idle';

  /** Bumped every time `auth` changes, so a late answer from an old `auth` is dropped. */
  private authToken = 0;
  private focusTarget?: FocusTarget;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('auth')) void this.resume();
  }

  protected override updated(): void {
    const target = this.focusTarget;
    if (!target) return;

    this.focusTarget = undefined;
    this.shadowRoot?.querySelector<HTMLElement>(`[part~="${target}"]`)?.focus();
  }

  /**
   * Picks up wherever the current `auth` is: already signed in, back from Zocdoc with a sign-in
   * to finish, or neither. Stays idle while completing, because the common answer is "nothing
   * to complete" and a loading flash on every page load would announce a sign-in that isn't
   * happening.
   */
  private async resume(): Promise<void> {
    const token = ++this.authToken;
    const auth = this.auth;
    this.signInState = 'idle';
    this.focusTarget = undefined;

    if (!auth) return;
    if (auth.isSignedIn()) {
      this.signInState = 'success';
      return;
    }

    try {
      const completed = await auth.completeSignIn();
      // A submit since then owns the state now.
      if (token !== this.authToken || this.signInState !== 'idle' || !completed) return;

      this.signInState = 'success';
      this.emit('sign-in-complete', { detail: {} });
    } catch (error: unknown) {
      if (token !== this.authToken || this.signInState !== 'idle') return;

      this.signInState = 'error';
      this.emit('sign-in-error', { detail: { error } });
    }
  }

  /** Starts a sign-in. Does nothing without `auth`, or unless idle, so there's never a second call. */
  protected async beginSignIn(): Promise<void> {
    const auth = this.auth;
    if (!auth || this.signInState !== 'idle') return;

    const token = this.authToken;
    this.signInState = 'loading';

    try {
      await auth.signIn({ loginHint: this.email.trim() || undefined });
      if (token !== this.authToken) return;

      this.signInState = 'success';
      this.focusTarget = 'panel';
      this.emit('sign-in-complete', { detail: {} });
    } catch (error: unknown) {
      if (token !== this.authToken) return;

      this.signInState = 'error';
      this.focusTarget = 'retry';
      this.emit('sign-in-error', { detail: { error } });
    }
  }

  protected retry(): void {
    this.signInState = 'idle';
    this.focusTarget = 'submit';
  }

  /** Mounts with its text, and its alert role announces on insertion (A11Y-002). */
  protected renderError(): unknown {
    return this.html`
      <scoped-alert part="error" variant="danger" politeness="assertive" open>
        We couldn't sign you in. Please try again.
        <scoped-button
          part="retry"
          slot="action"
          variant="secondary"
          size="small"
          @click=${() => this.retry()}
        >Try again</scoped-button>
      </scoped-alert>
    `;
  }

  /**
   * Not `novalidate`: the browser's own `type="email"` check is the only validation, and it's
   * wanted. The field isn't required.
   */
  protected renderForm(busy: boolean): unknown {
    return this.html`
      <form
        class="form"
        part="form"
        @submit=${(event: Event) => {
          event.preventDefault();
          void this.beginSignIn();
        }}
      >
        ${
          this.hideEmail
            ? nothing
            : this.html`
              <scoped-input
                class="email"
                part="email"
                type="email"
                autocomplete="email"
                ?disabled=${busy}
                .value=${this.email}
                @input=${(event: Event) => {
                  this.email = (event.target as ZdInput).value;
                }}
              ><span slot="label">Email address (optional)</span></scoped-input>
            `
        }
        <p class="help" part="help">You'll finish signing in on Zocdoc.</p>
        <scoped-button part="submit" type="submit" variant="primary" ?disabled=${busy || !this.auth}>
          ${busy ? this.html`<scoped-spinner slot="start" aria-hidden="true"></scoped-spinner>` : nothing}
          Continue with Zocdoc
        </scoped-button>
      </form>
    `;
  }

  protected override render(): unknown {
    const signInState = this.signInState;
    const busy = signInState === 'loading';

    return this.html`
      <div class="panel" part="panel" tabindex="-1">
        <div class="heading" part="heading">
          <slot name="heading"><h2>Sign in to manage your appointments</h2></slot>
        </div>
        <p class="status" part="status" role="status" aria-live="polite" aria-atomic="true">${STATUS_TEXT[signInState] ?? nothing}</p>
        ${signInState === 'error' ? this.renderError() : nothing}
        ${signInState === 'idle' || busy ? this.renderForm(busy) : nothing}
      </div>
    `;
  }
}
```

Create `packages/api-components/src/components/sign-in/index.ts`:

```ts
import { project } from '@zocdoc/api-primitive-components';
import { ZdSignIn } from './sign-in.js';

project.scope.registerComponent(ZdSignIn);

export { ZdSignIn };
export type { SignInCompleteDetail, ZdSignInEventMap } from './sign-in.js';
```

Append to both `packages/api-components/src/index.ts` and `packages/api-components/src/bundle.ts`, after the `ZdProviderSearch` export block:

```ts
export {
  ZdSignIn,
  type SignInCompleteDetail,
  type ZdSignInEventMap,
} from './components/sign-in/index.js';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test:components sign-in`
Expected: PASS, 22 tests.

If "clicking the button submits" fails, Charm's button isn't reaching the form. Check that `type="submit"` is on the `<scoped-button>` and the button sits inside the `<form>`. Don't replace the test with `requestSubmit()`, because this test exists to catch exactly that (Review Focus 3).

If the axe step reports a label violation on the email field, the slotted label isn't being associated with the input. Switch to `label="Email address (optional)"`, the way `zd-patient-form` does it, and note the deviation from I18N-001 in the commit message.

Run: `pnpm test:client bundle`
Expected: PASS. The bundle and root export the same component modules.

Run: `pnpm typecheck 2>&1 | grep -c "error TS"`
Expected: `22`.

- [ ] **Step 6: Document the events and update the skill counts**

In `AGENTS.md`, add these rows to the Component Events table, directly after `| zd-booking | availability-error | ... |`:

```markdown
| `zd-sign-in` | `sign-in-complete` | `SignInCompleteDetail` — `{}`. The token is never on an event; read it through `auth.getToken`. |
| `zd-sign-in` | `sign-in-error` | `ErrorDetail` |
```

In `.claude/skills/api-components/SKILL.md`:
- Line 8: change "Ten public components" to "Thirteen public components".
- Line 50: change "**Five of the twelve components fetch on their own:**" to "**Five of the thirteen components fetch on their own:**".
- Line 55: change "The other seven only import client *types*, never client functions" to "The other eight only import client *types*, never client functions". `zd-sign-in` imports only the `PatientAuth` type. It calls whatever object it's handed and never calls the client directly.

- [ ] **Step 7: Regenerate the manifests**

Run: `pnpm run docs:check`
Expected: it fails, listing `packages/api-components/custom-elements.json` and a new `.claude/skills/api-components/references/zd-sign-in.md`. Both are expected for a new component. Check that `references/zd-sign-in.md` lists the three properties, two events, one slot and nine parts. Then run it again after staging, and confirm it reports nothing new.

```bash
git add packages/api-components/custom-elements.json .claude/skills/api-components/references
pnpm run docs:check
```

Expected: exit 0. If other packages' generated files changed too (`packages/primitives/custom-elements.json`, the root `custom-elements.json`), check whether that drift is already on `main` first. If it is, leave those files out of this commit.

- [ ] **Step 8: Lint, format and commit**

```bash
pnpm lint
pnpm exec oxfmt packages/api-components/src/components/sign-in packages/api-components/src/index.ts packages/api-components/src/bundle.ts
git add packages/api-components/src/components/sign-in packages/api-components/src/index.ts packages/api-components/src/bundle.ts AGENTS.md .claude/skills/api-components/SKILL.md packages/api-components/custom-elements.json .claude/skills/api-components/references
git commit -m "feat(sign-in): add the experimental zd-sign-in component

Generated with AI

Co-Authored-By: Claude Code"
```

---

### Task 3: Stories, docs and final verification

**Files:**
- Create: `packages/api-components/src/components/sign-in/sign-in.stories.ts`
- Create: `packages/docs/src/content/docs/components/sign-in.mdx`. The sidebar autogenerates from this directory, so `astro.config.mjs` doesn't change.
- Modify: `packages/docs/src/content/docs/getting-started/authentication.mdx`. Add a `## Signed-in Patients` section directly before `## Security Considerations`.

**Interfaces:**
- Consumes: `createMockPatientAuth` (Task 1), `ZdSignIn` and the `hide-email` attribute (Task 2).

- [ ] **Step 1: Write the stories**

Create `packages/api-components/src/components/sign-in/sign-in.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createMockPatientAuth } from '../../client/patient-auth.js';
import type { ZdSignIn } from './sign-in.js';
import './index.js';

/**
 * Experimental, and backed by the mock: "Continue with Zocdoc" signs in at once, in memory,
 * with no network call (PHI-003). Each render builds a fresh mock, so changing a control starts
 * signed out again. The real flow would leave this page for Zocdoc's own login screen.
 */
const meta: Meta<ZdSignIn> = {
  title: 'API Components/Sign In',
  component: 'zd-sign-in',
  args: { hideEmail: false },
  render: (args) => html`
    <zd-sign-in ?hide-email=${args.hideEmail} .auth=${createMockPatientAuth()}></zd-sign-in>
  `,
};

export default meta;
type Story = StoryObj<ZdSignIn>;

/** The email is optional and only pre-fills Zocdoc's page. Try `patient@example.com`. */
export const Default: Story = {};

/** No email field: the button alone. */
export const WithoutEmail: Story = { args: { hideEmail: true } };

/** The mock with `fail: true`. The alert's wording is fixed; "Try again" goes back to the form. */
export const SignInFails: Story = {
  render: (args) => html`
    <zd-sign-in
      ?hide-email=${args.hideEmail}
      .auth=${createMockPatientAuth({ fail: true })}
    ></zd-sign-in>
  `,
};

/**
 * The modal look, built by the host: the component is inline, so wrap it in a dialog. The
 * empty `heading` slot drops the component's own heading in favour of the dialog's.
 */
export const InADialog: Story = {
  render: (args) => html`
    <zd-dialog heading="Sign in to manage your appointments" open>
      <zd-sign-in ?hide-email=${args.hideEmail} .auth=${createMockPatientAuth()}>
        <span slot="heading"></span>
      </zd-sign-in>
    </zd-dialog>
  `,
};
```

- [ ] **Step 2: Check the stories build and render**

Run: `pnpm typecheck 2>&1 | grep -c "error TS"`
Expected: `22`.

Run: `pnpm storybook:build 2>&1 | tail -5`
Expected: the build succeeds. If you can open a browser, also run `pnpm storybook` and check all four stories:
- **Default:** typing an email and pressing the button shows "You're signed in."
- **Sign In Fails:** shows the alert.
- **In A Dialog:** shows the form inside an open dialog, with one heading.

- [ ] **Step 3: Write the component docs page**

Create `packages/docs/src/content/docs/components/sign-in.mdx`:

````mdx
---
title: Sign In
description: Let a patient sign in with their Zocdoc account (experimental)
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution" title="Experimental">
  This is a placeholder until Zocdoc user authentication ships. Today it runs against
  `createMockPatientAuth()`, which signs in instantly with no network call. When the real
  `createPatientAuth({ clientId, redirectUri, environment })` arrives, swapping the factory is
  the only change your page needs.
</Aside>

The `<zd-sign-in>` component lets a patient sign in with their Zocdoc account. Once they have,
`<zd-booking>` and `<zd-appointment>` run under the patient's token instead of your
integration's. Zocdoc then makes sure only that patient can read or change what they booked.

## Usage

```html
<zd-sign-in></zd-sign-in>
```

```js
import { configureZocdoc, createMockPatientAuth } from '@zocdoc/api-components';

const auth = createMockPatientAuth(); // later: createPatientAuth({ clientId, redirectUri, environment: 'sandbox' })
configureZocdoc({ baseUrl, getToken: () => auth.getToken() });

const signIn = document.querySelector('zd-sign-in');
signIn.auth = auth;
signIn.addEventListener('sign-in-complete', () => showBooking());
```

The component doesn't configure the client and doesn't talk to the other components. Your page
passes `auth.getToken` to `configureZocdoc` and decides what to show once the patient is signed in.

## Why there's no password field

Zocdoc's login page, including Google and Apple sign-in, is hosted by Zocdoc and only works on
Zocdoc's domain. A Zocdoc-branded password form on your site would also train patients to type
their Zocdoc password into pages that look like Zocdoc's, which is what phishing relies on. So the
real flow sends the patient to Zocdoc to finish. The optional email only pre-fills that page.

## Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `auth` | — | `PatientAuth` | — | What signs the patient in. Without it the button is disabled. Setting a new one starts over. |
| `email` | — | `string` | `''` | The email field's value, sent as Zocdoc's `login_hint`. Property-only, so it never lands in the DOM. |
| `hideEmail` | `hide-email` | `boolean` | `false` | Leaves out the optional email field. |

## Events

| Event | Detail | When |
|---|---|---|
| `sign-in-complete` | `{}` | The patient is signed in. Read the token through `auth.getToken()`; it's never on an event. |
| `sign-in-error` | `{ error }` | Signing in, or finishing a sign-in that returned to the page, failed. `error` is developer-facing, so don't render or log it. |

## States

- **Idle:** the form.
- **Loading:** the button is disabled and shows a spinner, and "Signing in…" is announced.
- **Success:** "You're signed in." is announced, and the form is hidden.
- **Error:** an alert says "We couldn't sign you in. Please try again." "Try again" returns to the form.

If `auth.isSignedIn()` is already true when `auth` is set, the component starts in success
without emitting.

## Slots

| Slot | Description |
|---|---|
| `heading` | Replaces "Sign in to manage your appointments". Slot an empty element to drop it, for example inside a dialog with its own heading. |

## Accessibility

- The email field has a visible label, and every string is a DOM text node, so browser translation reaches it.
- Loading and success are announced through a polite live region. Errors use `role="alert"`.
- Focus moves to "Try again" after an error, back to the button after a retry, and to the panel after success.

## CSS Parts

`panel`, `heading`, `status`, `error`, `retry`, `form`, `email`, `help`, `submit`.
````

- [ ] **Step 4: Add the authentication guide section**

In `packages/docs/src/content/docs/getting-started/authentication.mdx`, insert this directly before `## Security Considerations`:

````mdx
## Signed-in Patients

<Aside type="caution" title="Experimental">
  Zocdoc user authentication isn't available yet. `createMockPatientAuth()` stands in for it
  today. A real `createPatientAuth({ clientId, redirectUri, environment })` will run the
  authorization code + PKCE flow, and is the only change your page will need.
</Aside>

To book and manage appointments as the patient rather than as your integration, give
[`<zd-sign-in>`](/zocdoc-api-components/components/sign-in/) a `PatientAuth` and pass its
`getToken` to the client:

```js
import { configureZocdoc, createMockPatientAuth } from '@zocdoc/api-components';

const auth = createMockPatientAuth();
configureZocdoc({ baseUrl, getToken: () => auth.getToken() });

const signIn = document.querySelector('zd-sign-in');
signIn.auth = auth;
signIn.addEventListener('sign-in-complete', () => showBooking());
```

`auth.getToken()` rejects with `ZocdocAuthError` until the patient has signed in.
````

`Aside` is already imported at the top of this file.

- [ ] **Step 5: Check the docs build**

Run: `pnpm --filter docs build 2>&1 | tail -5`
Expected: the build succeeds and the output lists `/components/sign-in/`.

- [ ] **Step 6: Run the full verification**

```bash
pnpm lint
pnpm typecheck 2>&1 | grep -c "error TS"
pnpm test 2>&1 | tail -5
pnpm run docs:check
```

Expected:
- lint is clean.
- typecheck reports `22`.
- the tests show the Task 0 baseline plus 29 passing (7 client, 22 components), with no new failures.
- `docs:check` exits 0.

- [ ] **Step 7: Commit**

```bash
pnpm exec oxfmt packages/api-components/src/components/sign-in/sign-in.stories.ts
git add packages/api-components/src/components/sign-in/sign-in.stories.ts packages/docs/src/content/docs/components/sign-in.mdx packages/docs/src/content/docs/getting-started/authentication.mdx
git commit -m "docs(sign-in): add stories and mark the component experimental

Generated with AI

Co-Authored-By: Claude Code"
```
