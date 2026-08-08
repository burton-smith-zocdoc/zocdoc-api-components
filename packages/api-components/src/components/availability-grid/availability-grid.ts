import { CharmElement } from '@powered-by-zocdoc/primitives';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { AvailabilitySlot, PatientType } from '../../client/types.js';
import type {
  AvailabilityWindowDetail,
  ErrorDetail,
  TypedEmit,
  TypedEventTarget,
} from '../events.js';
import { ZdAvailabilityWindow, type WindowShiftDetail } from '../availability-window/availability-window.js';
import {
  getLocationSlots,
  nextWindowStart,
  resolveWindowStart,
  windowEndDate,
  windowSpan,
} from '../../utilities/availability-window.js';
import { userFacingError } from '../../utilities/error-message.js';
import { formatCount } from '../../utilities/format.js';
import {
  addDays,
  dayKey,
  isValidDate,
  providerLocalTime,
  todayDayKey,
} from '../../utilities/provider-time.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../../utilities/request-state.js';
import styles from './availability-grid.styles.js';

/** Split in two because a cell stacks the weekday over the date as separate lines. */
const weekdayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' });

const dateLabel = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/**
 * How many appointments a day has, as one phrase.
 *
 * Built here rather than as a number in its own element because it is a single phrase, and
 * splitting it across elements is what stops a browser translating it (I18N-004). The zero case
 * is a sentence of its own rather than "0 appts", which reads as a fault.
 */
function countPhrase(count: number): string {
  if (count === 0) return 'No appts';
  return count === 1 ? '1 appt' : `${formatCount(count)} appts`;
}

/**
 * The day cell the patient pressed.
 *
 * `providerLocationId` is whatever this grid was given, and so is absent on a grid rendering
 * counts a host page supplied by hand. A page showing several grids should prefer
 * `zd-provider-results`' own `day-select`, which carries the whole provider.
 */
export interface DaySelectDetail {
  day: string;
  providerLocationId?: string;
}

export interface ZdAvailabilityGridEventMap {
  'day-select': CustomEvent<DaySelectDetail>;
  'window-change': CustomEvent<AvailabilityWindowDetail>;
  /** No payload: the request is simply to widen the window. */
  'more-select': CustomEvent<Record<string, never>>;
  'availability-error': CustomEvent<ErrorDetail>;
}

/**
 * A window of days with the number of appointments open on each — the shape a patient scans to
 * find a day worth opening, before caring what the times are.
 *
 * **Two ways in.** Given `timeslots`, it counts what it was handed and fetches nothing: that is
 * how it sits inside a results list, where the parent makes one batched `getAvailability` call
 * for the whole page and hands each card its own slots (COMP-002). Given a
 * `provider-location-id` and a `visit-reason-id` instead, it fetches its own window, which is
 * what a provider profile needs. The discriminator is `timeslots`: a component that has been
 * given slots has no reason to ask for more.
 *
 * **The window pager is reported and, when self-fetching, also performed.** Moving it always
 * updates `start-date` and emits `window-change`; a parent that supplied `timeslots` is expected
 * to fetch that range and hand back new ones. This component cannot do it for them, because
 * without a visit reason there is nothing the API would accept.
 *
 * The day cells stay visible in the empty state rather than being replaced by the message. The
 * window is derived from dates, not from data, so it is still true — and it is the only way to
 * page to a range that does have appointments.
 *
 * @tag zd-availability-grid
 * @event day-select - Emitted with `{ day, providerLocationId }` when a day with appointments is
 *   chosen. `day` is a `YYYY-MM-DD` key in the provider's own local time.
 * @event window-change - Emitted with `{ startDate, endDate }` when the range moves. Both are
 *   `YYYY-MM-DD` and inclusive, ready to pass to `getAvailability`.
 * @event more-select - Emitted when "More" is pressed, and only rendered when `show-more` is set.
 *   Where that goes is the host page's business — a profile, a full calendar — so nothing here
 *   navigates.
 * @event availability-error - Emitted with `{ error }` when this component's own request fails.
 * @csspart window - The header holding the range and its controls.
 * @csspart window-range - The line naming the range on show.
 * @csspart window-previous - The control moving the range back.
 * @csspart window-next - The control moving the range forward.
 * @csspart days - The grid of days.
 * @csspart day - One day cell.
 * @csspart day-weekday - The weekday line of a cell.
 * @csspart day-date - The month and day line of a cell.
 * @csspart day-count - The appointment count line of a cell.
 * @csspart more - The "More" control, when `show-more` is set.
 */
