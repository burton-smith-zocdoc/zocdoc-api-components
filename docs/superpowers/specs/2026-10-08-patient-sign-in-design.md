# Patient Sign-In (`<zd-sign-in>`) Design

**Status:** experimental placeholder. Zocdoc user authentication (authorization code + PKCE) is
expected within days; we don't yet have an SPA client ID. This ships the component and its seam
now, backed by a mock, so the real flow can drop in without changing the component.

## Goal

Let a patient sign in with their Zocdoc account from a partner site, so that `<zd-booking>` and
`<zd-appointment>` run under the **patient's** token rather than the integrator's
`client_credentials` token. Under a patient token, Zocdoc enforces that an appointment booked by
a user can only be read or changed by that user.

Success for this iteration:

- A host page can place `<zd-sign-in>`, wire it to `configureZocdoc`, and build the booking and
  appointment flows around it today, against the mock.
- When credentials arrive, swapping `createMockPatientAuth()` for `createPatientAuth({...})` is
  the only host-side change.

## Why not reproduce Zocdoc's login modal

Zocdoc's login screen (email, Continue, Google, Apple) is hosted by Zocdoc at `/authorize`. A
partner site can't run it:

- Google and Apple sign-in are registered to Zocdoc's domain.
- A Zocdoc-branded credential screen on another domain trains patients to type Zocdoc credentials
  into look-alikes, which is the pattern phishing relies on and defeats the point of PKCE.

The email field survives as `login_hint`: we collect it, and Zocdoc's page opens pre-filled.

## What we know about the real flow

From Zocdoc's authentication guide, as summarized during research on 2026-10-08. Check these
against the guide when implementing `createPatientAuth`:

| | Sandbox | Production |
|---|---|---|
| Authorize | `https://auth-api-developer-sandbox.zocdoc.com/authorize` | `https://auth.zocdoc.com/authorize` |
| Token | `https://auth-api-developer-sandbox.zocdoc.com/oauth/token` | `https://auth.zocdoc.com/oauth/token` |
| `audience` | `DeveloperApiPatient-Sandbox` | `DeveloperApiPatient` |

