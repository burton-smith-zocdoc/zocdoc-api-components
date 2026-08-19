import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as availability from '../../client/availability.js';
import { ZocdocError } from '../../client/errors.js';
import { buildTimeslots, SCENARIOS } from '../../client/mock/fixtures.js';
import type { ProviderLocationAvailability } from '../../client/types.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { dayFromToday } from '../../utils/test/dates.js';
import { mount, parts, settled, shadow, texts } from '../../utils/test/mount.js';
import './index.js';

/**
 * `{ spy: true }` keeps the real implementations but makes every export a spy, which is
 * what lets `vi.spyOn` redefine them (TEST-002). Without it the exports of a Vite-served
 * ES module are non-configurable in browser mode and `vi.spyOn` throws.
 */
vi.mock('../../client/availability.js', { spy: true });

const PROVIDER_LOCATION_ID = 'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';
const VISIT_REASON_ID = 'pc_FRO-18leckytNKtruw5dLR';

/**
 * Two days, built by the same generator the mock transport uses so the shape and the
 * `-04:00` offset match what the sandbox sends (TEST-003). The dates are fixed rather
 * than relative because nothing here asks the API for a window — `getAvailability` is
 * mocked, so what matters is only that the two days differ.
 */
const FIRST_DAY = '2026-08-05';
const SECOND_DAY = '2026-08-06';

function entry(
  timeslots = [
    ...buildTimeslots(FIRST_DAY, ['14:00', '15:30']),
    ...buildTimeslots(SECOND_DAY, ['09:00']),
  ]
): ProviderLocationAvailability[] {
  return [
    {
      provider_location_id: PROVIDER_LOCATION_ID,
      first_availability: timeslots[0] ?? null,
      timeslots,
    },
  ];
}

type Picker = HTMLElement & {
  providerLocationId?: string;
  visitReasonId?: string;
  selectedStartTime?: string;
  patientType: 'new' | 'existing';
  layout: 'strip' | 'stacked';
  startDate?: string;
  days: number;
  load(): Promise<void>;
};

/**
 * The window the component asked for on its most recent call — not its first, so these stay right
 * if setting the ids ever costs more than one fetch.
 */
function lastParams(): Parameters<typeof availability.getAvailability>[0] {
  const [params] = vi.mocked(availability.getAvailability).mock.calls.at(-1)!;
  return params;
}

/** How many days lie between the requested `startDate` and `endDate`. */
function windowLength(): number {
  const params = lastParams();
  const start = Date.parse(`${params.startDate}T00:00:00Z`);
  const end = Date.parse(`${params.endDate}T00:00:00Z`);
  return (end - start) / 86_400_000;
}

function options(element: Picker): HTMLElement[] {
  return parts(element, 'patient-type-option');
}

/** Sets both ids at once, which is the only combination that fetches. */
async function mountReady(markup = ''): Promise<Picker> {
  const element = await mount<Picker>(
    `<zd-availability-picker visit-reason-id="${VISIT_REASON_ID}" ${markup}></zd-availability-picker>`
  );
  element.providerLocationId = PROVIDER_LOCATION_ID;
  await settled(element);
  return element;
}