export class ZdAvailabilityGrid extends CharmElement {
  public static override baseName = 'availability-grid';

  declare public addEventListener: TypedEventTarget<ZdAvailabilityGridEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdAvailabilityGridEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdAvailabilityGridEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  /**
   * The day cells use native buttons because a fourteen-cell grid on each of ten cards is a
   * hundred and forty custom elements per page, and the cells are blocks of text, not buttons
   * with variants.
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [...requestStateDependencies, ZdAvailabilityWindow];
  }

  /**
   * The `pr_…|lo_…` pair the days belong to.
   *
   * Required to fetch, and carried on `day-select` either way, so a parent-driven grid still
   * says which card the patient picked a day on.
   */
  @property({ attribute: 'provider-location-id' })
  public providerLocationId?: string;

  /**
   * Required by the API — availability is always for a specific visit reason. Setting it is also
   * what asks this component to fetch for itself; a parent-driven grid leaves it off.
   */
  @property({ attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  @property({ attribute: 'patient-type' })
  public patientType: PatientType = 'new';

  /**
   * The slots to count, when a parent already has them.
   *
   * Named for the API field it comes from, both because that is where a caller gets it and
   * because `slots` in a web component means something else entirely.
   *
   * `undefined` means "not supplied", which is what allows this component to fetch its own; `[]`
   * means "supplied, and there are none", which renders an empty window and asks for nothing.
   * The two are deliberately different, so a parent mid-request should hand back `[]` rather
   * than dropping the binding.
   *
   * `readonly` because nothing here writes to it and a parent with many cards may well hand the
   * same empty array to all of them — which `zd-provider-results` does.
   */
  @property({ attribute: false })
  public timeslots?: readonly AvailabilitySlot[];

  /**
   * The first day on show, as `YYYY-MM-DD`. Defaults to today, and moves when the range does.
   *
   * A day key rather than a `Date` because that is what the API takes and what the slots are
   * grouped by, so nothing has to be converted to compare them.
   */
  @property({ attribute: 'start-date' })
  public startDate?: string;

  /**
   * How many days the window covers, counting the first. Fourteen is two rows of seven, which is
   * the shape the production UI uses; clamped to the 30 the API allows.
   */
  @property({ type: Number })
  public days = 14;

  /** The day currently open, if any. Settable so a host page can restore it (COMP-004). */
  @property({ attribute: 'selected-day' })
  public selectedDay?: string;

  /**
   * Renders the "More" control. Off by default: it is only meaningful when the host page has
   * somewhere for it to go, and a control that does nothing is worse than no control.
   */
  @property({ type: Boolean, attribute: 'show-more' })
  public showMore = false;

  /**
   * Drops this component's own window control, leaving the days.
   *
   * What a results list sets on every card: the production search page has one range control
   * above the list governing every provider in it, not ten of them disagreeing. The pager still
   * works through `shiftWindow` and `start-date`, so whoever owns the shared control drives all
   * of them by binding the same `start-date` down.
   *
   * Named for what it does rather than as `show-window`, which would default to true and could
   * then never be turned off through an attribute — a boolean attribute's presence is its value.
   */
  @property({ type: Boolean, attribute: 'hide-window' })
  public hideWindow = false;

  @state()
  private fetched: AvailabilitySlot[] = [];

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private errorMessage?: string;

  /** The day key that currently has roving tabindex="0". */
  @state()
  private rovingDay?: string;

  /** What the cells count: whatever a parent supplied, or whatever this component fetched. */
  private get slots(): readonly AvailabilitySlot[] {
    return this.timeslots ?? this.fetched;
  }

  /** The window's first day, falling back to today for an unset or unparseable `start-date`. */
  protected get windowStart(): string {
    return resolveWindowStart(this.startDate);
  }

  /** The window's last day, inclusive — so a fourteen-day window ends thirteen days along. */
  protected get windowEnd(): string {
    return windowEndDate(this.windowStart, this.days);
  }

  /**
   * Refetching belongs here rather than in `connectedCallback` because both ids usually arrive
   * as property assignments after the element is in the document. Reactive state set before the
   * first await lands in the update already in flight, so the loading state paints immediately.
   *
   * `timeslots` is in the list so that dropping a binding — a parent handing back `undefined`
   * after having supplied slots — hands fetching back to this component rather than leaving a
   * grid that counts nothing.
   */
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('providerLocationId') ||
      changed.has('visitReasonId') ||
      changed.has('patientType') ||
      changed.has('timeslots') ||
      changed.has('startDate') ||
      changed.has('days')
    ) {
      void this.load();
    }
  }

