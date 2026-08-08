import { CharmElement, ZdButton } from '@powered-by-zocdoc/primitives';
import { nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createAppointment } from '../../client/appointments.js';
import { getAvailability } from '../../client/availability.js';
import { DEFAULT_PAGE_SIZE } from '../../client/provider-locations.js';
import type {
  AppointmentResponseData,
  AppointmentStatus,
  Patient,
  PatientType,
  ProviderLocation,
  ProviderLocationAvailability,
} from '../../client/types.js';
import { ZdAvailabilityPicker } from '../availability-picker/availability-picker.js';
import { ZdBookingConfirmation } from '../booking-confirmation/booking-confirmation.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
import { resolveWindowStart, windowEndDate } from '../../utilities/availability-window.js';
import { userFacingError } from '../../utilities/error-message.js';
import { providerHeading, renderProviderSummary } from '../../utilities/provider-summary.js';
import summaryStyles from '../../utilities/provider-summary.styles.js';
import { formatAppointmentTime } from '../../utilities/provider-time.js';
import { requestStateDependencies } from '../../utilities/request-state.js';
import { ZdPatientForm } from '../patient-form/patient-form.js';
import { ZdProviderResults } from '../provider-results/provider-results.js';
import { ZdProviderSearch } from '../provider-search/provider-search.js';
import styles from './booking-flow.styles.js';

/** The steps, in the order a patient walks them. */
export type BookingStep = 'search' | 'time' | 'patient' | 'booked';

/**
 * The heading each step opens with, which is also the focus target on entering it (A11Y-003).
 *
 * Sentence-length rather than one word: the heading is the only thing announced when focus
 * moves, so "Choose a time" tells a patient what changed where "Time" would not.
 */
const STEP_HEADINGS: Record<BookingStep, string> = {
  search: 'Find a provider',
  time: 'Choose a time',
  patient: 'Your details',
  booked: 'Your appointment',
};

/**
 * The two `appointment_status` values that mean a booking happened.
 *
 * `pending_booking` counts: the practice has yet to accept, but the request is in and the
 * patient has a confirmation number. Everything else on this list — `booking_failed` above
 * all, which arrives on a **200** — is a failure, and treating a resolved promise as success
 * would show a confirmation for an appointment that does not exist.
 */
const BOOKED_STATUSES: ReadonlySet<AppointmentStatus> = new Set(['confirmed', 'pending_booking']);

/**
 * How many days of availability the results list shows at once.
 *
 * Bound down to the list rather than left to its own default, because this component is what
 * requests the window and the two numbers have to be the same one — a list showing fourteen days
 * of counts fetched over seven would report an empty second week.
 */
const AVAILABILITY_DAYS = 14;

/**
 * The appointment the API took.
 *
 * `status` rides along because `confirmed` and `pending_booking` are both bookings and the
 * difference matters to the patient: one is accepted, the other is waiting on the practice. A host
 * page that treats them alike tells some patients the wrong thing.
 */
export interface BookingCompleteDetail {
  appointmentId: string;
  status: AppointmentStatus;
}

/**
 * A booking that did not happen.
 *
 * `status` is present when the API answered **200** with a status that is not a booking —
 * `booking_failed` above all — and absent when the request itself failed. Either way the `error` is
 * developer-facing and must not be shown or logged wholesale (CLIENT-003, PHI-001); on the 200 path
 * it is a synthetic error naming the status, which carries no patient data.
 */
export interface BookingErrorDetail {
  error: unknown;
  status?: AppointmentStatus;
}

export interface ZdBookingFlowEventMap {
  'booking-complete': CustomEvent<BookingCompleteDetail>;
  'booking-error': CustomEvent<BookingErrorDetail>;
  'availability-error': CustomEvent<ErrorDetail>;
}