describe('zd-availability-picker', () => {
  beforeEach(() => {
    vi.spyOn(availability, 'getAvailability').mockResolvedValue(entry());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stays idle until it has a provider location id', async () => {
    await mount(
      `<zd-availability-picker visit-reason-id="${VISIT_REASON_ID}"></zd-availability-picker>`
    );
    expect(availability.getAvailability).not.toHaveBeenCalled();
  });

  it('stays idle with a provider location but no visit reason', async () => {
    const element = await mount<Picker>(
      `<zd-availability-picker provider-location-id="${PROVIDER_LOCATION_ID}"></zd-availability-picker>`
    );
    await settled(element);

    expect(availability.getAvailability).not.toHaveBeenCalled();
  });

  it('fetches once both ids are set', async () => {
    await mountReady();
    await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));
  });

  // The API rejects a window wider than 30 days, and a 400 would reach the user as a
  // generic failure with nothing to act on.
  it('clamps the requested window to the thirty days the API allows', async () => {
    const element = await mountReady('days="90"');
    await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalled());

    // 29, not 30: `days` counts the first day, so a thirty-day window ends twenty-nine days
    // along. The endpoint's own limit is that `endDate` be within thirty days of `startDate`,
    // which this is — and the stacked layout renders one group per day, so an off-by-one here
    // would show a day the request never covered.
    expect(windowLength()).toBe(29);
    expect(element.days).toBe(90);
  });

  it('asks for as many days as it was told to show, counting the first', async () => {
    await mountReady('days="7"');
    await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalled());

    expect(windowLength()).toBe(6);
  });

  describe('the start of the window', () => {
    it('starts today by default', async () => {
      await mountReady();
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalled());

      expect(lastParams().startDate).toBe(dayFromToday(0));
    });

    /*
     * The production detail panel opens on tomorrow rather than today, which is a host page's
     * decision — hence a day key rather than a flag. This is that case.
     */
    it('starts where it is told to', async () => {
      await mountReady(`start-date="${dayFromToday(1)}"`);
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalled());

      expect(lastParams().startDate).toBe(dayFromToday(1));
    });

    it('refetches when the start moves', async () => {
      const element = await mountReady();
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));

      element.startDate = dayFromToday(7);
      await settled(element);

      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(2));
      expect(lastParams().startDate).toBe(dayFromToday(7));
    });

    // An attribute written by hand can be anything. Today's window is not the one that was
    // asked for, but it is a window — where `Invalid Date` would ask for `NaN-NaN-NaN`.
    it('falls back to today for a start it cannot parse', async () => {
      await mountReady('start-date="next Tuesday"');
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalled());

      expect(lastParams().startDate).toBe(dayFromToday(0));
    });
  });

  it('groups slots into one day button per distinct date', async () => {
    const element = await mountReady();

    await vi.waitFor(() =>
      expect(shadow(element).querySelectorAll('[part="day"]')).toHaveLength(2)
    );
  });

  it('shows only the selected day’s times, and switches on click', async () => {
    const element = await mountReady();
    await vi.waitFor(() =>
      expect(shadow(element).querySelectorAll('[part="slot"]')).toHaveLength(2)
    );

    const [, secondDay] = [...shadow(element).querySelectorAll<HTMLElement>('[part="day"]')];
    secondDay!.click();
    await settled(element);

    expect(shadow(element).querySelectorAll('[part="slot"]')).toHaveLength(1);
  });

  /*
   * `start_time` carries the provider's offset, so 14:00-04:00 is 2 PM where the practice
   * is. Parsing it with `new Date()` would re-express it in the runner's zone and show a
   * different hour anywhere but Eastern time, which is the regression this guards.
   *
   * Matched loosely because the locale decides the separator and whether the clock is
   * 12- or 24-hour; the hour and minute are what must not move.
   */
  it('renders times in the provider’s zone, not the browser’s', async () => {
    const element = await mountReady();
    await vi.waitFor(() =>
      expect(shadow(element).querySelectorAll('[part="slot"]')).toHaveLength(2)
    );

    expect(texts(element, 'slot')[0]).toMatch(/\b(?:2|14)[:.]00\b/);
    expect(texts(element, 'slot')[1]).toMatch(/\b(?:3|15)[:.]30\b/);
  });

  /*
   * Widths measured rather than a class asserted: "9:00 AM" is two characters shorter than
   * "10:30 AM", and what a patient sees is a ragged column edge, not a selector. A grid of equal
   * columns is one way to fix that and a fixed width is another — this holds either way.
   */
  it('gives every time the same width', async () => {
    // A one-digit hour and a two-digit one, which is where the ragged edge comes from.
    vi.mocked(availability.getAvailability).mockResolvedValue(
      entry(buildTimeslots(FIRST_DAY, ['09:00', '10:30', '14:00']))
    );

    const element = await mountReady();
    await vi.waitFor(() =>
      expect(shadow(element).querySelectorAll('[part="slot"]')).toHaveLength(3)
    );

    const widths = [...shadow(element).querySelectorAll('[part="slot"]')].map(
      (slot) => slot.getBoundingClientRect().width
    );

    /*
     * Within a pixel rather than exactly equal: columns that share the leftover space land on
     * fractional widths that differ in the last subpixel, which no patient can see. Two labels of
     * different lengths sizing themselves differ by tens of pixels, which is the thing under test.
     */
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  });

  it('marks the selected day with aria-current', async () => {
    const element = await mountReady();
    await vi.waitFor(() =>
      expect(shadow(element).querySelectorAll('[part="day"]')).toHaveLength(2)
    );

    const days = [...shadow(element).querySelectorAll('[part="day"]')];
    // Charm renders aria-current onto the button's internal control, so the attribute is
    // one level down from the part.
    expect(days[0]!.shadowRoot?.querySelector('[aria-current="date"]')).not.toBeNull();
    expect(days[1]!.shadowRoot?.querySelector('[aria-current="date"]')).toBeNull();
  });

  it('emits slot-select when a timeslot is clicked', async () => {
    const element = await mountReady();
    await vi.waitFor(() => expect(shadow(element).querySelector('[part="slot"]')).not.toBeNull());

    const events: CustomEvent[] = [];
    element.addEventListener('slot-select', (event) => events.push(event as CustomEvent));

    shadow(element).querySelector<HTMLElement>('[part="slot"]')!.click();

    expect(events).toHaveLength(1);
    // The API's own string, offset intact, so it can go straight back to POST /appointments.
    expect(events[0]!.detail.startTime).toBe(`${FIRST_DAY}T14:00:00-04:00`);
    expect(events[0]!.detail.providerLocationId).toBe(PROVIDER_LOCATION_ID);
  });

  it('reflects the selected time so a host page can restore it', async () => {
    const element = await mountReady();
    await vi.waitFor(() => expect(shadow(element).querySelector('[part="slot"]')).not.toBeNull());

    shadow(element).querySelector<HTMLElement>('[part="slot"]')!.click();
    await settled(element);

    expect(element.selectedStartTime).toBe(`${FIRST_DAY}T14:00:00-04:00`);
    expect(
      shadow(element)
        .querySelector('[part="slot"]')
        ?.shadowRoot?.querySelector('[aria-current="time"]')
    ).not.toBeNull();
  });

  // COMP-001. A location with no open slots is a successful request, not a failure — the
  // API returns the entry either way.
  it('renders the empty state when there is no availability', async () => {
    vi.mocked(availability.getAvailability).mockResolvedValue([
      {
        provider_location_id: SCENARIOS.providerLocationNoAvailability,
        first_availability: null,
        timeslots: [],
      },
    ]);

    const element = await mount<Picker>(
      `<zd-availability-picker visit-reason-id="${VISIT_REASON_ID}"></zd-availability-picker>`
    );
    element.providerLocationId = SCENARIOS.providerLocationNoAvailability;

    await vi.waitFor(() => expect(shadow(element).querySelector('[part="empty"]')).not.toBeNull());
    expect(shadow(element).querySelector('[part="error"]')).toBeNull();
  });

  it('renders the error state and emits availability-error when the request fails', async () => {
    vi.mocked(availability.getAvailability).mockRejectedValue(
      new ZocdocError('Zocdoc API request failed with 500.', 500)
    );

    const element = await mount<Picker>(
      `<zd-availability-picker visit-reason-id="${VISIT_REASON_ID}"></zd-availability-picker>`
    );

    const errors: CustomEvent[] = [];
    element.addEventListener('availability-error', (event) => errors.push(event as CustomEvent));

    element.providerLocationId = SCENARIOS.providerLocationError;

    await vi.waitFor(() => expect(shadow(element).querySelector('[part="error"]')).not.toBeNull());
    expect(errors).toHaveLength(1);
  });

  // CLIENT-003. The developer-facing message names the status and the body can echo a
  // submitted value, so neither may reach the DOM. The raw error still rides the event.
  it('shows user-facing copy rather than the raw API error', async () => {
    vi.mocked(availability.getAvailability).mockRejectedValue(
      new ZocdocError('Zocdoc API request failed with 500.', 500)
    );

    const element = await mountReady();

    await vi.waitFor(() => expect(shadow(element).querySelector('[part="error"]')).not.toBeNull());

    const text = shadow(element).querySelector('[part="error"]')?.textContent ?? '';
    expect(text).toContain('Something went wrong');
    expect(text).not.toContain('500');
  });

  it('refetches when the visit reason changes', async () => {
    const element = await mountReady();
    await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));

    element.visitReasonId = 'pc_a-different-reason';
    await settled(element);

    await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(2));
  });

  /*
   * The window is pinned to the fixtures' own days rather than to today's, so the groups are the
   * same whenever this runs. Nothing here reaches the API — `getAvailability` is mocked — so a
   * window in the past is as good as one in the future for deciding what gets rendered.
   */
  describe('the stacked layout', () => {
    /** Aug 5 – Aug 11: two days with times, then five closed ones. */
    function mountStacked(markup = `start-date="${FIRST_DAY}" days="7"`): Promise<Picker> {
      return mountReady(`layout="stacked" ${markup}`);
    }

    it('drops the day strip, since every day is already on show', async () => {
      const element = await mountStacked();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="day-group"]')).not.toBeNull()
      );

      expect(shadow(element).querySelector('[part="days"]')).toBeNull();
      expect(shadow(element).querySelector('[part="day"]')).toBeNull();
    });

    it('keeps the day strip in the strip layout', async () => {
      const element = await mountReady();
      await vi.waitFor(() => expect(shadow(element).querySelector('[part="day"]')).not.toBeNull());

      expect(shadow(element).querySelector('[part="day-groups"]')).toBeNull();
    });

    it('gives every day with times its own group, and collapses the closed run', async () => {
      const element = await mountStacked();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="day-group"]')).not.toBeNull()
      );

      // Aug 5, Aug 6, then Aug 7–11 as one — not seven groups, and not two.
      expect(texts(element, 'day-heading')).toHaveLength(3);
      expect(shadow(element).querySelectorAll('[part="day-empty"]')).toHaveLength(1);
    });

    /*
     * Matched loosely because the locale decides the separator and whether the range repeats the
     * month; what must hold is that one heading names both ends of the run rather than only its
     * first day, which is what would make the other four days look like they were dropped.
     */
    it('names both ends of a collapsed run', async () => {
      const element = await mountStacked();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="day-empty"]')).not.toBeNull()
      );

      const [, , run] = texts(element, 'day-heading');
      expect(run).toMatch(/\b7\b/);
      expect(run).toMatch(/\b11\b/);
    });

    it('shows every day’s times at once rather than one day’s', async () => {
      const element = await mountStacked();
      await vi.waitFor(() => expect(shadow(element).querySelector('[part="slot"]')).not.toBeNull());

      // Three across two days, where the strip would show the first day's two.
      expect(shadow(element).querySelectorAll('[part="slot"]')).toHaveLength(3);
      expect(shadow(element).querySelectorAll('[part="slots"]')).toHaveLength(2);
    });

    // A closed day before the first open one is the case that would go missing if the groups came
    // from the data instead of from the window.
    it('collapses a run that starts the window', async () => {
      const element = await mountStacked('start-date="2026-08-01" days="7"');
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="day-group"]')).not.toBeNull()
      );

      // Aug 1–4 closed, Aug 5, Aug 6, then Aug 7 closed on its own.
      expect(texts(element, 'day-heading')).toHaveLength(4);
      expect(texts(element, 'day-empty')).toEqual([
        'No available appointments',
        'No available appointments',
      ]);
    });

    it('counts a slot outside the window as being outside it', async () => {
      const element = await mountStacked('start-date="2026-09-01" days="7"');
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="day-group"]')).not.toBeNull()
      );

      // The whole window is one closed run — the August slots are not in it. Still a success
      // rather than the empty state, since the request did come back with slots.
      expect(texts(element, 'day-heading')).toHaveLength(1);
      expect(shadow(element).querySelectorAll('[part="slot"]')).toHaveLength(0);
    });

    it('emits slot-select from a stacked day', async () => {
      const element = await mountStacked();
      await vi.waitFor(() => expect(shadow(element).querySelector('[part="slot"]')).not.toBeNull());

      const events: CustomEvent[] = [];
      element.addEventListener('slot-select', (event) => events.push(event as CustomEvent));

      // The last of the three, which is the second day's — proof the groups are wired up and not
      // just the first one.
      [...shadow(element).querySelectorAll<HTMLElement>('[part="slot"]')].at(-1)!.click();

      expect(events).toHaveLength(1);
      expect(events[0]!.detail.startTime).toBe(`${SECOND_DAY}T09:00:00-04:00`);
    });
  });

  describe('the patient type control', () => {
    it('renders both answers as a labelled group', async () => {
      const element = await mountReady();

      expect(options(element).map((option) => option.textContent?.trim())).toEqual([
        'New patient',
        'Existing patient',
      ]);
      expect(shadow(element).querySelector('[part="patient-type"]')?.getAttribute('label')).toBe(
        'Patient type'
      );
    });

    it('refetches for the chosen type and reports the change', async () => {
      const element = await mountReady();
      await vi.waitFor(() => expect(availability.getAvailability).toHaveBeenCalledTimes(1));

      const events: CustomEvent[] = [];
      element.addEventListener('patient-type-change', (event) => events.push(event as CustomEvent));

      options(element)[1]!.click();

      await vi.waitFor(() => expect(lastParams().patientType).toBe('existing'));
      expect(element.patientType).toBe('existing');
      expect(events).toHaveLength(1);
      expect(events[0]!.detail.patientType).toBe('existing');
    });

    // The group's own `change` is composed and would otherwise surface on the host page as a
    // `change` from this component, which means nothing here.
    it('does not let the group’s change event out', async () => {
      const element = await mountReady();

      const changes: Event[] = [];
      element.addEventListener('change', (event) => changes.push(event));

      options(element)[1]!.click();
      await vi.waitFor(() => expect(element.patientType).toBe('existing'));

      expect(changes).toHaveLength(0);
    });

    /*
     * The state where it matters most: nothing is bookable for a new patient, and switching to
     * "Existing patient" is the thing that might find something. A control inside the request
     * state's children would be gone exactly when it is needed.
     */
    it('stays rendered when the window comes back empty', async () => {
      vi.mocked(availability.getAvailability).mockResolvedValue([
        {
          provider_location_id: PROVIDER_LOCATION_ID,
          first_availability: null,
          timeslots: [],
        },
      ]);

      const element = await mountReady();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="empty"]')).not.toBeNull()
      );

      expect(options(element)).toHaveLength(2);
    });

    it('drops the control on hide-patient-type, keeping the times', async () => {
      const element = await mountReady('hide-patient-type');
      await vi.waitFor(() => expect(shadow(element).querySelector('[part="slot"]')).not.toBeNull());

      expect(shadow(element).querySelector('[part="patient-type"]')).toBeNull();
    });
  });

  // A11Y-005 asks for more than the default state, and each of these renders different
  // markup: a nested list of buttons, a status region, and an alert with a retry.
  describe('accessibility', () => {
    it('has no violations while loading', async () => {
      // Left unresolved on purpose, so the loading leg is what axe sees.
      vi.mocked(availability.getAvailability).mockReturnValue(new Promise(() => {}));

      const element = await mountReady();

      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="loading"]')).not.toBeNull()
      );
      await expectNoViolations(element);
    });

    it('has no violations with days and times rendered', async () => {
      const element = await mountReady();
      await vi.waitFor(() => expect(shadow(element).querySelector('[part="slot"]')).not.toBeNull());

      await expectNoViolations(element);
    });

    // Different markup again: a list of groups, each with a line of its own and either times or
    // the closed-span message under it.
    it('has no violations in the stacked layout', async () => {
      const element = await mountReady(`layout="stacked" start-date="${FIRST_DAY}" days="7"`);
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="day-empty"]')).not.toBeNull()
      );

      await expectNoViolations(element);
    });

    it('has no violations in the empty state', async () => {
      vi.mocked(availability.getAvailability).mockResolvedValue([
        {
          provider_location_id: PROVIDER_LOCATION_ID,
          first_availability: null,
          timeslots: [],
        },
      ]);

      const element = await mountReady();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="empty"]')).not.toBeNull()
      );

      await expectNoViolations(element);
    });

    it('has no violations in the error state', async () => {
      vi.mocked(availability.getAvailability).mockRejectedValue(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      const element = await mountReady();
      await vi.waitFor(() =>
        expect(shadow(element).querySelector('[part="error"]')).not.toBeNull()
      );

      await expectNoViolations(element);
    });
  });
});
