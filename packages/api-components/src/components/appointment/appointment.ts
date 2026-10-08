import { CharmElement, ZdAlert, ZdButton, ZdSelect } from '@zocdoc/api-primitive-components';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  CANCELLABLE_STATUSES,
  RESCHEDULABLE_STATUSES,
  cancelAppointment,
  getAppointment,
  rescheduleAppointment,
} from '../../client/appointments.js';
import { ZocdocError, ZocdocNotFoundError } from '../../client/errors.js';
import { getProviderLocation } from '../../client/provider-locations.js';
import type {
  AppointmentDetails,
  AppointmentStatus,
  CancellationReasonType,
  ProviderLocation,
} from '../../client/types.js';
import { userFacingError } from '../../utilities/error-message.js';
import { renderProviderSummary } from '../../utilities/provider-summary.js';
import summaryStyles from '../../utilities/provider-summary.styles.js';
import { displayPhone, telHref } from '../../utilities/phone.js';
import { formatAppointmentTime } from '../../utilities/provider-time.js';
import { waitingRoomHref } from '../../utilities/waiting-room.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../../utilities/request-state.js';
import {
  ZdAvailabilityPicker,
  type SlotSelectDetail,
} from '../availability-picker/availability-picker.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
import styles from './appointment.styles.js';

/** The appointment was cancelled. */
export interface AppointmentCancelDetail {
  appointmentId: string;
  status: AppointmentStatus;
}

/** The appointment moved. `startTime` is the slot the patient chose, offset included. */
export interface AppointmentRescheduleDetail {
  appointmentId: string;
  status: AppointmentStatus;
  startTime: string;
}

/**
 * A lookup, cancel or reschedule failed. `status` is set when the API answered 200 with an
 * outcome that isn't the one asked for, and then `error` is a synthetic one naming only it.
 */
export interface AppointmentErrorDetail extends ErrorDetail {
  action: 'load' | 'cancel' | 'reschedule';
  status?: AppointmentStatus;
}

export interface ZdAppointmentEventMap {
  'appointment-cancel': CustomEvent<AppointmentCancelDetail>;
  'appointment-reschedule': CustomEvent<AppointmentRescheduleDetail>;
  'appointment-error': CustomEvent<AppointmentErrorDetail>;
}

type Mode = 'view' | 'cancel' | 'reschedule';

/** The panel heading per mode. It's also the panel's accessible name. */
const HEADINGS: Record<Mode, string> = {
  view: 'Your appointment',
  cancel: 'Cancel this appointment?',
  reschedule: 'Choose a new time',
};

/** Every documented status in patient words. An undocumented one falls back below. */
const STATUS_TEXT: Record<AppointmentStatus, string> = {
  pending_booking: 'Requested. The practice still has to accept it.',
  confirmed: 'Confirmed',
  booking_failed: 'Not booked. The booking did not go through.',
  cancelled: 'Cancelled',
  no_show: 'Missed',
  pending_reschedule: 'Time change requested. The practice still has to accept it.',
  rescheduled: 'Rescheduled',
  reschedule_failed: 'The time change did not go through. Contact the practice to check your time.',
};

/** Only the reasons a patient would give. The provider-side values aren't theirs to pick. */
const CANCEL_REASONS: readonly { value: CancellationReasonType; label: string }[] = [
  { value: 'patient_no_longer_needs_appointment', label: 'I no longer need this appointment' },
  { value: 'patient_no_longer_available', label: 'I can no longer make this time' },
  { value: 'rescheduling_patient', label: 'I am booking a different time' },
];

/** A reschedule that answers 200 with anything else hasn't moved the appointment. */
const MOVED_STATUSES: ReadonlySet<AppointmentStatus> = new Set<AppointmentStatus>([
  'rescheduled',
  'pending_reschedule',
  'confirmed',
]);

/** Statuses with no visit left to join, so no waiting room to link to. */
const NO_VISIT: ReadonlySet<AppointmentStatus> = new Set<AppointmentStatus>([
  'cancelled',
  'booking_failed',
]);

