import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as availability from '../../client/availability.js';
import { ZocdocError } from '../../client/errors.js';
import { buildTimeslots, SCENARIOS } from '../../client/mock/fixtures.js';
import type { AvailabilitySlot, ProviderLocationAvailability } from '../../client/types.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { dayFromToday } from '../../utils/test/dates.js';
import { mount, part, parts, settled, shadow, texts } from '../../utils/test/mount.js';
import './index.js';

/**
 * `{ spy: true }` keeps the real implementations but makes every export a spy, which is what
 * lets `vi.spyOn` redefine them (TEST-002). Without it the exports of a Vite-served ES module
 * are non-configurable in browser mode and `vi.spyOn` throws.
 */
vi.mock('../../client/availability.js', { spy: true });

const PROVIDER_LOCATION_ID = 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';
const VISIT_REASON_ID = 'pc_FRO-18leckytNKtruw5dLR';

const TODAY = dayFromToday(0);
const TOMORROW = dayFromToday(1);

/**
 * Two slots today and one tomorrow, built by the same generator the mock transport uses so the
 * shape and the `-04:00` offset match what the sandbox sends (TEST-003).
 */
function slots(): AvailabilitySlot[] {
  return [...buildTimeslots(TODAY, ['14:00', '15:30']), ...buildTimeslots(TOMORROW, ['09:00'])];
}

function entry(timeslots = slots()): ProviderLocationAvailability[] {
  return [
    {
      provider_location_id: PROVIDER_LOCATION_ID,
      first_availability: timeslots[0] ?? null,
      timeslots,
    },
  ];
}

type Grid = HTMLElement & {
  providerLocationId?: string;
  visitReasonId?: string;
  timeslots?: AvailabilitySlot[];
  startDate?: string;
  selectedDay?: string;
  days: number;
  showMore: boolean;
  load(): Promise<void>;
  shiftWindow(direction: -1 | 1): void;
};

/** Native buttons throughout, so these really are `HTMLButtonElement`s. */
function dayCells(element: Grid): HTMLButtonElement[] {
  return parts<HTMLButtonElement>(element, 'day');
}

function windowControl(element: Grid): HTMLElement | null {
  return shadow(element).querySelector('zd-availability-window');
}

function windowButton(element: Grid, direction: 'previous' | 'next'): HTMLButtonElement {
  const windowEl = windowControl(element);
  if (!windowEl) throw new Error('availability-grid rendered no window control');
  const btn = windowEl.shadowRoot?.querySelector<HTMLButtonElement>(`[part~="window-${direction}"]`);
  if (!btn) throw new Error(`window control rendered no [part~="window-${direction}"]`);
  return btn;
}

/** The prop-driven way in: slots supplied, so nothing is fetched. */
async function mountSupplied(markup = '', timeslots = slots()): Promise<Grid> {
  const element = await mount<Grid>(
    `<zd-availability-grid provider-location-id="${PROVIDER_LOCATION_ID}" ${markup}></zd-availability-grid>`
  );
  element.timeslots = timeslots;
  await settled(element);
  return element;
}

/** The self-fetching way in: both ids, which is the only combination that fetches. */
async function mountFetching(markup = ''): Promise<Grid> {
  const element = await mount<Grid>(
    `<zd-availability-grid visit-reason-id="${VISIT_REASON_ID}" ${markup}></zd-availability-grid>`
  );
  element.providerLocationId = PROVIDER_LOCATION_ID;
  await settled(element);
  return element;
}