/**
 * Coordinates the booking funnel: search → time → details → confirmation.
 *
 * It owns the flow's state and the only write call in the library, and it talks to its
 * children through properties down and events up — no context protocol, no reaching into a
 * child, no shared store (COMP-002). Each child still works on its own, which is what lets a
 * host page assemble its own funnel instead of using this one (COMP-004).
 *
 * **The step is derived, never assigned.** `startTime` implies the patient step the way
 * `appointment` implies the confirmation, so there is no `step` field to fall out of sync with
 * the data, and a host page resuming a half-finished booking only has to set the properties it
 * already has. The cost is that going back has to clear what it goes back past — which is
 * correct anyway, since a different provider invalidates the slot picked from the old one.
 *
 * @tag zd-booking-flow
 * @event booking-complete - Emitted with `{ appointmentId, status }` once the API has taken
 *   the appointment. `status` is `confirmed` or `pending_booking`; both are bookings, and the
 *   difference is whether the practice has accepted yet, so a host page that treats them alike
 *   is telling some patients the wrong thing.
 * @event booking-error - Emitted with `{ error, status }` when the booking does not happen.
 *   `status` is present when the API answered 200 with a status that is not a booking, and
 *   absent when the request itself failed. Named `booking-error` rather than `error` because
 *   `error` is a native event name that already fires on this element for failed resource
 *   loads, and a listener could not tell the two apart (COMP-003).
 *   The `error` it carries is the client's own, whose body can echo submitted values — do not
 *   log it wholesale (PHI-001).
 * @event availability-error - Emitted with `{ error }` when the batched availability request for
 *   the results list fails. Nothing is rendered for it — the list keeps working without day
 *   counts — so this event is the only notice a host page gets. Same caution about the `error`.
 * @csspart step - The current step's container, and the focus target on every transition.
 * @csspart step-heading - The current step's heading.
 * @csspart back - The button returning to the previous step.
 * @csspart summary - The block restating what is about to be booked.
 * @csspart summary-time - The appointment time, on the patient step.
 * @csspart provider-summary - The provider block inside the summary, shared with
 *   `zd-provider-results` — see `internal/provider-summary.ts` for its inner parts.
 * @csspart status - The live region announcing that a booking is in flight.
 * @csspart error - The alert shown when a booking fails.
 * @csspart search - The provider search form.
 * @csspart results - The provider results list.
 * @csspart picker - The availability picker.
 * @csspart patient-form - The patient details form.
 * @csspart confirmation - The booking confirmation.
 */
export class ZdBookingFlow extends CharmElement {
  public static override baseName = 'booking-flow';

  declare public addEventListener: TypedEventTarget<ZdBookingFlowEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdBookingFlowEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdBookingFlowEventMap>;

  public static override styles = [
    ...super.styles,
    summaryStyles,
    styles,
  ] as typeof CharmElement.styles;

  /**
   * The five children plus the primitives this component renders itself. Every one has to be
   * listed: a `scoped-*` tag is rewritten to the scope's prefix whether or not the class
   * behind it was ever registered, so a missing entry here is an inert element rather than an
   * error (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [
      ZdProviderSearch,
      ZdProviderResults,
      ZdAvailabilityPicker,
      ZdPatientForm,
      ZdBookingConfirmation,
      ZdButton,
      ...requestStateDependencies,
    ];
  }

  /** The ZIP code the flow opens on. Kept in step with what the patient searched. */
  @property({ attribute: 'zip-code' })
  public zipCode = '';

  /**
   * The specialty the flow opens on. Kept in step with what the patient searched.
   *
   * The search endpoint requires this or a visit reason, so a flow that opens on neither
   * cannot search until the patient chooses one.
   */
  @property({ attribute: 'specialty-id' })
  public specialtyId?: string;

  /**
   * Narrows the search and, more importantly, is required for availability and booking.
   *
   * When the patient searched for "Any reason" this stays undefined, and the flow falls back
   * to the reason the API resolved for the search, then to the chosen provider's
   * `default_visit_reason_id` — see {@link effectiveVisitReasonId}.
   */
  @property({ attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ attribute: 'insurance-plan-id' })
  public insurancePlanId?: string;