  /**
   * Fetches the window. Safe to call repeatedly, and does nothing at all when a parent supplied
   * `timeslots` or when there is no visit reason to fetch against.
   */
  public async load(): Promise<void> {
    const providerLocationId = this.providerLocationId;

    // Supplied slots are not this component's to replace, and refetching them would both waste
    // the parent's batched call and race it.
    if (this.timeslots !== undefined) return;

    if (!providerLocationId || !this.visitReasonId) {
      this.requestState = 'idle';
      return;
    }

    this.requestState = 'loading';
    this.errorMessage = undefined;

    try {
      this.fetched = await getLocationSlots({
        providerLocationId,
        visitReasonId: this.visitReasonId,
        patientType: this.patientType,
        startDate: this.windowStart,
        endDate: this.windowEnd,
      });

      this.requestState = this.fetched.length === 0 ? 'empty' : 'success';
    } catch (error: unknown) {
      this.requestState = 'error';
      // The raw error rides the event on purpose: the host page's handling of it is
      // developer-facing, while what reaches the DOM goes through userFacingError (PHI-001).
      this.errorMessage = userFacingError(error);
      this.emit('availability-error', { detail: { error } });
    }
  }

  /**
   * How many slots each day of the window has, keyed by day.
   *
   * Every day in the window gets an entry, including the ones with nothing — a grid whose cells
   * came from the data would change shape with it, and a fortnight has fourteen days whether or
   * not the practice is open on them.
   */
  protected get dayCounts(): Map<string, number> {
    const counts = new Map<string, number>();
    const span = windowSpan(this.days);

    for (let offset = 0; offset < span; offset += 1) {
      counts.set(addDays(this.windowStart, offset), 0);
    }

    for (const slot of this.slots) {
      const key = dayKey(slot.start_time);
      // Only days on show. A batched fetch covers whatever range the parent asked for, which
      // is not necessarily this one.
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }

  /** Days with at least one appointment, in order. */
  protected get enabledDays(): string[] {
    return [...this.dayCounts].filter(([, count]) => count > 0).map(([day]) => day);
  }

  /** The day that should have tabindex="0": explicit roving state, selected day, or first enabled. */
  protected get activeRovingDay(): string | undefined {
    const enabled = this.enabledDays;
    if (this.rovingDay && enabled.includes(this.rovingDay)) return this.rovingDay;
    if (this.selectedDay && enabled.includes(this.selectedDay)) return this.selectedDay;
    return enabled[0];
  }

  /** Handles arrow-key navigation within the day grid. */
  protected handleDaysKeydown(event: KeyboardEvent): void {
    const enabled = this.enabledDays;
    if (enabled.length === 0) return;

    const current = this.activeRovingDay;
    const currentIndex = current ? enabled.indexOf(current) : -1;
    let nextIndex: number | undefined;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex < enabled.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : enabled.length - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabled.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextDay = enabled[nextIndex];
    this.rovingDay = nextDay;

    const button = this.shadowRoot?.querySelector<HTMLButtonElement>(
      `button.day[data-day="${nextDay}"]`
    );
    button?.focus();
  }

  /** Moves the window by its own width, so the ranges tile rather than overlap. */
  public shiftWindow(direction: -1 | 1): void {
    const startDate = nextWindowStart(this.windowStart, direction, this.days);

    // Nowhere to go — clamped at today — so there is nothing to announce either.
    if (startDate === this.windowStart) return;

    this.startDate = startDate;
    this.emit('window-change', {
      detail: { startDate, endDate: windowEndDate(startDate, this.days) },
    });
  }

  protected selectDay(day: string): void {
    this.selectedDay = day;
    this.emit('day-select', { detail: { day, providerLocationId: this.providerLocationId } });
  }

  /**
   * The range on show, with a control on each side — the shared one, so this and the results
   * list cannot end up with two different window controls.
   *
   * Suppressed by `hide-window`, which is what a results list sets on every card: one control
   * above the list governs all of them.
   */
  protected handleWindowShift(event: CustomEvent<WindowShiftDetail>): void {
    this.shiftWindow(event.detail.direction);
  }

  protected renderWindow(): unknown {
    if (this.hideWindow) return nothing;

    return this.html`
      <scoped-availability-window
        start-date=${this.windowStart}
        end-date=${this.windowEnd}
        .canGoEarlier=${this.windowStart > todayDayKey()}
        @window-shift=${this.handleWindowShift}
      ></scoped-availability-window>
    `;
  }

  /**
   * The days as a listbox of selectable options. Each day is an option; disabled days have
   * `aria-disabled`. Uses roving tabindex: only one enabled day is tabbable at a time, and arrow
   * keys move between enabled days.
   *
   * The "More" button lives outside the listbox since it is not a selectable date.
   */
  protected renderDays(): unknown {
    const activeDay = this.activeRovingDay;

    return this.html`
      <span id="days-label" class="visually-hidden">Available dates</span>
      <div class="days" part="days" role="listbox" aria-labelledby="days-label" @keydown=${this.handleDaysKeydown}>
        ${[...this.dayCounts].map(([day, count]) => {
          const date = providerLocalTime(day);
          const isEnabled = count > 0;
          return this.html`
            <button
              class="day"
              part="day"
              type="button"
              role="option"
              data-day=${day}
              tabindex=${isEnabled && day === activeDay ? 0 : -1}
              ?disabled=${!isEnabled}
              aria-disabled=${!isEnabled}
              aria-selected=${day === this.selectedDay}
              @click=${() => this.selectDay(day)}
            >
              <span class="day-weekday" part="day-weekday">${isValidDate(date) ? weekdayLabel.format(date) : ''}</span>
              <span class="day-date" part="day-date">${isValidDate(date) ? dateLabel.format(date) : day}</span>
              <span class="day-count" part="day-count">${countPhrase(count)}</span>
            </button>
          `;
        })}
      </div>
      ${
        this.showMore
          ? this.html`
              <button class="more" part="more" type="button" @click=${() => this.emit('more-select', { detail: {} })}>
                More
              </button>
            `
          : nothing
      }
    `;
  }

  /**
   * The days render for every state but `loading` and `error`, which is what keeps the pager
   * reachable when a range comes back empty — the message says there is nothing here, and the
   * control that goes somewhere else is still there to press. A failed request is the exception:
   * counts that are all zero because the call failed would be a lie the retry button contradicts.
   */
  protected override render(): unknown {
    const showDays = this.requestState !== 'loading' && this.requestState !== 'error';

    return this.html`
      ${renderRequestState(this.requestState, {
        emptyMessage: 'No appointments available in these dates.',
        errorMessage: this.errorMessage,
        loadingMessage: 'Loading availability…',
        onRetry: () => void this.load(),
        // The days live outside this helper because it renders children on `success` alone, and
        // they have to survive `empty` and `idle` too.
        children: () => nothing,
      })}
      ${showDays ? this.html`${this.renderWindow()}${this.renderDays()}` : nothing}
    `;
  }
}