/**
 * Looks up a booked appointment by ID and lets the patient cancel it or move it to a new
 * time.
 *
 * It fetches its own appointment, the way the availability picker fetches its own times, so
 * it can be the whole of a "manage your appointment" page (COMP-004). Reschedule embeds the
 * picker locked to the appointment's location, visit reason and patient type, because the
 * API moves only the time. Times for anything else would be rejected.
 *
 * Neither action retries by itself. The API doesn't document either as idempotent, so each
 * one sends at most one request at a time.
 *
 * @tag zd-appointment
 * @event appointment-cancel - Emitted with `{ appointmentId, status }` once cancelled.
 * @event appointment-reschedule - Emitted with `{ appointmentId, status, startTime }` once moved.
 * @event appointment-error - Emitted with `{ error, action, status? }` when a lookup, cancel or reschedule fails.
 * @csspart panel - The container for every mode, and the focus target on each mode change.
 * @csspart heading - The panel heading.
 * @csspart details - The list of appointment details.
 * @csspart appointment-status - The status, in patient words.
 * @csspart provider - The provider row's value: the looked-up summary, or `provider-name` as a fallback.
 * @csspart provider-summary - The looked-up provider block.
 * @csspart provider-photo - The provider's photo, unless `hide-photo` is set.
 * @csspart provider-detail - The text column beside the photo.
 * @csspart provider-name - The provider's name and credential.
 * @csspart provider-specialty - The provider's first specialty.
 * @csspart provider-location - The address, or "Video visit".
 * @csspart when - The appointment's date and time, in the provider's zone.
 * @csspart reference - The confirmation number.
 * @csspart waiting-room - The link to a video visit's waiting room.
 * @csspart phone - The practice's phone number, as a `tel:` link.
 * @csspart notice - The polite live region announcing a completed action.
 * @csspart action-error - The alert shown when an action fails.
 * @csspart actions - The row of action buttons.
 * @csspart reschedule - The "Change time" button.
 * @csspart cancel - The "Cancel appointment" button.
 * @csspart cancel-form - The cancel confirmation form.
 * @csspart reason - The cancellation reason select.
 * @csspart confirm-cancel - The button that sends the cancel.
 * @csspart keep - The button that backs out of cancelling.
 * @csspart picker - The embedded availability picker.
 * @csspart confirm-reschedule - The button that sends the new time.
 * @csspart back - The button that backs out of rescheduling.
 */
export class ZdAppointment extends CharmElement {
  public static override baseName = 'appointment';

  declare public addEventListener: TypedEventTarget<ZdAppointmentEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdAppointmentEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdAppointmentEventMap>;

