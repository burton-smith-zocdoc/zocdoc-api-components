import { html, nothing, type TemplateResult } from 'lit';
import {
  getAvailability,
  MAX_AVAILABILITY_DAYS,
  type AvailabilityParams,
} from '../../client/availability.js';
import type { AvailabilitySlot } from '../../client/types.js';
import { addDays, isValidDate, providerLocalTime, todayDayKey } from './provider-time.js';

/** UTC so it reports the provider's own wall clock — see {@link providerLocalTime}. */
const rangeLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/**
 * The window's first day, given whatever a host page supplied.
 *
 * Falls back to today for anything unparseable, because `start-date` is an attribute written by
 * hand and carrying a bad value through gives one cell labelled with it and a range line that
 * cannot be formatted at all. Today's window is merely not the one that was asked for.
 */
export function resolveWindowStart(startDate: string | undefined): string {
  const today = todayDayKey();
  if (!startDate) return today;
  return isValidDate(providerLocalTime(startDate)) ? startDate : today;
}

/** The window's last day, inclusive — so a fourteen-day window ends thirteen days along. */
export function windowEndDate(startDate: string, days: number): string {
  return addDays(startDate, windowSpan(days) - 1);
}

/** The window's width in days, clamped to what the API accepts, and never less than one. */
export function windowSpan(days: number): number {
  // Written this way round so a `NaN` — which is what `days="ten"` parses to — is caught too.
  return days > 0 ? Math.min(days, MAX_AVAILABILITY_DAYS) : 1;
}

/**
 * Where the window lands after a step, moving by its own width so the ranges tile rather than
 * overlap.
 *
 * Never earlier than today: the API returns nothing in the past, so a window that starts behind
 * it is guaranteed to come back empty and read as no availability at all. Returns the current
 * start when there is nowhere to go, which is a caller's cue to say nothing.
 */
export function nextWindowStart(startDate: string, direction: -1 | 1, days: number): string {
  const today = todayDayKey();
  const target = addDays(startDate, direction * windowSpan(days));
  return target < today ? today : target;
}

/**
 * One location's slots for a window, for the components that fetch their own.
 *
 * `GET /v1/availability` takes a list and answers with a list, so a caller wanting one location
 * has to pick its entry back out. The entry comes back even with no open slots, which is why
 * this matches on the id rather than taking `entries[0]`: an absent entry means a *different*
 * location answered, and reading position zero would quietly show one provider's times under
 * another's name. No match and no slots both yield `[]` — an empty window, not an error.
 */
export async function getLocationSlots(
  params: Omit<AvailabilityParams, 'providerLocationIds'> & { providerLocationId: string }
): Promise<AvailabilitySlot[]> {
  const { providerLocationId, ...rest } = params;
  const entries = await getAvailability({ ...rest, providerLocationIds: [providerLocationId] });

  return (
    entries.find((entry) => entry.provider_location_id === providerLocationId)?.timeslots ?? []
  );
}

export interface AvailabilityWindowOptions {
  /** The window's first day, as `YYYY-MM-DD`. */
  startDate: string;
  /** The window's last day, inclusive, as `YYYY-MM-DD`. */
  endDate: string;
  /**
   * Whether there is anywhere earlier to go. False at today, because the API returns nothing in
   * the past and a window behind it comes back empty — which reads as no availability at all.
   */
  canGoEarlier: boolean;
  onShift: (direction: -1 | 1) => void;
}

/**
 * The range on show with a control on each side, shared by `zd-availability-grid` and
 * `zd-provider-results` so a page with both does not end up with two different ones.
 *
 * Two things worth knowing before editing:
 *
 * - **`formatRange`, not two formatted dates with a dash between them.** It is what knows that
 *   "Aug 5 – 18" says the same thing as "Aug 5 – Aug 18" in this locale and not in others, and
 *   building the phrase by concatenation is what makes it untranslatable (I18N-002, I18N-004).
 *   It throws a `RangeError` on an invalid date, hence the guard — these are day keys derived
 *   from an attribute a host page can set by hand, and an exception here would take the whole
 *   surrounding template down with it. The range line is dropped instead; the controls stay,
 *   since they are what gets the patient somewhere valid.
 * - **Each control is an arrow with its name beside it**, out of view but present in the DOM.
 *   That text node is the button's accessible name and a browser can translate it (I18N-001),
 *   which an `aria-label` could not be. The arrow itself is hidden, since "‹" is not a word.
 *
 * Exposes `window`, `window-range`, `window-previous`, and `window-next` as CSS parts of
 * whichever component calls it. Pair it with `availability-window.styles.js`, which carries the
 * layout and the rule that hides the labels.
 */
export function renderAvailabilityWindow(options: AvailabilityWindowOptions): TemplateResult {
  const start = providerLocalTime(options.startDate);
  const end = providerLocalTime(options.endDate);
  const range =
    isValidDate(start) && isValidDate(end) ? rangeLabel.formatRange(start, end) : undefined;

  return html`
    <div part="window">
      <button
        part="window-previous"
        type="button"
        ?disabled=${!options.canGoEarlier}
        @click=${() => options.onShift(-1)}
      >
        <span aria-hidden="true">&lsaquo;</span>
        <span class="window-label">Earlier dates</span>
      </button>

      ${range === undefined ? nothing : html`<p part="window-range">${range}</p>`}

      <button part="window-next" type="button" @click=${() => options.onShift(1)}>
        <span class="window-label">Later dates</span>
        <span aria-hidden="true">&rsaquo;</span>
      </button>
    </div>
  `;
}
