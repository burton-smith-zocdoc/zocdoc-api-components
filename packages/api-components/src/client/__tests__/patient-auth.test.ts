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

    await expect(auth.signIn()).rejects.toThrow('Mock sign-in failed.');
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