  /** Whether the patient is new to the practice. Affects which slots are bookable. */
  @property({ attribute: 'patient-type' })
  public patientType: PatientType = 'new';

  /**
   * The last search's results. Public so a host page that ran its own search can hand them in
   * and start the flow at the list.
   *
   * One page of them. `totalCount` is how many the search matched.
   */
  @property({ attribute: false })
  public providers: ProviderLocation[] = [];

  /**
   * How many providers the search matched in total, which is what the results list needs to
   * count them and to know where its pager ends.
   *
   * Undefined until a search returns, and left undefined by a host page handing in `providers`
   * with no total — in which case the list renders neither the count nor the pager rather than
   * presenting one page as the whole answer.
   */
  @property({ type: Number, attribute: 'total-count' })
  public totalCount?: number;

  /** The zero-indexed page in hand. Bound down to both children so they cannot disagree. */
  @property({ type: Number })
  public page = 0;

  /**
   * Results per page, forwarded to the search that requests them and to the list that pages
   * through them. Updated from what the API says it used, since it is free to clamp.
   */
  @property({ type: Number, attribute: 'page-size' })
  public pageSize = DEFAULT_PAGE_SIZE;

  /** The chosen `pr_…|lo_…`. Setting it advances the flow to the time step. */
  @property({ attribute: 'provider-location-id' })
  public providerLocationId?: string;

  /** The chosen slot's `start_time`, verbatim from the API. Setting it advances to the form. */
  @property({ attribute: 'start-time' })
  public startTime?: string;

  /**
   * The chosen location, kept whole rather than reduced to its name.
   *
   * The two steps before the booking restate what is about to be booked, and the production
   * modal restates the whole card — the address a patient is travelling to matters as much as
   * the name. Holding the object is also what lets the summary here and the card in the
   * results list be the same markup.
   */
  @state()
  private selectedProvider?: ProviderLocation;

  /** The chosen provider's own default, used only when no visit reason was selected. */
  @state()
  private defaultVisitReasonId?: string;

  /**
   * The day the patient pressed on a card, carried to the picker as its `startDate`.
   *
   * Undefined when they pressed the card itself rather than one of its cells, which is what makes
   * the picker open on the provider's first available day instead. That distinction is the whole
   * reason this is separate from {@link availabilityStart}: the window the *list* is showing is not
   * the day the patient asked for, and reusing it would make every card press open the picker on
   * whatever Monday the pager happened to be parked on.
   */
  @state()
  private selectedDay?: string;

  /**
   * The `visit_reason_id` the search endpoint resolved, from `search_parameters`.
   *
   * Preferred over the provider's default because it is the reason the results were actually
   * produced for: asking for availability with a different one can return slots the search
   * would not have matched.
   */
  @state()
  private resolvedVisitReasonId?: string;

  /**
   * Day counts for every provider on the page, from one request rather than one per card.
   *
   * Undefined until a batch succeeds, and undefined again if one fails — the results list draws
   * no grids at all in that state, which is the point. See {@link loadAvailability}.
   */
  @state()
  private availability?: ProviderLocationAvailability[];

  /** The first day of the window `availability` covers, and the one the list is told to show. */
  @state()
  private availabilityStart?: string;

  /**
   * Which availability request is the current one.
   *
   * The window pager is a button a patient can press faster than the API answers, and responses
   * are not guaranteed to arrive in the order they were asked for. Without this, an overtaken
   * response lands last and leaves the counts showing a window nobody is looking at.
   */
  private availabilityRequest = 0;

  /** The booking response, and so the confirmation step's whole input. */
  @state()
  private appointment?: AppointmentResponseData;

  @state()
  private booking = false;

  @state()
  private bookingError?: string;

  /** The step the previous render drew, so `updated` can tell a transition from a redraw. */
  private renderedStep?: BookingStep;

