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
function deferred(): {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
} {
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

async function mountWith(
  auth?: PatientAuth,
  markup = '<zd-sign-in></zd-sign-in>'
): Promise<ZdSignIn> {
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
  const own =
    root instanceof Element ? [...root.attributes].map((attribute) => attribute.value) : [];
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

      // A pointer or Enter lands on Charm's inner control, which is what calls requestSubmit().
      // Clicking the host would skip it.
      part(element, 'submit')
        .shadowRoot!.querySelector<HTMLElement>('[part="button-control"]')!
        .click();
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
