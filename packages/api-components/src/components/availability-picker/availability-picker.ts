import {
  CharmElement,
  ZdButton,
  ZdButtonGroup,
  ZdIcon,
  ZdSkeleton,
} from '@zocdoc/api-primitive-components';
import { nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { AvailabilitySlot, PatientType, ProviderLocation } from '../../client/types.js';
import type { ErrorDetail, TypedEmit, TypedEventTarget } from '../events.js';
// Re-exported because the generated framework types import every event payload from this module.
export type { ErrorDetail } from '../events.js';
import {
  getLocationSlots,
  resolveWindowStart,
  windowEndDate,
  windowSpan,
} from '../../utilities/availability-window.js';
import { userFacingError } from '../../utilities/error-message.js';
import { handoffHref } from '../../utilities/handoff.js';
import {
  afterDocumentParsed,
  hydrateFromMarkup,
  type HydrationShape,
} from '../../utilities/hydrate.js';
import { addDays, dayKey, isValidDate, providerLocalTime } from '../../utilities/provider-time.js';
import {
  renderRequestState,
  requestStateDependencies,
  type RequestState,
} from '../../utilities/request-state.js';
import styles from './availability-picker.styles.js';

/** How many placeholder days stand in for the window while it loads. */
const SKELETON_DAYS = 2;

/** How many placeholder times each of those days shows. */
const SKELETON_SLOTS = 6;

/** No year: a picker only ever shows the next few weeks. */
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
 * The appointment time the patient chose, and the location it is at.
 *
 * `providerLocationId` is not optional: the picker refuses to emit without one, since a start time
 * with nothing to book it against cannot be turned into an appointment.
 */
export interface SlotSelectDetail {
  startTime: string;
  providerLocationId: string;
}

/** Which kind of patient the times are for. Availability differs between the two. */
export interface PatientTypeChangeDetail {
  patientType: PatientType;
}

/**
 * The window a picker with supplied `timeslots` needs slots for. It's the same set of inputs a
 * fetching picker would send to the API, so the host page can make that request itself.
 */
export interface AvailabilityRequestDetail {
  providerLocationId: string;
  visitReasonId?: string;
  patientType: PatientType;
  /** The window's first day, as `YYYY-MM-DD`, after falling back to today. */
  startDate: string;
  days: number;
}

export interface ZdAvailabilityPickerEventMap {
  'slot-select': CustomEvent<SlotSelectDetail>;
  'patient-type-change': CustomEvent<PatientTypeChangeDetail>;
  'availability-error': CustomEvent<ErrorDetail>;
  'availability-request': CustomEvent<AvailabilityRequestDetail>;
}

/**
 * One heading in the stacked layout, with whatever is open beneath it.
 *
 * `startDay` and `endDay` are the same key for a day that has times. They differ only for a run
 * of days that has none, which is collapsed into a single span — see {@link ZdAvailabilityPicker.dayGroups}.
 */
interface DayGroup {
  startDay: string;
  endDay: string;
  slots: AvailabilitySlot[];
}

/**
 * The heading over one group: a single day, or the span a run of closed days covers.
 *
 * `formatRange`, not two formatted dates with a dash between them — it is what knows that
 * "Aug 8 – 11" says the same thing as "Sat, Aug 8 – Tue, Aug 11" in some locales and not others,
 * and building the phrase by concatenation is what makes it untranslatable (I18N-002, I18N-004).
 * Both it and `format` throw a `RangeError` on an invalid date, so the day key is the fallback:
 * these keys come from a `start-date` a host page can set by hand, and an exception here would
 * take the surrounding template down with it.
 */
function groupHeading(group: DayGroup): string {
  const start = providerLocalTime(group.startDay);
  const end = providerLocalTime(group.endDay);

  if (!isValidDate(start) || !isValidDate(end)) return group.startDay;
  return group.startDay === group.endDay
    ? dayLabel.format(start)
    : dayLabel.formatRange(start, end);
}

/**
 * Fetches bookable timeslots for one provider location and renders them for the patient to
 * choose from. No calendar primitive is involved — the booking flow needs a list of times, and
 * that is a list of buttons.
 *
 * **Two layouts.** `strip` is a row of days with the selected day's times beneath it, which is
 * what fits in a step of a flow. `stacked` is every day of the window in order, each with its own
 * heading and its times under it, which is the shape of the production booking modal: nothing is
 * hidden behind a day that has to be pressed first. Closed days appear in `stacked` too, as one
 * span apiece — "Sat, Aug 8 – Tue, Aug 11 / No available appointments" — because a day quietly
 * missing from the list is indistinguishable from a window that ends early.
 *
 * **Patient type is a control, not just a property.** It changes which slots the API returns, so
 * a patient who sees nothing bookable needs it within reach — often switching it is the fix. It
 * stays rendered in the empty and error states for exactly that reason, and setting it refetches.
 *
 * Emits the chosen slot rather than booking it, so it composes with `zd-patient-form` or
 * with a host page that owns its own booking step (COMP-002).
 *
 * **Handoff.** A picker whose slots came from a JSON block has nobody listening to book with, so
 * each time is a link to Zocdoc: the slot's `booking_url`, or the provider's `profile_url` when
 * the slot has none (`booking_url` is often null). Inside an iframe it opens a new tab.
 * `disable-handoff` turns that off. The patient-type
 * control is hidden in that mode too, since nobody would answer its `availability-request`;
 * `interactive` shows it again for a page that will.
 *
 * @tag zd-availability-picker
 * @event slot-select - Emitted with `{ startTime, providerLocationId }` when a time is
 *   chosen. `startTime` is the API's own string, offset included, so it can be handed
 *   back to `POST /v1/appointments` unmodified. Cancelable: `preventDefault()` stops the
 *   handoff to Zocdoc.
 * @event patient-type-change - Emitted with `{ patientType }` when the New/Existing control is
 *   used. A host page that books through its own step should follow it, since the same value has
 *   to go to `POST /v1/appointments`.
 * @event availability-error - Emitted with `{ error }` when the request fails.
 * @event availability-request - Emitted with `{ providerLocationId, visitReasonId, patientType,
 *   startDate, days }` instead of a fetch when `timeslots` is supplied and one of those inputs
 *   changes. `days` is the window the picker renders, clamped to 1–30. The picker shows its
 *   loading state until the host page answers by setting `timeslots` again.
 * @csspart patient-type - The New/Existing patient control.
 * @csspart patient-type-option - One option of that control.
 * @csspart days - The strip of days with availability. `strip` layout only.
 * @csspart day - One day button. `strip` layout only.
 * @csspart day-groups - The list of day groups. `stacked` layout only.
 * @csspart day-group - One day, or one span of closed days. `stacked` layout only.
 * @csspart day-heading - The line naming a group's day or span. `stacked` layout only.
 * @csspart day-empty - The line shown for a span with nothing open. `stacked` layout only.
 * @csspart slots - A list of times.
 * @csspart slot - One timeslot button.
 * @csspart loading-days - The placeholder days shown while availability loads.
 * @csspart skeleton - One placeholder heading or time inside them.
 */
export class ZdAvailabilityPicker extends CharmElement {
  public static override baseName = 'availability-picker';

  declare public addEventListener: TypedEventTarget<ZdAvailabilityPickerEventMap>['addEventListener'];
  declare public removeEventListener: TypedEventTarget<ZdAvailabilityPickerEventMap>['removeEventListener'];
  declare protected emit: TypedEmit<ZdAvailabilityPickerEventMap>;

  public static override styles = [...super.styles, styles] as typeof CharmElement.styles;

  /**
   * `ZdButton` is listed even though `requestStateDependencies` already carries it, for the
   * retry control. The day and time buttons are this component's own requirement, and
   * leaning on the error state's dependency list to supply them would break silently if
   * that list ever changed. Registration is idempotent, so the repeat costs nothing.
   *
   * `ZdButtonGroup` wraps the buttons with its own border when `split`, so the child buttons do
   * not need to be listed separately — they register via `ZdButtonGroup.dependencies`.
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ZdButtonGroup, ZdIcon, ZdSkeleton, ...requestStateDependencies];
  }

  /** The `pr_…|lo_…` pair to fetch availability for. Nothing is fetched without it. */
  @property({ attribute: 'provider-location-id' })
  public providerLocationId?: string;

  /** Required by the API — availability is always for a specific visit reason. */
  @property({ attribute: 'visit-reason-id' })
  public visitReasonId?: string;

  /**
   * Which patient the times are for. Also the value of the rendered control, so setting it is
   * both how a host page pre-selects an answer and what the control writes back.
   */
  @property({ attribute: 'patient-type' })
  public patientType: PatientType = 'new';

  /**
   * Drops the New/Existing patient control, leaving the times.
   *
   * What a host page sets when it asks the question itself — the production booking modal has one
   * control governing the whole panel, not one per section — and it then binds `patient-type` down.
   *
   * Named for what it does rather than as `show-patient-type`, which would default to true and
   * could then never be turned off through an attribute: a boolean attribute's presence is its
   * value.
   */
  @property({ type: Boolean, attribute: 'hide-patient-type' })
  public hidePatientType = false;

  /**
   * How the days are laid out. `strip` shows one day at a time behind a row of day buttons;
   * `stacked` shows every day of the window at once, each with its own heading.
   */
  @property()
  public layout: 'strip' | 'stacked' = 'strip';

  /**
   * The first day to ask for, as `YYYY-MM-DD`. Defaults to today, and falls back to today for
   * anything unparseable.
   *
   * A day key rather than an offset from today, because that is what the API takes and what the
   * slots are grouped by — nothing has to be converted to compare them. A host page that wants
   * the window to open tomorrow, as the production detail panel does, sets tomorrow's key.
   */
  @property({ attribute: 'start-date' })
  public startDate?: string;

  /** Size of the availability window in days, counting the first. Clamped to the API's 30. */
  @property({ type: Number })
  public days = 7;

  /**
   * The chosen slot's `start_time`. Settable so a host page that already knows the
   * selection can restore it, which is what makes going back a step work (COMP-004).
   */
  @property({ attribute: 'selected-start-time' })
  public selectedStartTime?: string;

  /**
   * The slots to show, when the host page already has them.
   *
   * `undefined` means "not supplied", which lets this component fetch its own; `[]` means
   * "supplied, and there are none", which renders the empty state and asks for nothing. While
   * supplied, a change to the window or the patient type emits `availability-request` instead
   * of fetching.
   */
  @property({ attribute: false })
  public timeslots?: readonly AvailabilitySlot[];

  /**
   * Whether the host is loading availability it supplies through `timeslots`.
   *
   * Set this while replacing supplied slots to keep stale times out of view and announce loading.
   * It does not start a request.
   */
  @property({ type: Boolean })
  public loading = false;

  /**
   * The provider the slots belong to. Only read for its `profile_url`, where a slot tap goes in
   * handoff mode when the slot has no `booking_url`.
   */
  @property({ attribute: false })
  public provider?: ProviderLocation;

  /** Stops a picker hydrated from markup from sending a slot tap to Zocdoc. */
  @property({ type: Boolean, attribute: 'disable-handoff' })
  public disableHandoff = false;

  /**
   * Says the page will answer `availability-request` itself, so a picker hydrated from markup
   * keeps its patient-type control.
   */
  @property({ type: Boolean })
  public interactive = false;

  @state()
  private fetched: readonly AvailabilitySlot[] = [];

  @state()
  private requestState: RequestState = 'idle';

  @state()
  private activeDay?: string;

  @state()
  private errorMessage?: string;

  /** Set by `availability-request` and cleared by the `timeslots` that answer it, so stale times aren't shown meanwhile. */
  @state()
  private awaitingTimeslots = false;

  /** Bumped per fetch, and when slots are supplied, so a late response can't land over newer state. */
  private loadGeneration = 0;

  /** The properties a page can supply as JSON blocks, and their shapes (see `utilities/hydrate.ts`). */
  public static hydratable: Readonly<Record<string, HydrationShape>> = {
    timeslots: 'array',
    provider: 'object',
  };

  /** Whether any property came from a JSON block, read on the first update. */
  protected hydrated = false;

  protected override scheduleUpdate(): void | Promise<unknown> {
    return afterDocumentParsed(this, () => super.scheduleUpdate());
  }

  /** Whether a slot tap goes to Zocdoc: data from markup, and the page hasn't opted out. */
  protected get handingOff(): boolean {
    return this.hydrated && !this.disableHandoff;
  }

  /**
   * Refetching belongs here rather than in `connectedCallback` because both ids usually
   * arrive as property assignments after the element is in the document — a parent step
   * sets them once the user has picked a provider. Reactive state set before the first
   * await lands in the update already in flight, so the loading state paints immediately.
   */
  protected override willUpdate(changed: PropertyValues<this>): void {
    // Applied here, so a supplied `timeslots` is in `changed` and no fetch or request starts.
    if (!this.hasUpdated) this.hydrated = hydrateFromMarkup(this, ZdAvailabilityPicker.hydratable);

    if (
      changed.has('providerLocationId') ||
      changed.has('visitReasonId') ||
      changed.has('patientType') ||
      changed.has('startDate') ||
      changed.has('days')
    ) {
      if (this.timeslots === undefined) void this.load();
      // Slots set in the same update already answer the new inputs, as on first render.
      else if (!changed.has('timeslots')) this.requestAvailability();
    } else if (changed.has('timeslots') && this.timeslots === undefined) {
      void this.load();
    }

    if (changed.has('timeslots')) this.awaitingTimeslots = false;
    if (changed.has('timeslots') && this.timeslots !== undefined) {
      this.loadGeneration += 1;
      this.activeDay = this.dayKeys[0];
      this.requestState = this.timeslots.length === 0 ? 'empty' : 'success';
      this.errorMessage = undefined;
    }
  }

  /** The slots on show: the host page's when it supplied them, otherwise the last fetch. */
  protected get slots(): readonly AvailabilitySlot[] {
    return this.timeslots ?? this.fetched;
  }

  /** Asks the host page for the current window, since supplied slots aren't this component's to fetch. */
  protected requestAvailability(): void {
    const providerLocationId = this.providerLocationId;
    if (!providerLocationId) return;

    this.awaitingTimeslots = true;
    this.emit('availability-request', {
      detail: {
        providerLocationId,
        visitReasonId: this.visitReasonId,
        patientType: this.patientType,
        startDate: this.windowStart,
        // The window the picker renders, so an answer for it fills every day on show.
        days: windowSpan(this.days),
      },
    });
  }

  /** The window's first day, falling back to today for an unset or unparseable `start-date`. */
  protected get windowStart(): string {
    return resolveWindowStart(this.startDate);
  }

  /** Fetches availability. Safe to call repeatedly; stays idle without both ids. */
  public async load(): Promise<void> {
    const providerLocationId = this.providerLocationId;

    // Supplied slots are the host page's, and fetching over them would race its own request.
    if (this.timeslots !== undefined) return;

    if (!providerLocationId || !this.visitReasonId) {
      this.requestState = 'idle';
      return;
    }

    this.requestState = 'loading';
    this.errorMessage = undefined;

    const startDate = this.windowStart;
    const generation = ++this.loadGeneration;

    try {
      const fetched = await getLocationSlots({
        providerLocationId,
        visitReasonId: this.visitReasonId,
        patientType: this.patientType,
        startDate,
        endDate: windowEndDate(startDate, this.days),
      });
      // A newer fetch, or slots the page supplied meanwhile, own the state now.
      if (generation !== this.loadGeneration) return;

      this.fetched = fetched;
      this.activeDay = this.dayKeys[0];
      this.requestState = this.slots.length === 0 ? 'empty' : 'success';
    } catch (error: unknown) {
      if (generation !== this.loadGeneration) return;
      this.requestState = 'error';
      // The raw error rides the event on purpose: the host page's handling of it is
      // developer-facing, while what reaches the DOM goes through userFacingError (PHI-001).
      this.errorMessage = userFacingError(error);
      this.emit('availability-error', { detail: { error } });
    }
  }

  /** The distinct days that have slots, in the order the API returned them. */
  private get dayKeys(): string[] {
    return [...new Set(this.slots.map((slot) => dayKey(slot.start_time)))];
  }

  /**
   * The window's days as the stacked layout shows them: one group per day that has times, and one
   * group per unbroken run of days that has none.
   *
   * Built from the window rather than from the data, so a closed day is still a line on the page.
   * Runs are collapsed because four consecutive lines each saying the practice is shut is four
   * times the reading for the same fact — production writes it as one span, and so does this.
   *
   * Slots outside the window are dropped: a `start-date` can move under a batch that was fetched
   * for a different range, and days that are not on show have nowhere to be counted.
   */
  protected get dayGroups(): DayGroup[] {
    const byDay = new Map<string, AvailabilitySlot[]>();

    for (const slot of this.slots) {
      const key = dayKey(slot.start_time);
      const existing = byDay.get(key);
      if (existing) existing.push(slot);
      else byDay.set(key, [slot]);
    }

    const groups: DayGroup[] = [];
    const span = windowSpan(this.days);

    for (let offset = 0; offset < span; offset += 1) {
      const day = addDays(this.windowStart, offset);
      const slots = byDay.get(day);

      if (slots) {
        groups.push({ startDay: day, endDay: day, slots });
        continue;
      }

      // Extends the run in place when the previous group is also empty, which is what turns four
      // closed days into one heading.
      const previous = groups.at(-1);
      if (previous && previous.slots.length === 0) previous.endDay = day;
      else groups.push({ startDay: day, endDay: day, slots: [] });
    }

    return groups;
  }

  /** Where a slot goes in handoff mode: its `booking_url`, else the provider's `profile_url`. */
  protected slotHref(slot: AvailabilitySlot): string | undefined {
    if (!this.handingOff) return undefined;
    return (
      handoffHref(slot.booking_url, 'availability-picker') ??
      handoffHref(this.provider?.provider.profile_url, 'availability-picker')
    );
  }

  /**
   * Emits `slot-select`. A slot with an `href` is a link the browser follows itself, unless a
   * listener cancels the event.
   */
  protected select(event: MouseEvent, slot: AvailabilitySlot, isLink: boolean): void {
    // Charm's `click()` on a link button fires on the host and then again on its inner `<a>`. Only
    // the `<a>` one is the tap, which is all a pointer or the keyboard ever produces.
    if (isLink && event.composedPath()[0] === event.currentTarget) return;

    const providerLocationId = this.providerLocationId;
    if (!providerLocationId) return;

    this.selectedStartTime = slot.start_time;
    const selected = this.emit('slot-select', {
      detail: { startTime: slot.start_time, providerLocationId },
      cancelable: true,
    });
    if (selected.defaultPrevented) event.preventDefault();
  }

  /**
   * `current` is Charm's own property for `aria-current` on the button's internal
   * control; setting the attribute on the host would land on a wrapper with no role and
   * never reach the accessibility tree.
   */
  protected renderDays(): unknown {
    return this.html`
      <ul class="days" part="days">
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
    return this.renderSlotList(
      this.slots.filter((slot) => dayKey(slot.start_time) === this.activeDay)
    );
  }

  /**
   * One list of times. Shared, so a day in the stacked layout and the strip's selected day
   * render the same control rather than two that drift apart.
   *
   * `fluid` fills the grid cell the list puts each time in, which is what makes every time the
   * same width — left to itself a button sizes to its own label.
   */
  protected renderSlotList(slots: readonly AvailabilitySlot[]): unknown {
    return this.html`
      <ul class="slots" part="slots">
        ${slots.map((slot) => {
          const href = this.slotHref(slot);
          return this.html`
            <li>
              <scoped-button
                part="slot"
                variant="secondary"
                fluid
                href=${href ?? nothing}
                target=${href && window.self !== window.top ? '_blank' : nothing}
                .current=${slot.start_time === this.selectedStartTime ? 'time' : undefined}
                @click=${(event: MouseEvent) => this.select(event, slot, href !== undefined)}
              >
                ${timeLabel.format(providerLocalTime(slot.start_time))}${href ? this.html`<span class="visually-hidden">, opens Zocdoc</span>` : nothing}
              </scoped-button>
            </li>
          `;
        })}
      </ul>
    `;
  }

  /**
   * Every day of the window, in order, as a list so a screen reader says how many groups there
   * are before the user starts moving through them.
   *
   * The day line is a paragraph rather than a heading. A heading needs a level, and this component
   * cannot know its host's outline — an `h3` under someone else's `h4` is the `heading-order`
   * violation, and guessing wrong is worse than not claiming to be a heading at all. The list
   * already supplies the grouping and the count.
   */
  protected renderDayGroups(): unknown {
    return this.html`
      <ol class="day-groups" part="day-groups">
        ${this.dayGroups.map(
          (group) => this.html`
            <li part="day-group">
              <p class="day-heading" part="day-heading">${groupHeading(group)}</p>
              ${
                group.slots.length === 0
                  ? this.html`<p class="day-empty" part="day-empty">No available appointments</p>`
                  : this.renderSlotList(group.slots)
              }
            </li>
          `
        )}
      </ol>
    `;
  }

  /**
   * Placeholder day groups while the window loads, shaped like the stacked layout's heading and
   * times so the space they hold is roughly what arrives.
   *
   * Hidden from assistive technology: the status region from `renderRequestState` already says
   * "Loading appointment times…", and that is the one announcement (A11Y-002). The heading
   * placeholder holds a blank line in the heading's own class, so it is as tall as the real one.
   */
  protected renderLoadingDays(): unknown {
    return this.html`
      <ol class="day-groups" part="loading-days" aria-hidden="true">
        ${Array.from(
          { length: SKELETON_DAYS },
          () => this.html`
            <li>
              <p class="day-heading heading-placeholder">
                <scoped-skeleton class="skeleton heading" part="skeleton" animation="wave"></scoped-skeleton>
                &nbsp;
              </p>
              <ul class="slots">
                ${Array.from(
                  { length: SKELETON_SLOTS },
                  () => this.html`
                    <li>
                      <scoped-skeleton class="skeleton slot" part="skeleton" animation="wave"></scoped-skeleton>
                    </li>
                  `
                )}
              </ul>
            </li>
          `
        )}
      </ol>
    `;
  }

  /**
   * The New/Existing control, as a radio group: two mutually exclusive answers that filter what
   * is shown is what radios are for, and the primitive brings the roving tabindex and the arrow
   * keys with it. Grouped and labelled rather than left as two bare controls (A11Y-004).
   */
  protected renderPatientType(): unknown {
    if (this.hidePatientType || (this.handingOff && !this.interactive)) return nothing;

    return this.html`
      <scoped-button-group
        class="patient-type"
        part="patient-type"
        select="single"
        split
        label="Patient type"
        @click=${(event: Event) => {
          const button = event.target as HTMLElement & { value?: unknown };
          if (button.matches('[part="patient-type-option"]')) {
            this.selectPatientType(button.value);
          }
        }}
      >
        <scoped-button part="patient-type-option" variant="ghost" value="new" ?pressed=${this.patientType === 'new'}>
          ${this.patientType === 'new' ? this.html`<scoped-icon slot="start" name="checkmark"></scoped-icon>` : nothing}
          New patient
        </scoped-button>
        <scoped-button part="patient-type-option" variant="ghost" value="existing" ?pressed=${this.patientType === 'existing'}>
          ${this.patientType === 'existing' ? this.html`<scoped-icon slot="start" name="checkmark"></scoped-icon>` : nothing}
          Existing patient
        </scoped-button>
      </scoped-button-group>
    `;
  }

  /**
   * Narrowed rather than cast: the value arrives as whatever string the group holds, and the two
   * the API accepts are the only two worth refetching for. Assigning it is what refetches — see
   * `willUpdate`.
   */
  protected selectPatientType(value: unknown): void {
    if (value !== 'new' && value !== 'existing') return;
    if (value === this.patientType) return;

    this.patientType = value;
    this.emit('patient-type-change', { detail: { patientType: value } });
  }

  /**
   * The patient-type control sits outside the request state, so it survives `empty` and `error`.
   * That is the point of rendering it at all: a window with nothing bookable for a new patient
   * often has something for a returning one, and the control that finds out has to still be there.
   *
   * The placeholders sit in a region marked busy while times load, kept apart from the status so a
   * screen reader still announces it (A11Y-002).
   */
  protected override render(): unknown {
    const requestState = this.loading || this.awaitingTimeslots ? 'loading' : this.requestState;
    return this.html`
      ${this.renderPatientType()}
      ${renderRequestState(requestState, {
        emptyMessage: 'No appointments available in this range.',
        errorMessage: this.errorMessage,
        loadingMessage: 'Loading appointment times…',
        onRetry: () => void this.load(),
        // The days render in the busy region below rather than through the helper, so the
        // placeholders and what replaces them share one container.
        children: () => nothing,
      })}
      <div class="days-region" aria-busy=${requestState === 'loading' ? 'true' : 'false'}>
        ${this.renderDaysRegion(requestState)}
      </div>
    `;
  }

  protected renderDaysRegion(requestState: RequestState = this.requestState): unknown {
    if (requestState === 'loading') return this.renderLoadingDays();
    if (requestState !== 'success') return nothing;

    return this.layout === 'stacked'
      ? this.renderDayGroups()
      : this.html`${this.renderDays()} ${this.renderSlots()}`;
  }
}
