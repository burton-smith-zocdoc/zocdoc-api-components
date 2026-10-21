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
// Re-exported because the generated framework types import every event payload from this module.
export type { ErrorDetail } from '../events.js';
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

  /** Bumped when `auth` changes or an attempt is abandoned, so a late answer from either is dropped. */
  private authToken = 0;
  private focusTarget?: FocusTarget;

  public override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('pageshow', this.handlePageShow);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('pageshow', this.handlePageShow);
  }

  /**
   * The real `signIn` navigates to Zocdoc and never resolves. If the patient comes Back, the
   * browser can restore this page from its back/forward cache exactly as it was left: loading,
   * with the button disabled and no way out. Drop that attempt and show the form again.
   */
  private readonly handlePageShow = (event: PageTransitionEvent): void => {
    if (!event.persisted || this.signInState !== 'loading') return;

    this.authToken++;
    this.signInState = 'idle';
  };

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('auth')) void this.resume();
  }

  protected override updated(): void {
    const target = this.focusTarget;
    if (!target) return;

    this.focusTarget = undefined;
    void this.focusPart(target);
  }

  /**
   * The retry and submit buttons are Charm elements created by the render that just finished,
   * and they delegate focus to a control in their own shadow root that doesn't exist until
   * they've rendered too. So wait for the part's own update before focusing it.
   */
  private async focusPart(target: FocusTarget): Promise<void> {
    const element = this.shadowRoot?.querySelector<HTMLElement>(`[part~="${target}"]`);
    if (element instanceof CharmElement) await element.updateComplete;
    element?.focus();
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