  /**
   * Which step the current data puts the patient on. Reading the furthest-satisfied
   * precondition rather than tracking a cursor is what makes the two impossible to desync.
   */
  public get step(): BookingStep {
    if (this.appointment) return 'booked';
    if (this.startTime) return 'patient';
    if (this.providerLocationId) return 'time';
    return 'search';
  }

  /**
   * The visit reason availability and booking are actually performed with.
   *
   * `zd-provider-search` treats the visit reason as optional and its "Any reason" option
   * leaves it undefined, but `GET /v1/availability` and `POST /v1/appointments` both require
   * one. The search endpoint fills one in from the specialty and echoes it back in
   * `search_parameters`, so that is the first fallback; the chosen provider's own default is
   * the second, for a flow whose results did not come from this component's own search. Either
   * beats stranding the patient on a picker that will not fetch.
   */
  protected get effectiveVisitReasonId(): string | undefined {
    return this.visitReasonId ?? this.resolvedVisitReasonId ?? this.defaultVisitReasonId;
  }

  /**
   * The chosen provider's name, which is all the confirmation needs of them.
   *
   * `providerHeading` rather than `providerDisplayName`, so the confirmation names them exactly as
   * the card the patient pressed did — credential included. Formatted the other way, a flow whose
   * list said "Avery Sandoval, MD" confirms an appointment with "Avery Sandoval", and a patient
   * reading carefully has to work out whether those are the same person.
   */
  protected get providerName(): string | undefined {
    return this.selectedProvider ? providerHeading(this.selectedProvider) : undefined;
  }

  /**
   * Moves focus to the new step's container (A11Y-003).
   *
   * Deliberately not on first paint: focus belongs to the host page until the patient does
   * something, and yanking it on load moves a screen reader out of whatever introduced this
   * flow. The container rather than the heading because the heading is its accessible name,
   * so focusing the container announces the heading *and* leaves the patient at the top of
   * the step rather than past it.
   */
  protected override updated(): void {
    const step = this.step;

    if (this.renderedStep && this.renderedStep !== step) {
      this.shadowRoot?.querySelector<HTMLElement>('[part="step"]')?.focus();
    }

    this.renderedStep = step;
  }

  /**
   * Returns to the previous step by dropping what that step decided.
   *
   * Clearing is the point rather than a side effect. Going back past a provider has to
   * discard the slot picked from it — the times belong to that location, and carrying one
   * forward would book an appointment nobody chose. The visible cost is that the picker
   * refetches on the way back in, which is worth paying for a flow whose state cannot lie.
   */
  public back(): void {
    if (this.startTime) {
      this.startTime = undefined;
      this.bookingError = undefined;
      return;
    }

    if (this.providerLocationId) {
      this.providerLocationId = undefined;
      this.selectedProvider = undefined;
      this.defaultVisitReasonId = undefined;
      // The day was a cell on that provider's card, so it goes back with the provider.
      this.selectedDay = undefined;
    }
  }