- Authorize params: `response_type=code`, `client_id`, `redirect_uri`, `scope`, `state`,
  `code_challenge`, `code_challenge_method=S256` (`plain` isn't accepted). Optional:
  `login_hint`, `anonymous_token`.
- Scopes: `external.appointment.read external.appointment.write`, plus `offline_access` for a
  refresh token.
- Code exchange and refresh: JSON body to the token endpoint, no secret.
- Lifetimes: access token 60 min; refresh token 15 days idle / 30 days max.
- Not documented: redirect URI registration, browser CORS on the token endpoint, logout.

## Architecture

### The seam: `PatientAuth`

`packages/api-components/src/client/patient-auth.ts`:

```ts
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

export function createMockPatientAuth(options?: MockPatientAuthOptions): PatientAuth;
```

The seam lives in `client/`, not in the component, because the token is a client concern
(CLIENT-002) and the host needs `getToken` without the element.

**Mock behaviour.**
- `signIn` resolves on a microtask, sets signed-in state, and ignores `loginHint`.
- `completeSignIn` resolves `false`.
- `getToken` resolves `'mock-patient-token-not-a-credential'` when signed in, and rejects with
  `ZocdocAuthError` otherwise.
- It makes no network calls (PHI-003). State lives in memory only.

**Real implementation (not in this iteration).**
- `createPatientAuth({ clientId, redirectUri, environment, scopes? })` implements the flow above.
- PKCE values and `state` go in `sessionStorage` until the callback, then are removed.
- Its interface and the component's contract don't change.

### Component: `<zd-sign-in>`

`packages/api-components/src/components/sign-in/`. It extends `CharmElement` and registers
through `project.scope.registerComponent` with `baseName = 'sign-in'` (PBZD-002, PBZD-004).

**Properties.**

| Property | Attribute | Type | Notes |
|---|---|---|---|
| `auth` | — | `PatientAuth \| undefined` | Required to sign in. Without it the button is disabled. |
| `email` | — (`attribute: false`) | `string` | The field's value. PII stays out of the DOM. |
| `hideEmail` | `hide-email` | `boolean` | Hides the optional email field. |

**Markup.** Inline, not a modal. A host wanting the modal look wraps it in `<scoped-dialog>`.

- `heading` slot, defaulting to "Sign in to manage your appointments".
- `<scoped-input type="email" autocomplete="email">` with a visible label "Email address
  (optional)". It's not required, and it has no validation beyond the browser's `type="email"`.
- A primary `<scoped-button>` labelled "Continue with Zocdoc".
- Helper text: "You'll finish signing in on Zocdoc." All text is in DOM text nodes (I18N-001).

**State machine (COMP-001).** `idle | loading | success | error`. There's no `empty`, because
sign-in has no empty result.

- `idle`: the form.
- `loading`: the button is disabled and shows a spinner, and an `aria-live="polite"` region says
  "Signing in…".
- `success`: "You're signed in." in the live region, and the form is hidden.
- `error`: `role="alert"` with a fixed message, "We couldn't sign you in. Please try again.", and
  a retry button that goes back to `idle`. It never renders `error.message` (CLIENT-003).

**Behaviour.**
- On connect, if `auth` is set, call `auth.completeSignIn()`. `true` goes to `success` and emits
  `sign-in-complete`. `false` stays `idle`.
- If `auth.isSignedIn()` is already true on connect, start in `success` without emitting.
- On submit, call `auth.signIn({ loginHint: email.trim() || undefined })`. Resolving goes to
  `success` and emits. Rejecting goes to `error` and emits `sign-in-error`.
- Double submit: a submit while `loading` does nothing, so there's never a second
  `signIn` call.
- Setting `auth` to a new object resets to `idle` and runs the connect logic again.

**Events (COMP-003)**, added to `ZdSignInEventMap` and to the `AGENTS.md` event table:

| Event | Detail |
|---|---|
| `sign-in-complete` | `{}`. The token is never in an event; the host reads it via `auth.getToken`. |
| `sign-in-error` | `ErrorDetail` |

The email never appears in an event detail, attribute, log, or error (PHI-001).

**Styles.** CSS nesting and logical properties (STYLE-001, I18N-003). Parts: `form`,
`email`, `submit`, `status`.

### Host wiring

```js
import { configureZocdoc, createMockPatientAuth } from '@zocdoc/api-components';

const auth = createMockPatientAuth(); // later: createPatientAuth({ clientId, redirectUri, environment: 'sandbox' })
configureZocdoc({ baseUrl, getToken: () => auth.getToken() });

const signIn = document.querySelector('zd-sign-in');
signIn.auth = auth;
signIn.addEventListener('sign-in-complete', () => showBooking());
```

`<zd-sign-in>` doesn't configure the client and doesn't talk to the other components (COMP-002,
COMP-004).

## Testing

- **Client project (node):** `createMockPatientAuth`.
  - `getToken` rejects before sign-in and resolves after.
  - `fail` makes `signIn` reject.
  - `completeSignIn` resolves `false`.
  - No `fetch` call happens at any point.
- **Components project (browser)**, with a stub `PatientAuth` (TEST-002):
  - The email passes through as `loginHint`, trimmed, and as `undefined` when blank.
  - Each state transition and its events.
  - Two quick submits make exactly one `signIn` call.
  - `completeSignIn() === true` on connect emits `sign-in-complete`.
  - Already signed in on connect gives `success` with no event.
  - The email never appears in the element's attributes or in any event detail.
  - The error state has `role="alert"` and never shows the stub's error message.
  - The button is disabled without `auth`.
  - axe passes in idle, loading, success, and error (A11Y-005).
- Test emails use `@example.com` (PHI-002, RFC 2606).

## Docs and stories

- `packages/docs/src/content/docs/components/sign-in.mdx`, marked **experimental**: a
  placeholder until Zocdoc user auth ships.
- `getting-started/authentication.mdx`: a "Signed-in patients" section with the host-wiring
  snippet, and a note that the real factory is coming.
- Stories: default, without email, error (`fail: true`), and inside `<scoped-dialog>`.
- Export `createMockPatientAuth`, the `PatientAuth` types, and `ZdSignIn` from the barrel.
- Regenerate `custom-elements.json` with `pnpm run cem`.

## Out of scope

- `createPatientAuth`, the real PKCE flow. It waits for SPA credentials and answers to the
  open questions in the Zocdoc request.
- Sign-out. Zocdoc hasn't documented logout, so a local-only sign-out would leave the Zocdoc
  session alive and mislead the patient.
- `anonymous_token` linking.
- Demo site changes.