  public static override styles = [
    ...super.styles,
    summaryStyles,
    styles,
  ] as typeof CharmElement.styles;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [...requestStateDependencies, ZdAlert, ZdButton, ZdSelect, ZdAvailabilityPicker];
  }

  /** The appointment to load. Changing it reloads. */
  @property({ attribute: 'appointment-id' })
  public appointmentId?: string;

  /**
   * Who the appointment is with, shown until the provider lookup succeeds and kept if it fails.
   * The component looks the provider up itself, so this is optional.
   */
  @property({ attribute: 'provider-name' })
  public providerName?: string;

  /** Leaves the provider's photo out, as on `zd-provider-card`. */
  @property({ type: Boolean, attribute: 'hide-photo' })
  public hidePhoto = false;

  @state() protected requestState: RequestState = 'idle';
  @state() protected errorMessage?: string;
  @state() protected appointment?: AppointmentDetails;
  @state() protected mode: Mode = 'view';
  @state() protected busy = false;
  @state() protected notice?: string;
  @state() protected actionError?: string;
  @state() protected reasonType?: CancellationReasonType;
  @state() protected newStartTime?: string;
  @state() protected providerLocation?: ProviderLocation;

  /** Bumped by every load, so a late answer for an older ID is dropped. */
  private loadToken = 0;
  private renderedMode?: Mode;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('appointmentId')) void this.load();
  }

  /**
   * Moves focus to the panel on a mode change (A11Y-003). Not on first paint: focus belongs
   * to the host page until the patient does something.
   */
  protected override updated(): void {
    const previous = this.renderedMode;
    this.renderedMode = this.mode;

    if (!previous || previous === this.mode) return;
    this.shadowRoot?.querySelector<HTMLElement>('[part="panel"]')?.focus();
  }

  /** Fetches the appointment. Safe to call repeatedly. Stays idle without an ID. */
  public async load(): Promise<void> {
    const token = ++this.loadToken;
    const id = this.appointmentId?.trim();

    this.mode = 'view';
    this.busy = false;
    this.notice = undefined;
    this.actionError = undefined;
    this.reasonType = undefined;
    this.newStartTime = undefined;
    this.providerLocation = undefined;

    if (!id) {
      this.appointment = undefined;
      this.requestState = 'idle';
      return;
    }

    this.requestState = 'loading';
    this.errorMessage = undefined;

    try {
      const appointment = await getAppointment(id);
      if (token !== this.loadToken) return;

      this.appointment = appointment;
      this.requestState = 'success';
      void this.loadProvider(token, appointment.provider_location_id);
    } catch (error: unknown) {
      if (token !== this.loadToken) return;

      this.appointment = undefined;
      this.requestState = 'error';
      this.errorMessage =
        error instanceof ZocdocNotFoundError
          ? 'We could not find this appointment. Check the confirmation number and try again.'
          : userFacingError(error);
      this.emit('appointment-error', { detail: { error, action: 'load' } });
    }
  }

  /**
   * Cancels the loaded appointment. Public so a host page can drive it. Returns without a
   * request while another action is in flight.
   */
  public async cancel(reasonType?: CancellationReasonType): Promise<void> {
    const appointment = this.appointment;
    if (this.busy || !appointment) return;

    const token = this.loadToken;
    this.busy = true;
    this.actionError = undefined;

    try {
      const result = await cancelAppointment({
        appointmentId: appointment.appointment_id,
        ...(reasonType === undefined ? {} : { reasonType }),
      });

      if (result.appointment_status !== 'cancelled') {
        this.emit('appointment-error', {
          detail: {
            error: new Error(`Appointment status: ${result.appointment_status}`),
            action: 'cancel',
            status: result.appointment_status,
          },
        });
        if (token !== this.loadToken) return;

        this.actionError = 'This appointment could not be cancelled. Please contact the practice.';
        return;
      }

      this.emit('appointment-cancel', {
        detail: { appointmentId: result.appointment_id, status: result.appointment_status },
      });
      if (token !== this.loadToken) return;

      this.appointment = { ...appointment, appointment_status: result.appointment_status };
      this.mode = 'view';
      this.reasonType = undefined;
      this.notice = 'Your appointment is cancelled.';
    } catch (error: unknown) {
      this.emit('appointment-error', { detail: { error, action: 'cancel' } });
      if (token !== this.loadToken) return;

      if (error instanceof ZocdocError && error.status === 409) {
        // Its status changed elsewhere. Show the real one rather than the stale one.
        await this.refresh(token);
        if (token !== this.loadToken) return;
        this.actionError =
          'This appointment can no longer be cancelled. Its current status is shown.';
      } else {
        this.actionError = userFacingError(error);
      }
    } finally {
      if (token === this.loadToken) this.busy = false;
    }
  }

  /**
   * Refetches without leaving `success`, so the panel stays mounted and keeps focus (A11Y-003).
   * A failed refetch keeps what is shown and emits nothing: the caller already reported the error.
   */
  private async refresh(token: number): Promise<void> {
    const id = this.appointment?.appointment_id;
    if (!id) return;

    try {
      const appointment = await getAppointment(id);
      if (token !== this.loadToken) return;

      this.appointment = appointment;
      this.mode = 'view';
      this.reasonType = undefined;
      if (appointment.provider_location_id !== this.providerLocation?.provider_location_id) {
        void this.loadProvider(token, appointment.provider_location_id);
      }
    } catch {
      // Keep the current appointment.
    }
  }

  /**
   * Fills in the provider row. Secondary to the appointment, so it is quiet: a failure keeps the
   * `provider-name` fallback and emits nothing. A host acting on `appointment-error` would show a
   * failure while the appointment is on screen and correct.
   */
  private async loadProvider(token: number, providerLocationId: string | undefined): Promise<void> {
    if (!providerLocationId) return;

    try {
      const location = await getProviderLocation(providerLocationId);
      if (token !== this.loadToken) return;
      this.providerLocation = location;
    } catch {
      // Keep the fallback.
    }
  }

  /**
   * Moves the loaded appointment to `startTime`, which must be a slot from its own
   * location, visit reason and patient type. Returns without a request while another
   * action is in flight.
   */
  public async reschedule(startTime: string): Promise<void> {
    const appointment = this.appointment;
    if (this.busy || !appointment) return;

    const token = this.loadToken;
    this.busy = true;
    this.actionError = undefined;

    try {
      const result = await rescheduleAppointment({
        appointmentId: appointment.appointment_id,
        startTime,
      });

      if (!MOVED_STATUSES.has(result.appointment_status)) {
        this.emit('appointment-error', {
          detail: {
            error: new Error(`Appointment status: ${result.appointment_status}`),
            action: 'reschedule',
            status: result.appointment_status,
          },
        });
        if (token !== this.loadToken) return;

        // Stays on the picker: the likeliest fix is another time.
        this.actionError = 'The new time could not be booked. Try choosing another time.';
        return;
      }

      this.emit('appointment-reschedule', {
        detail: {
          appointmentId: result.appointment_id,
          status: result.appointment_status,
          startTime,
        },
      });
      if (token !== this.loadToken) return;

      this.appointment = {
        ...appointment,
        appointment_status: result.appointment_status,
        start_time: startTime,
      };
      this.mode = 'view';
      this.newStartTime = undefined;
      this.notice =
        result.appointment_status === 'pending_reschedule'
          ? 'Your change was sent. The practice still has to accept the new time.'
          : 'Your appointment has a new time.';
    } catch (error: unknown) {
      this.emit('appointment-error', { detail: { error, action: 'reschedule' } });
      if (token !== this.loadToken) return;

      this.actionError = userFacingError(error);
    } finally {
      if (token === this.loadToken) this.busy = false;
    }
  }

  protected setMode(mode: Mode): void {
    this.mode = mode;
    this.actionError = undefined;
    this.notice = undefined;
    if (mode !== 'reschedule') this.newStartTime = undefined;
  }

  /** `booking_failed` is cancellable per the spec, but there's nothing for a patient to cancel. */
  protected canCancel(appointment: AppointmentDetails): boolean {
    const status = appointment.appointment_status;
    return CANCELLABLE_STATUSES.has(status) && status !== 'booking_failed';
  }

  /** Reschedule keeps the original patient type. If the lookup omits it, don't guess. */
  protected canReschedule(appointment: AppointmentDetails): boolean {
    return (
      RESCHEDULABLE_STATUSES.has(appointment.appointment_status) &&
      Boolean(appointment.patient_type)
    );
  }

  protected renderDetails(appointment: AppointmentDetails): unknown {
    const when = formatAppointmentTime(appointment.start_time);
    const status =
      STATUS_TEXT[appointment.appointment_status] ??
      'Contact the practice to check this appointment.';

    return this.html`
      <dl class="details" part="details">
        <div><dt>Status</dt><dd part="appointment-status">${status}</dd></div>
        ${this.renderProvider()}
        ${when ? this.html`<div><dt>When</dt><dd part="when">${when}</dd></div>` : nothing}
        ${this.renderWaitingRoom(appointment)}
        <div><dt>Confirmation number</dt><dd part="reference">${appointment.appointment_id}</dd></div>
        ${this.renderPhone(appointment)}
      </dl>
    `;
  }

  /*
   * Only while there is still a visit to join: a cancelled or failed booking keeps its
   * `waiting_room_path`, and a link into it would read as an appointment that still stands.
   * A new tab, and saying so, so this page is still here when the patient comes back.
   */
  protected renderWaitingRoom(appointment: AppointmentDetails): unknown {
    if (NO_VISIT.has(appointment.appointment_status)) return nothing;

    const href = waitingRoomHref(appointment.waiting_room_path);
    if (!href) return nothing;

    return this
      .html`<div><dt>Video visit</dt><dd><a part="waiting-room" href=${href} target="_blank" rel="noopener noreferrer">Join your video visit (opens in a new tab)</a></dd></div>`;
  }

  /*
   * Kept whatever the status, because the practice is who a patient calls about a cancelled
   * or failed booking too.
   */
  protected renderPhone(appointment: AppointmentDetails): unknown {
    const number = appointment.location_phone_number;
    const href = telHref(number, appointment.location_phone_extension);
    if (!href || !number) return nothing;

    return this
      .html`<div><dt>Practice phone</dt><dd><a part="phone" href=${href}>${displayPhone(number, appointment.location_phone_extension)}</a></dd></div>`;
  }

  protected renderProvider(): unknown {
    const location = this.providerLocation;
    if (location) {
      return this
        .html`<div><dt>Provider</dt><dd part="provider">${renderProviderSummary(location, { hidePhoto: this.hidePhoto, hideDistance: true })}</dd></div>`;
    }
    return this.providerName
      ? this.html`<div><dt>Provider</dt><dd part="provider">${this.providerName}</dd></div>`
      : nothing;
  }

  protected renderActions(appointment: AppointmentDetails): unknown {
    const canMove = this.canReschedule(appointment);
    const canCancel = this.canCancel(appointment);
    if (!canMove && !canCancel) return nothing;

    return this.html`
      <div class="actions" part="actions">
        ${canMove ? this.html`<scoped-button part="reschedule" variant="primary" @click=${() => this.setMode('reschedule')}>Change time</scoped-button>` : nothing}
        ${canCancel ? this.html`<scoped-button part="cancel" variant="secondary" @click=${() => this.setMode('cancel')}>Cancel appointment</scoped-button>` : nothing}
      </div>
    `;
  }

  protected renderCancel(): unknown {
    return this.html`
      <form
        class="cancel-form"
        part="cancel-form"
        @submit=${(event: Event) => {
          event.preventDefault();
          void this.cancel(this.reasonType);
        }}
      >
        <scoped-select
          part="reason"
          label="Reason (optional)"
          .value=${this.reasonType ?? ''}
          @change=${(event: Event) => {
            const value = (event.target as ZdSelect).value;
            this.reasonType = value ? (value as CancellationReasonType) : undefined;
          }}
        >
          <option value="" .selected=${!this.reasonType}>Choose a reason…</option>
          ${CANCEL_REASONS.map(
            (reason) =>
              this
                .html`<option value=${reason.value} .selected=${this.reasonType === reason.value}>${reason.label}</option>`
          )}
        </scoped-select>
        <div class="actions">
          <scoped-button part="confirm-cancel" type="submit" variant="destructive" ?disabled=${this.busy}>Cancel appointment</scoped-button>
          <scoped-button part="keep" type="button" ?disabled=${this.busy} @click=${() => this.setMode('view')}>Keep appointment</scoped-button>
        </div>
      </form>
    `;
  }

  protected renderReschedule(appointment: AppointmentDetails): unknown {
    const startTime = this.newStartTime;

    return this.html`
      <scoped-availability-picker
        part="picker"
        .providerLocationId=${appointment.provider_location_id}
        .visitReasonId=${appointment.visit_reason_id}
        .patientType=${appointment.patient_type ?? 'new'}
        .hidePatientType=${true}
        .selectedStartTime=${startTime}
        @slot-select=${(event: CustomEvent<SlotSelectDetail>) => {
          this.newStartTime = event.detail.startTime;
        }}
      ></scoped-availability-picker>
      <div class="actions">
        <scoped-button
          part="confirm-reschedule"
          variant="primary"
          ?disabled=${!startTime || this.busy}
          @click=${() => {
            if (startTime) void this.reschedule(startTime);
          }}
        >Confirm new time</scoped-button>
        <scoped-button part="back" ?disabled=${this.busy} @click=${() => this.setMode('view')}>Back</scoped-button>
      </div>
    `;
  }

  /**
   * `notice` stays mounted for the panel's lifetime, so its text change is announced
   * (A11Y-002). `action-error` mounts with its text, and its alert role announces on insertion.
   */
  protected renderPanel(): unknown {
    const appointment = this.appointment;
    if (!appointment) return nothing;

    let body: unknown;
    if (this.mode === 'cancel') body = this.renderCancel();
    else if (this.mode === 'reschedule') body = this.renderReschedule(appointment);
    else body = this.renderActions(appointment);

    return this.html`
      <section class="panel" part="panel" tabindex="-1" aria-labelledby="panel-heading">
        <h2 class="heading" part="heading" id="panel-heading">${HEADINGS[this.mode]}</h2>
        ${this.renderDetails(appointment)}
        <p class="notice" part="notice" role="status">${this.notice ?? nothing}</p>
        ${this.actionError ? this.html`<scoped-alert part="action-error" variant="danger" politeness="assertive" open>${this.actionError}</scoped-alert>` : nothing}
        ${body}
      </section>
    `;
  }

  protected override render(): unknown {
    // `empty` can't happen for a lookup by ID (a missing one is a 404, so `error`), but the
    // helper takes the message regardless.
    return this.html`${renderRequestState(this.requestState, {
      emptyMessage: 'We could not find this appointment.',
      errorMessage: this.errorMessage,
      loadingMessage: 'Loading your appointment…',
      onRetry: () => void this.load(),
      children: () => this.renderPanel(),
    })}`;
  }
}