  /**
   * Books the appointment. Public so a host page driving the form itself can still finish.
   *
   * Every `return` here is a refusal to send an incomplete or duplicate booking, which is the
   * one request in this library that cannot be undone by making it again — a second POST books
   * a second appointment. `zd-patient-form` disables its own button while `busy`, so this guard
   * covers what that cannot: a programmatic caller, or a second submit racing the first.
   */
  public async book(patient: Patient, notes?: string): Promise<void> {
    if (this.booking) return;

    const providerLocationId = this.providerLocationId;
    const visitReasonId = this.effectiveVisitReasonId;
    const startTime = this.startTime;

    if (!providerLocationId || !visitReasonId || !startTime) return;

    this.booking = true;
    this.bookingError = undefined;

    try {
      const appointment = await createAppointment({
        providerLocationId,
        visitReasonId,
        startTime,
        patientType: this.patientType,
        patient,
        notes,
      });

      if (!BOOKED_STATUSES.has(appointment.appointment_status)) {
        /*
         * A 200 that is not a booking. The flow stays on the patient step with the form
         * filled in, because the likeliest fix is a different time rather than different
         * details — and re-entering ten fields to find that out would be its own failure.
         *
         * The event carries a synthetic error naming the status, which is safe to log: it
         * contains no patient data, unlike the client's own errors.
         */
        this.bookingError = 'This appointment could not be booked. Try choosing another time.';
        this.emit('booking-error', {
          detail: {
            error: new Error(`Appointment status: ${appointment.appointment_status}`),
            status: appointment.appointment_status,
          },
        });
        return;
      }

      this.appointment = appointment;
      this.emit('booking-complete', {
        detail: {
          appointmentId: appointment.appointment_id,
          status: appointment.appointment_status,
        },
      });
    } catch (error: unknown) {
      // The raw error rides the event on purpose: the host page's handling of it is
      // developer-facing, while what reaches the DOM goes through userFacingError. Here that
      // matters most — a failed booking's body can echo the patient's own fields (PHI-001).
      this.bookingError = userFacingError(error);
      this.emit('booking-error', { detail: { error } });
    } finally {
      this.booking = false;
    }
  }

  /**
   * Fetches day counts for the whole page in one call.
   *
   * The endpoint takes an array of `provider_location_ids` and answers for all of them, so this
   * is one request where ten self-fetching cards would be ten. That is the only reason the counts
   * live here rather than in the cards that show them (COMP-002).
   *
   * **Failure is silent, and takes the grids with it.** No message, no retry: the counts are an
   * enhancement over a list that already works, and the patient still gets real times on the next
   * step. Dropping `availability` rather than keeping the stale set is what stops the list showing
   * one window's dates over another window's counts — the one outcome worse than showing none.
   * The raw error rides `availability-error` for a host page that wants to say more.
   */
  protected async loadAvailability(startDate: string): Promise<void> {
    const visitReasonId = this.effectiveVisitReasonId;
    const providerLocationIds = this.providers.map((location) => location.provider_location_id);

    // No visit reason is a real state, not an oversight: the search's "Any reason" option leaves
    // one undefined and the endpoint requires it. The list simply goes without counts.
    if (!visitReasonId || providerLocationIds.length === 0) return;

    const request = (this.availabilityRequest += 1);

    try {
      const entries = await getAvailability({
        providerLocationIds,
        visitReasonId,
        patientType: this.patientType,
        startDate,
        endDate: windowEndDate(startDate, AVAILABILITY_DAYS),
        insurancePlanId: this.insurancePlanId,
      });

      if (request !== this.availabilityRequest) return;

      this.availability = entries;
      this.availabilityStart = startDate;
    } catch (error: unknown) {
      if (request !== this.availabilityRequest) return;

      this.availability = undefined;
      // The error is passed on untouched but never rendered — its body can echo request values
      // (CLIENT-003, PHI-001), and there is no message for this failure by design.
      this.emit('availability-error', { detail: { error } });
    }
  }

  /**
   * Moves to the time step.
   *
   * `day` is the cell the patient pressed, when a cell is how they got here. Passing it on as the
   * picker's start day is what makes a day cell mean something: pressing Thursday and landing on
   * Monday is a worse answer than the cell not being pressable at all.
   */
  protected handleProviderSelect(location: ProviderLocation, day?: string): void {
    this.providerLocationId = location.provider_location_id;
    this.selectedProvider = location;
    this.defaultVisitReasonId = location.provider.default_visit_reason_id;
    this.selectedDay = day;
    // A different provider means the old slot is not on offer any more (see `back`).
    this.startTime = undefined;
  }

