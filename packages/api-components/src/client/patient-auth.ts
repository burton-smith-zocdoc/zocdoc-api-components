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
