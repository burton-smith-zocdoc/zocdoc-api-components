import { describe, expect, it } from 'vitest';
import { ZocdocAuthError, ZocdocError, ZocdocNotFoundError } from '../../../client/errors.js';
import { userFacingError } from '../error-message.js';

describe('userFacingError', () => {
  it('words an expired token as a temporary connection failure', () => {
    expect(userFacingError(new ZocdocAuthError())).toBe(
      'We could not reach Zocdoc. Please try again in a few minutes.'
    );
  });

  it('words a 404 as a missing resource', () => {
    expect(userFacingError(new ZocdocNotFoundError())).toBe(
      'We could not find what you were looking for.'
    );
  });

  it('falls back to generic copy for any other status', () => {
    expect(userFacingError(new ZocdocError('Zocdoc API request failed with 500.', 500))).toBe(
      'Something went wrong. Please try again.'
    );
  });

  it('falls back to generic copy for a value that is not an Error', () => {
    expect(userFacingError('kaboom')).toBe('Something went wrong. Please try again.');
  });

  // CLIENT-003 and PHI-001. A 400 from this API carries `errors[].message` strings that can
  // echo a submitted field value, so neither the developer-facing message nor the response
  // body may survive the mapping. Asserting on the exact leaked strings is what makes this
  // test fail if someone "improves" the copy by appending `error.message`.
  it('never leaks the developer-facing message or the response body', () => {
    const error = new ZocdocError('Zocdoc API request failed with 400.', 400, 'BAD_REQUEST', {
      errors: [{ message: 'insurance_member_id AB1234567 is not valid' }],
    });

    const message = userFacingError(error);

    expect(message).not.toContain('400');
    expect(message).not.toContain('AB1234567');
    expect(message).not.toContain('insurance_member_id');
  });
});