  /**
   * Renders the search form and, once a search has returned something, the results.
   *
   * The results list is left out until there is something in it rather than rendered empty:
   * `zd-provider-search` already says "No providers match this search" from its own empty
   * state, and two components answering the same question is one too many (COMP-001).
   *
   * The criteria are bound as properties in both directions. The search component owns these
   * three fields once the patient touches them, and it echoes what it used back on
   * `provider-results` — which is what stops this binding from pushing a stale ZIP back down
   * over a typed one.
   *
   * Paging is the same shape and completes a circle: the list emits `page-change`, this sets
   * `page`, and the search refetches because its own `page` moved. No sibling talks to a
   * sibling and nothing calls a method on a child (COMP-002) — which is also why the list can
   * be swapped for a host page's own without paging stopping working.
   */
  protected renderSearchStep(): unknown {
    return this.html`
      <scoped-provider-search
        part="search"
        .zipCode=${this.zipCode}
        .specialtyId=${this.specialtyId}
        .visitReasonId=${this.visitReasonId}
        .insurancePlanId=${this.insurancePlanId}
        .page=${this.page}
        .pageSize=${this.pageSize}
        @provider-results=${(event: CustomEvent) => {
          this.providers = event.detail.providers;
          this.totalCount = event.detail.totalCount;
          this.page = event.detail.page;
          this.pageSize = event.detail.pageSize;
          this.zipCode = event.detail.zipCode;
          this.specialtyId = event.detail.specialtyId;
          this.visitReasonId = event.detail.visitReasonId;
          this.insurancePlanId = event.detail.insurancePlanId;
          this.resolvedVisitReasonId = event.detail.searchParameters?.visit_reason_id;

          // Cleared before the new batch is asked for, not after it lands: these are different
          // providers, and last page's counts matched against this page's ids would put "No
          // appointments" on every card until the answer arrived.
          this.availability = undefined;
          void this.loadAvailability(resolveWindowStart(this.availabilityStart));
        }}
      ></scoped-provider-search>

      ${
        this.providers.length
          ? this.html`
              <scoped-provider-results
                part="results"
                .providers=${this.providers}
                .totalCount=${this.totalCount}
                .page=${this.page}
                .pageSize=${this.pageSize}
                .availability=${this.availability}
                .availabilityStart=${this.availabilityStart}
                .availabilityDays=${AVAILABILITY_DAYS}
                @provider-select=${(event: CustomEvent) =>
                  this.handleProviderSelect(event.detail.provider)}
                @page-change=${(event: CustomEvent) => {
                  this.page = event.detail.page;
                }}
                @window-change=${(event: CustomEvent) =>
                  void this.loadAvailability(event.detail.startDate)}
                @day-select=${(event: CustomEvent) =>
                  // Both halves of the cell are used: the provider it belonged to, and the day
                  // itself, which the picker opens on.
                  this.handleProviderSelect(event.detail.provider, event.detail.day)}
              ></scoped-provider-results>
            `
          : nothing
      }
    `;
  }

  protected renderTimeStep(): unknown {
    return this.html`
      ${this.renderSummary()}

      <scoped-availability-picker
        part="picker"
        .providerLocationId=${this.providerLocationId}
        .visitReasonId=${this.effectiveVisitReasonId}
        .patientType=${this.patientType}
        .startDate=${this.selectedDay}
        @slot-select=${(event: CustomEvent) => {
          this.startTime = event.detail.startTime;
        }}
        @patient-type-change=${(event: CustomEvent) => {
          // Followed rather than ignored because the same value goes to POST /v1/appointments:
          // a patient who says they are returning and is then booked as new is a wrong booking,
          // not a cosmetic mismatch.
          this.patientType = event.detail.patientType;
        }}
      ></scoped-availability-picker>
    `;
  }

