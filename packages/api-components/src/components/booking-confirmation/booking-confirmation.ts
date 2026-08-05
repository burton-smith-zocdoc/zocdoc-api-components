import { CharmElement, ZdAlert } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { AppointmentStatus } from '../../client/types.js';
import { formatAppointmentTime } from '../internal/provider-time.js';
import styles from './booking-confirmation.styles.js';

/**
 * How each booking outcome is worded and coloured.
 *
 * `POST /v1/appointments` succeeding does not mean the appointment is confirmed: a practice
 * on manual confirmation returns `pending_booking`, which is a success the patient has to
 * hear differently. Telling someone their appointment is confirmed when the practice has yet
 * to accept it is the kind of wrong that makes them not show up somewhere else instead, so
 * the status decides the sentence rather than the component assuming the happy one.
 *
 * Partial on purpose. This component is the *result of a booking attempt that worked*; the
 * statuses missing here — `cancelled`, `booking_failed`, the reschedule pair — belong to the
 * flow's error state (COMP-001), which owns retrying. Rendering nothing for them is safer
 * than dressing a failure as a confirmation.
 */
const OUTCOMES: Partial<
  Record<
    AppointmentStatus,
    { readonly variant: 'success' | 'info'; readonly heading: string; readonly detail?: string }
  >
> = {
  confirmed: {
    variant: 'success',
    heading: 'Your appointment is confirmed.',
  },
  pending_booking: {
    variant: 'info',
    heading: 'Your appointment request was sent.',
    detail: 'The practice still has to accept it, and will contact you to confirm.',
  },
};

/**
 * Renders the outcome of a booking. Presentational only — it fetches nothing, so it has no
 * request state and needs no token.
 *
 * Everything it shows arrives as an attribute, which is what lets a host page put it on a
 * standalone confirmation page as plain markup rather than only at the end of a flow
 * (COMP-004). It emits nothing: there is nothing left to decide.
 *
 * @tag zd-booking-confirmation
 * @csspart confirmation - The alert wrapping the whole confirmation.
 * @csspart detail - The line qualifying a pending request.
 * @csspart provider - The line naming the provider.
 * @csspart when - The appointment's date and time.
 * @csspart reference - The line carrying the confirmation number.
 */
export class ZdBookingConfirmation extends CharmElement {
  public static override baseName = 'booking-confirmation';

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdAlert];
  }

  /** The booked appointment's id, which is the number a patient quotes to the practice. */
  @property({ attribute: 'appointment-id' })
  public appointmentId?: string;

  /**
   * The appointment's start, as the API returned it — offset included, unmodified. The
   * offset is the provider's, and is what makes the displayed time theirs.
   */
  @property({ attribute: 'start-time' })
  public startTime?: string;

  /**
   * The `appointment_status` from the booking response. Defaults to `confirmed` because a
   * host page rendering this component by hand has already decided the booking worked; a
   * flow passing the API's own value through gets the pending wording for free.
   */
  @property()
  public status: AppointmentStatus = 'confirmed';

  /** Who the appointment is with. Omitted rather than guessed at when absent. */
  @property({ attribute: 'provider-name' })
  public providerName?: string;

  protected override render(): unknown {
    const outcome = this.appointmentId ? OUTCOMES[this.status] : undefined;
    if (!outcome) return nothing;

    const when = formatAppointmentTime(this.startTime);

    /*
     * No `role` on the alert: Charm renders the role and `aria-live` on an element inside
     * its own shadow root, derived from `politeness`. Adding one out here would nest a
     * second live region around the same text (A11Y-002).
     *
     * `polite` rather than `assertive`, and stated rather than left to Charm's default. The
     * patient pressed a button and is waiting for this; there is nothing to interrupt.
     */
    return this.html`
      <scoped-alert
        part="confirmation"
        variant=${outcome.variant}
        heading=${outcome.heading}
        politeness="polite"
        open
      >
        ${outcome.detail ? this.html`<p part="detail">${outcome.detail}</p>` : nothing}
        ${this.providerName ? this.html`<p part="provider">With ${this.providerName}</p>` : nothing}
        ${when ? this.html`<p part="when">${when}</p>` : nothing}
        <p part="reference">Confirmation number: ${this.appointmentId}</p>
      </scoped-alert>
    `;
  }
}
