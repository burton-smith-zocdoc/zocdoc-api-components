/**
 * Typed errors, so a component can tell an expired token apart from a genuine
 * failure and word the two differently.
 *
 * `message` is developer-facing and deliberately generic: it names the status
 * and nothing else. The upstream response is kept on `body` for debugging, but
 * a 400 from this API carries `errors[].message` strings that may echo a
 * submitted field value, so `body` must never be rendered to a user
 * (CLIENT-003) and must never be logged (PHI-001).
 */
export class ZocdocError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;
  public readonly body: unknown;

  public constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message);
    this.name = 'ZocdocError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/**
 * 401 specifically. Access tokens last 60 minutes, so an expired token is the
 * most common failure and deserves a different message from "no results".
 */
export class ZocdocAuthError extends ZocdocError {
  public constructor(body?: unknown) {
    super('Zocdoc API rejected the access token. It may have expired.', 401, 'AUTH_ERROR', body);
    this.name = 'ZocdocAuthError';
  }
}

/**
 * 404. Distinct from an empty result set: asking for a plan that does not exist
 * is an error, whereas a search that matches nothing is a successful empty
 * response (COMP-001 keeps those two states separate).
 */
export class ZocdocNotFoundError extends ZocdocError {
  public constructor(body?: unknown) {
    super('The requested Zocdoc resource does not exist.', 404, 'NOT_FOUND', body);
    this.name = 'ZocdocNotFoundError';
  }
}

/** Maps a non-2xx status onto the hierarchy above. */
export function mapError(status: number, body: unknown): ZocdocError {
  if (status === 401) {
    return new ZocdocAuthError(body);
  }
  if (status === 404) {
    return new ZocdocNotFoundError(body);
  }
  return new ZocdocError(`Zocdoc API request failed with ${status}.`, status, undefined, body);
}