describe('zd-availability-grid', () => {
  beforeEach(() => {
    vi.spyOn(availability, 'getAvailability').mockResolvedValue(entry());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('the window of days', () => {
    /*
     * The cells come from the dates, not from the data. A fortnight has fourteen days whether
     * or not the practice is open on them, and a grid that shrank to fit the slots would
     * change shape every time the patient paged.
     */
    it('renders one cell per day of the window, appointments or not', async () => {
      const element = await mountSupplied();

      expect(dayCells(element)).toHaveLength(14);
    });

    it('renders as many cells as days asks for', async () => {
      const element = await mountSupplied('days="7"');

      expect(dayCells(element)).toHaveLength(7);
    });

    // The API rejects an end date more than 30 days out, and a 400 would reach the user as a
    // generic failure with nothing to act on.
    it('clamps the window to the thirty days the API allows', async () => {
      const element = await mountSupplied('days="90"');

      expect(dayCells(element)).toHaveLength(30);
      expect(element.days).toBe(90);
    });

    /*
     * Which day the first cell is is read off the counts rather than off its formatted date,
     * since the fixture puts two slots on today and one on tomorrow. A window that started a
     * day late would report tomorrow's single slot first.
     */
    it('starts at today by default, and at start-date when given one', async () => {
      const fromToday = await mountSupplied();
      expect(texts(fromToday, 'day-count')[0]).toBe('2 appts');

      const fromTomorrow = await mountSupplied(`start-date="${TOMORROW}"`);
      expect(texts(fromTomorrow, 'day-count')[0]).toBe('1 appt');
    });

    /**
     * `formatRange` rather than two dates with a dash between them, so the locale decides
     * whether the month repeats. Matched loosely for the same reason — the separator is its
     * business, the two dates are what must be there.
     */
    it('names both ends of the range on show', async () => {
      const element = await mountSupplied('days="14"');
      const windowEl = windowControl(element)!;
      const range = windowEl.shadowRoot!.querySelector('[part~="window-range"]')?.textContent ?? '';

      // Both ends inclusive, so a fortnight from today ends thirteen days along.
      expect(range).toContain(String(Number(TODAY.slice(8))));
      expect(range).toContain(String(Number(dayFromToday(13).slice(8))));
    });

    /**
     * `start-date` is an attribute a host page writes by hand, and `formatRange` throws a
     * `RangeError` on an invalid date — which would take the surrounding markup down with it.
     * Today's window is merely not the one asked for; one cell labelled "next tuesday" is broken.
     */
    it('falls back to today when the start date cannot be read', async () => {
      const element = await mountSupplied('start-date="next tuesday"');

      expect(dayCells(element)).toHaveLength(14);
      expect(texts(element, 'day-count')[0]).toBe('2 appts');
      expect(texts(element, 'window-range')[0]).not.toBe('');
    });
  });

  describe('the counts', () => {
    it('counts the slots supplied, per day', async () => {
      const element = await mountSupplied();
      const counts = texts(element, 'day-count');

      expect(counts[0]).toBe('2 appts');
      expect(counts[1]).toBe('1 appt');
      expect(counts[2]).toBe('No appts');
    });

    /*
     * A batched fetch covers whatever range the parent asked for, which is not necessarily
     * the one on show. Slots outside it belong to a window the patient has not paged to.
     */
    it('ignores slots outside the window on show', async () => {
      const element = await mountSupplied('days="1"');

      expect(texts(element, 'day-count')).toEqual(['2 appts']);
    });

    /*
     * The count line is what carries the distinction, so it never rests on the yellow-versus-
     * grey surface alone (A11Y-001). "No appts" rather than "0 appts", which reads as a fault.
     */
    it('says a day has nothing rather than showing it a zero', async () => {
      const element = await mountSupplied('', []);

      expect(texts(element, 'day-count').every((text) => text === 'No appts')).toBe(true);
    });

    it('disables a day with nothing open', async () => {
      const element = await mountSupplied();
      const cells = dayCells(element);

      expect(cells[0]!.disabled).toBe(false);
      expect(cells[1]!.disabled).toBe(false);
      expect(cells[2]!.disabled).toBe(true);
    });

    /*
     * Slot times carry the provider's offset, so a 9pm Eastern slot is the following morning
     * in UTC. Grouping on a parsed date would move it to the next cell for anyone east of the
     * practice, which is the regression this guards.
     */
    it('keeps a late slot on the provider’s own day', async () => {
      const element = await mountSupplied('', buildTimeslots(TODAY, ['21:30']));

      expect(texts(element, 'day-count')[0]).toBe('1 appt');
      expect(texts(element, 'day-count')[1]).toBe('No appts');
    });
  });

  describe('choosing a day', () => {
    it('emits day-select with the day and the provider location', async () => {
      const element = await mountSupplied();
      const events: CustomEvent[] = [];
      element.addEventListener('day-select', (event) => events.push(event as CustomEvent));

      dayCells(element)[0]!.click();

      expect(events).toHaveLength(1);
      expect(events[0]!.detail.day).toBe(TODAY);
      expect(events[0]!.detail.providerLocationId).toBe(PROVIDER_LOCATION_ID);
    });

    it('marks the chosen day with aria-selected', async () => {
      const element = await mountSupplied();

      dayCells(element)[1]!.click();
      await settled(element);

      expect(element.selectedDay).toBe(TOMORROW);
      expect(dayCells(element)[1]!.getAttribute('aria-selected')).toBe('true');
      expect(dayCells(element)[0]!.getAttribute('aria-selected')).toBe('false');
    });

    /** Settable so a host page resuming a booking can restore what was picked (COMP-004). */
    it('marks a day a host page set without a click', async () => {
      const element = await mountSupplied(`selected-day="${TOMORROW}"`);

      expect(dayCells(element)[1]!.getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('the window pager', () => {
    /*
     * The API returns nothing in the past, so a window that starts behind today comes back
     * empty and reads as no availability at all.
     */
    it('cannot go earlier than today', async () => {
      const element = await mountSupplied();

      expect(windowButton(element, 'previous').hasAttribute('disabled')).toBe(true);
    });

    it('moves forward by the width of the window and says so', async () => {
      const element = await mountSupplied();
      const events: CustomEvent[] = [];
      element.addEventListener('window-change', (event) => events.push(event as CustomEvent));

      windowButton(element, 'next').click();
      await settled(element);

      expect(element.startDate).toBe(dayFromToday(14));
      expect(events).toHaveLength(1);
      // Inclusive of both ends, so a fortnight from day 14 ends on day 27, not day 28.
      expect(events[0]!.detail).toEqual({
        startDate: dayFromToday(14),
        endDate: dayFromToday(27),
      });
    });

    it('goes back once it has somewhere to go back to', async () => {
      const element = await mountSupplied();

      windowButton(element, 'next').click();
      await settled(element);
      expect(windowButton(element, 'previous').hasAttribute('disabled')).toBe(false);

      windowButton(element, 'previous').click();
      await settled(element);

      expect(element.startDate).toBe(TODAY);
    });

    /** Clamped rather than trusted: `start-date` is a settable property as well as a control. */
    it('clamps a step back past today to today', async () => {
      const element = await mountSupplied(`start-date="${dayFromToday(4)}"`);
      const events: CustomEvent[] = [];
      element.addEventListener('window-change', (event) => events.push(event as CustomEvent));

      element.shiftWindow(-1);
      await settled(element);

      expect(element.startDate).toBe(TODAY);
      expect(events[0]!.detail.startDate).toBe(TODAY);
    });

    it('says nothing when the window has not moved', async () => {
      const element = await mountSupplied();
      const events: CustomEvent[] = [];
      element.addEventListener('window-change', (event) => events.push(event as CustomEvent));

      element.shiftWindow(-1);
      await settled(element);

      expect(events).toHaveLength(0);
    });

    /*
     * The control's name is a text node out of view rather than an `aria-label`, so a browser
     * can translate it (I18N-001). Its arrow is hidden, since "‹" is not a word.
     */
    it('names its controls in the DOM rather than in an attribute', async () => {
      const element = await mountSupplied();
      const previous = windowButton(element, 'previous');

      expect(previous.hasAttribute('aria-label')).toBe(false);
      expect(previous.textContent).toContain('Earlier dates');
      expect(windowButton(element, 'next').textContent).toContain('Later dates');
    });

    /*
     * What a results list sets on every card, because the production search page has one range
     * control above the list rather than ten of them disagreeing.
     */
    it('drops its own control on hide-window, keeping the days', async () => {
      const element = await mountSupplied('hide-window');

      expect(windowControl(element)).toBeNull();
      expect(dayCells(element)).toHaveLength(14);
    });

    /*
     * Hidden, not removed. Whoever owns the shared control moves every card by binding
     * `start-date` down, and this is the path that has to keep working for that.
     */
    it('still moves when driven from outside with the control hidden', async () => {
      const element = await mountSupplied('hide-window');
      const events: CustomEvent[] = [];
      element.addEventListener('window-change', (event) => events.push(event as CustomEvent));

      element.shiftWindow(1);
      await settled(element);

      expect(events).toHaveLength(1);
      expect(element.startDate).toBe(dayFromToday(14));
    });
  });

  describe('the More control', () => {
    it('is absent by default, because nothing here knows where it goes', async () => {
      const element = await mountSupplied();

      expect(shadow(element).querySelector('[part="more"]')).toBeNull();
    });

    it('emits more-select when it is shown and pressed', async () => {
      const element = await mountSupplied('show-more');
      const events: Event[] = [];
      element.addEventListener('more-select', (event) => events.push(event));

      shadow(element).querySelector<HTMLElement>('[part="more"]')!.click();

      expect(events).toHaveLength(1);
    });
  });

  describe('supplied slots', () => {
    it('fetches nothing when a parent hands it slots', async () => {
      await mountSupplied();

      expect(availability.getAvailability).not.toHaveBeenCalled();
    });

    /*
     * A parent mid-request should hand back `[]`, not drop the binding — which is the whole
     * reason the two are distinguished. `[]` means "there are none", and asks for nothing.
     */
    it('treats an empty array as an answer, not as a missing one', async () => {
      const element = await mountSupplied('', []);
      element.visitReasonId = VISIT_REASON_ID;
      await settled(element);

      expect(availability.getAvailability).not.toHaveBeenCalled();
      expect(dayCells(element)).toHaveLength(14);
    });

    it('takes fetching back over when the binding is dropped', async () => {
      const element = await mountSupplied();
      element.visitReasonId = VISIT_REASON_ID;
      await settled(element);
      expect(availability.getAvailability).not.toHaveBeenCalled();

      element.timeslots = undefined;
      await settled(element);

      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));
    });

    /*
     * A prop-driven grid cannot fetch the range it just asked for — without a visit reason
     * there is nothing the API would accept — so the event is the whole mechanism (COMP-002).
     */
    it('reports a window change it cannot perform', async () => {
      const element = await mountSupplied();
      const events: CustomEvent[] = [];
      element.addEventListener('window-change', (event) => events.push(event as CustomEvent));

      element.shiftWindow(1);
      await settled(element);

      expect(events).toHaveLength(1);
      expect(availability.getAvailability).not.toHaveBeenCalled();
    });
  });

  describe('fetching for itself', () => {
    it('stays idle without a provider location', async () => {
      await mount(
        `<zd-availability-grid visit-reason-id="${VISIT_REASON_ID}"></zd-availability-grid>`
      );

      expect(availability.getAvailability).not.toHaveBeenCalled();
    });

    it('stays idle with a provider location but no visit reason', async () => {
      const element = await mount<Grid>(
        `<zd-availability-grid provider-location-id="${PROVIDER_LOCATION_ID}"></zd-availability-grid>`
      );
      await settled(element);

      expect(availability.getAvailability).not.toHaveBeenCalled();
    });

    it('fetches once both ids are set, and counts what came back', async () => {
      const element = await mountFetching();
      await vi.waitFor(() => expect(texts(element, 'day-count')[0]).toBe('2 appts'));

      expect(availability.getAvailability).toHaveBeenCalledTimes(1);
    });

    /** Both ends inclusive, so the request covers exactly the days on show and no more. */
    it('asks for exactly the window it renders', async () => {
      const element = await mountFetching('days="14"');
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalled());

      const [params] = vi.mocked(availability.getAvailability).mock.calls.at(-1)!;

      expect(params.startDate).toBe(TODAY);
      expect(params.endDate).toBe(dayFromToday(13));
      expect(dayCells(element)).toHaveLength(14);
    });

    it('clamps the requested range to the thirty days the API allows', async () => {
      await mountFetching('days="90"');
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalled());

      const [params] = vi.mocked(availability.getAvailability).mock.calls.at(-1)!;
      const start = Date.parse(`${params.startDate}T00:00:00Z`);
      const end = Date.parse(`${params.endDate}T00:00:00Z`);

      expect((end - start) / 86_400_000).toBe(29);
    });

    it('refetches when the window moves', async () => {
      const element = await mountFetching();
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));

      element.shiftWindow(1);
      await settled(element);

      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(2));
      const [params] = vi.mocked(availability.getAvailability).mock.calls.at(-1)!;
      expect(params.startDate).toBe(dayFromToday(14));
    });

    it('refetches when the visit reason changes', async () => {
      const element = await mountFetching();
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));

      element.visitReasonId = 'pc_a-different-reason';
      await settled(element);

      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(2));
    });
  });

  describe('request states', () => {
    // COMP-001. A location with no open slots is a successful request, not a failure — the API
    // returns the entry either way.
    it('announces an empty range but keeps the days on show', async () => {
      vi.mocked(availability.getAvailability).mockResolvedValue([
        {
          provider_location_id: SCENARIOS.providerLocationNoAvailability,
          first_availability: null,
          timeslots: [],
        },
      ]);

      const element = await mount<Grid>(
        `<zd-availability-grid visit-reason-id="${VISIT_REASON_ID}"></zd-availability-grid>`
      );
      element.providerLocationId = SCENARIOS.providerLocationNoAvailability;

      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="empty"]')).not.toBeNull()
      );

      // The pager is the only way out of an empty range, so it has to survive the message.
      expect(dayCells(element)).toHaveLength(14);
      expect(windowControl(element)).not.toBeNull();
      expect(shadow(element).querySelector('[part="error"]')).toBeNull();
    });

    /*
     * Counts that are all zero because the call failed would say "No appts" fourteen times for
     * a practice that may well be open, and the retry button beside them would contradict it.
     */
    it('hides the days while loading and after a failure', async () => {
      vi.mocked(availability.getAvailability).mockReturnValue(new Promise(() => {}));

      const element = await mountFetching();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="loading"]')).not.toBeNull()
      );

      expect(dayCells(element)).toHaveLength(0);
    });

    it('renders the error state and emits availability-error when the request fails', async () => {
      vi.mocked(availability.getAvailability).mockRejectedValue(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      const element = await mount<Grid>(
        `<zd-availability-grid visit-reason-id="${VISIT_REASON_ID}"></zd-availability-grid>`
      );

      const errors: CustomEvent[] = [];
      element.addEventListener('availability-error', (event) => errors.push(event as CustomEvent));

      element.providerLocationId = SCENARIOS.providerLocationError;

      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="error"]')).not.toBeNull()
      );

      expect(errors).toHaveLength(1);
      expect(dayCells(element)).toHaveLength(0);
    });

    // CLIENT-003. The developer-facing message names the status and the body can echo a
    // submitted value, so neither may reach the DOM. The raw error still rides the event.
    it('shows user-facing copy rather than the raw API error', async () => {
      vi.mocked(availability.getAvailability).mockRejectedValue(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      const element = await mountFetching();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="error"]')).not.toBeNull()
      );

      const text = shadow(element).querySelector('[part="error"]')?.textContent ?? '';
      expect(text).toContain('Something went wrong');
      expect(text).not.toContain('500');
    });

    it('retries from the error state', async () => {
      vi.mocked(availability.getAvailability).mockRejectedValueOnce(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      const element = await mountFetching();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="retry"]')).not.toBeNull()
      );

      shadow(element).querySelector<HTMLElement>('[part="retry"]')!.click();

      await vi.waitFor(() => expect(texts(element, 'day-count')[0]).toBe('2 appts'));
    });
  });

  // A11Y-005 asks for more than the default state, and each of these renders different markup:
  // a grid of buttons inside a list, a status region, and an alert with a retry.
  describe('accessibility', () => {
    it('has no violations with counts rendered', async () => {
      const element = await mountSupplied();

      await expectNoViolations(element);
    });

    it('has no violations with every day disabled', async () => {
      const element = await mountSupplied('', []);

      await expectNoViolations(element);
    });

    it('has no violations with a day chosen and More shown', async () => {
      const element = await mountSupplied(`show-more selected-day="${TODAY}"`);

      await expectNoViolations(element);
    });

    it('has no violations while loading', async () => {
      // Left unresolved on purpose, so the loading leg is what axe sees.
      vi.mocked(availability.getAvailability).mockReturnValue(new Promise(() => {}));

      const element = await mountFetching();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="loading"]')).not.toBeNull()
      );

      await expectNoViolations(element);
    });

    it('has no violations in the empty state', async () => {
      vi.mocked(availability.getAvailability).mockResolvedValue([
        { provider_location_id: PROVIDER_LOCATION_ID, first_availability: null, timeslots: [] },
      ]);

      const element = await mountFetching();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="empty"]')).not.toBeNull()
      );

      await expectNoViolations(element);
    });

    it('has no violations in the error state', async () => {
      vi.mocked(availability.getAvailability).mockRejectedValue(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      const element = await mountFetching();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="error"]')).not.toBeNull()
      );

      await expectNoViolations(element);
    });
  });
});
