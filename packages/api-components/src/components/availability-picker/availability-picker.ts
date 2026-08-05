import { CharmElement, ZdButton } from '@powered-by-zocdoc/primitives';
import type { PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { getAvailability } from '../../client/availability.js';
import type { AvailabilitySlot, PatientType } from '../../client/types.js';
import { userFacingError } from '../internal/error-message.js';
import { providerLocalTime } from '../internal/provider-time.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../internal/request-state.js';
import styles from './availability-picker.styles.js';

/** The API rejects a window wider than 30 days, so a larger `days` is clamped to it. */
const MAX_DAYS = 30;

/**
 * `YYYY-MM-DD` for the wire, taken from the browser's local date. `toISOString()` would
 * use UTC and, for anyone west of Greenwich in the evening, ask for a window that starts
 * tomorrow — dropping the rest of today's slots. This is a wire format rather than
 * anything a user reads, so I18N-002 does not apply.
 */
function isoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Built once rather than per render: constructing an `Intl.DateTimeFormat` is the
 * expensive part, and a day strip formats every slot on every update. `undefined` for
 * the locale means the user's own.
 */
const dayLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

const timeLabel = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

/**
 * Fetches bookable timeslots for one provider location and renders them as a strip of
 * days plus the times available on the selected day. No calendar primitive is involved —
 * a day strip is what the booking flow needs, and it is a list of buttons.
 *
 * Emits the chosen slot rather than booking it, so it composes with `zd-patient-form` or
 * with a host page that owns its own booking step (COMP-002).
 *
 * @tag zd-availability-picker
 * @event slot-select - Emitted with `{ startTime, providerLocationId }` when a time is
 *   chosen. `startTime` is the API's own string, offset included, so it can be handed
 *   back to `POST /v1/appointments` unmodified.
 * @event availability-error - Emitted with `{ error }` when the request fails.
 * @csspart days - The list of days with availability.
 * @csspart day - One day button.
 * @csspart slots - The list of times on the selected day.
 * @csspart slot - One timeslot button.
 */
export class ZdAvailabilityPicker extends CharmElement {
  public static override baseName = 'availability-picker';

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  /**
   * `ZdButton` is listed even though `requestStateDependencies` already carries it, for the
   * retry control. The day and time buttons are this component's own requirement, and
   * leaning on the error state's dependency list to supply them would break silently if
   * that list ever changed. Registration is idempotent, so the repeat costs nothing.
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ...requestStateDependencies];
  }

  /** The `pr_…|lo_…` pair to fetch availability for. Nothing is fetched without it. */
  @property({ attribute: 'provider-location-id' })
  public providerLocationId?: string;

  /** Required by the API — availability is always for a specific visit reason. */
  @property({ attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ attribute: 'patient-type' })
  public patientType: PatientType = 'new';

  /** Size of the availability window in days, counted from today. Clamped to 30. */
  @property({ type: Number })
  public days = 7;

  /**
   * The chosen slot's `start_time`. Settable so a host page that already knows the
   * selection can restore it, which is what makes going back a step work (COMP-004).
   */
  @property({ attribute: 'selected-start-time' })
  public selectedStartTime?: string;

  @state()
  private slots: AvailabilitySlot[] = [];

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private activeDay?: string;

  @state()
  private errorMessage?: string;

  /**
   * Refetching belongs here rather than in `connectedCallback` because both ids usually
   * arrive as property assignments after the element is in the document — a parent step
   * sets them once the user has picked a provider. Reactive state set before the first
   * await lands in the update already in flight, so the loading state paints immediately.
   */
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('providerLocationId') ||
      changed.has('visitReasonId') ||
      changed.has('patientType') ||
      changed.has('days')
    ) {
      void this.load();
    }
  }

  /** Fetches availability. Safe to call repeatedly; stays idle without both ids. */
  public async load(): Promise<void> {
    const providerLocationId = this.providerLocationId;

    if (!providerLocationId || !this.visitReasonId) {
      this.requestState = 'idle';
      return;
    }

    this.requestState = 'loading';
    this.errorMessage = undefined;

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + Math.min(this.days, MAX_DAYS));

    try {
      const entries = await getAvailability({
        providerLocationIds: [providerLocationId],
        visitReasonId: this.visitReasonId,
        patientType: this.patientType,
        startDate: isoDate(start),
        endDate: isoDate(end),
      });

      // One entry per requested location, and exactly one was requested. The entry comes
      // back even with no open slots, so its absence means a different location answered.
      const entry = entries.find((item) => item.provider_location_id === providerLocationId);

      this.slots = entry?.timeslots ?? [];
      this.activeDay = this.dayKeys[0];
      this.requestState = this.slots.length === 0 ? 'empty' : 'success';
    } catch (error: unknown) {
      this.requestState = 'error';
      // Never `error.message` — it is developer-facing and its body can echo a submitted
      // value (CLIENT-003, PHI-001). The raw error still rides the event.
      this.errorMessage = userFacingError(error);
      this.emit('availability-error', { detail: { error } });
    }
  }

  /**
   * The distinct days that have slots, in the order the API returned them.
   *
   * Grouped on the date portion of the string rather than on a parsed `Date`, so a slot
   * belongs to the day the provider calls it. A 9pm Eastern slot read in Berlin would
   * otherwise move to the following morning and split one evening across two days.
   */
  private get dayKeys(): string[] {
    return [...new Set(this.slots.map((slot) => slot.start_time.slice(0, 10)))];
  }

  protected select(slot: AvailabilitySlot): void {
    const providerLocationId = this.providerLocationId;
    if (!providerLocationId) return;

    this.selectedStartTime = slot.start_time;
    this.emit('slot-select', { detail: { startTime: slot.start_time, providerLocationId } });
  }

  /**
   * `current` is Charm's own property for `aria-current` on the button's internal
   * control; setting the attribute on the host would land on a wrapper with no role and
   * never reach the accessibility tree.
   */
  protected renderDays(): unknown {
    return this.html`
      <ul part="days">
        ${this.dayKeys.map(
          (day) => this.html`
            <li>
              <scoped-button
                part="day"
                variant=${day === this.activeDay ? 'primary' : 'secondary'}
                .current=${day === this.activeDay ? 'date' : undefined}
                @click=${() => {
                  this.activeDay = day;
                }}
              >
                ${dayLabel.format(providerLocalTime(day))}
              </scoped-button>
            </li>
          `
        )}
      </ul>
    `;
  }

  protected renderSlots(): unknown {
    const slots = this.slots.filter((slot) => slot.start_time.slice(0, 10) === this.activeDay);

    return this.html`
      <ul part="slots">
        ${slots.map(
          (slot) => this.html`
            <li>
              <scoped-button
                part="slot"
                variant="secondary"
                .current=${slot.start_time === this.selectedStartTime ? 'time' : undefined}
                @click=${() => this.select(slot)}
              >
                ${timeLabel.format(providerLocalTime(slot.start_time))}
              </scoped-button>
            </li>
          `
        )}
      </ul>
    `;
  }

  protected override render(): unknown {
    return renderRequestState(this.requestState, {
      emptyMessage: 'No appointments available in this range.',
      errorMessage: this.errorMessage,
      loadingMessage: 'Loading appointment times…',
      onRetry: () => void this.load(),
      children: () => this.html`${this.renderDays()} ${this.renderSlots()}`,
    });
  }
}