  /**
   * The form, plus the two things a coordinator owes it: a live region for the request it
   * cannot see, and somewhere to put the failure.
   *
   * `renderRequestState` is not used here even though the parts are named to match it. That
   * helper renders its children only on `success` and puts a "Try again" button in the error
   * state; this step needs the form visible in every state, and retrying has to go back
   * through the form's own submit so that nothing has to hold a patient's details in memory
   * waiting for a second attempt (PHI-001).
   */
  protected renderPatientStep(): unknown {
    return this.html`
      ${this.renderSummary()}

      <scoped-patient-form
        part="patient-form"
        .busy=${this.booking}
        @patient-submit=${(event: CustomEvent) =>
          void this.book(event.detail.patient, event.detail.notes)}
      ></scoped-patient-form>

      <div class="status" part="status" role="status" aria-live="polite" aria-atomic="true">
        ${
          this.booking
            ? this.html`
                <scoped-spinner aria-hidden="true"></scoped-spinner>
                <span>Booking your appointment…</span>
              `
            : nothing
        }
      </div>

      ${
        this.bookingError
          ? this.html`
              <scoped-alert part="error" variant="danger" politeness="assertive" open>
                ${this.bookingError}
              </scoped-alert>
            `
          : nothing
      }
    `;
  }

  protected renderBookedStep(): unknown {
    const appointment = this.appointment;
    if (!appointment) return nothing;

    // The API's own status is passed through rather than assumed: this step is reached for
    // `pending_booking` too, and the confirmation words that outcome differently.
    return this.html`
      <scoped-booking-confirmation
        part="confirmation"
        .appointmentId=${appointment.appointment_id}
        .status=${appointment.appointment_status}
        .startTime=${this.startTime}
        .providerName=${this.providerName}
      ></scoped-booking-confirmation>
    `;
  }

  /** The escape hatch back one step, labelled with where it goes rather than just "Back". */
  protected renderBack(step: BookingStep): unknown {
    return this.html`
      <scoped-button class="back" part="back" variant="secondary" size="small" @click=${() => this.back()}>
        ${step === 'time' ? 'Back to search' : 'Back to times'}
      </scoped-button>
    `;
  }

  /**
   * What is about to be booked, restated on the two steps that are about to commit to it.
   *
   * The provider block is the same markup as the card the patient picked, so the two cannot
   * describe them differently. The time is added on the patient step only: on the time step it
   * is the thing being chosen, and restating a selection directly above the control that makes
   * it is noise.
   *
   * Not an `aria-label` or a `title`: it is text a patient reads and a browser translates,
   * so it lives in the DOM (I18N-001).
   */
  protected renderSummary(): unknown {
    const provider = this.selectedProvider;
    const when = this.step === 'patient' ? formatAppointmentTime(this.startTime) : undefined;

    if (!provider && !when) return nothing;

    return this.html`
      <div class="summary" part="summary">
        ${provider ? renderProviderSummary(provider) : nothing}
        ${when ? this.html`<p class="summary-time" part="summary-time">${when}</p>` : nothing}
      </div>
    `;
  }

  protected renderStep(step: BookingStep): unknown {
    switch (step) {
      case 'search':
        return this.renderSearchStep();
      case 'time':
        return this.renderTimeStep();
      case 'patient':
        return this.renderPatientStep();
      case 'booked':
        return this.renderBookedStep();
    }
  }

  /**
   * One step at a time, in a container that is both the focus target and the step's
   * accessible name (`aria-labelledby` on a `tabindex="-1"` element).
   *
   * `tabindex="-1"` and not `0`: it takes focus when the flow moves it there, and stays out
   * of the tab sequence otherwise, so a patient tabbing through the form never lands on a
   * wrapper that does nothing.
   *
   * There is no Back button on the confirmation. A booked appointment is not a step to
   * reconsider — cancelling one is a different request this library does not make.
   */
  protected override render(): unknown {
    const step = this.step;

    return this.html`
      <section class="step" part="step" tabindex="-1" aria-labelledby="step-heading">
        <h2 class="step-heading" part="step-heading" id="step-heading">${STEP_HEADINGS[step]}</h2>

        ${step === 'search' || step === 'booked' ? nothing : this.renderBack(step)}

        ${this.renderStep(step)}
      </section>
    `;
  }
}
