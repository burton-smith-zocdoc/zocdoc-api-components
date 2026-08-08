import { ZocdocAuthError, ZocdocNotFoundError } from '../../client/errors.js';

/**
 * Maps a thrown client error onto copy a patient can read.
 *
 * The client's `Error.message` is documented as developer-facing, and `body` can echo a
 * submitted field value, so neither may reach the DOM (CLIENT-003) or a log (PHI-001).
 * This function is the only place that decides what a user sees, which is why every
 * component's error state routes through it rather than reading `error.message`.
 *
 * Note the 401 wording. An expired token is the library's problem, not the patient's, so
 * it reads as a temporary connection failure — telling someone their host page's access
 * token expired invites them to retry in a way that cannot succeed, and names an internal
 * mechanism they have no control over.
 */
export function userFacingError(error: unknown): string {
  if (error instanceof ZocdocAuthError) {
    return 'We could not reach Zocdoc. Please try again in a few minutes.';
  }

  if (error instanceof ZocdocNotFoundError) {
    return 'We could not find what you were looking for.';
  }

  return 'Something went wrong. Please try again.';
}
