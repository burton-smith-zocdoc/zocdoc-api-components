import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as availability from '../../client/availability.js';
import { ZocdocError } from '../../client/errors.js';
import { buildTimeslots, SCENARIOS } from '../../client/mock/fixtures.js';
import type { ProviderLocationAvailability } from '../../client/types.js';
import { expectNoViolations } from '../../test/a11y.js';
import { mount, settled } from '../../test/mount.js';
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
  days: number;
  load(): Promise<void>;
};

function shadow(element: Picker): ShadowRoot {
  const root = element.shadowRoot;
  if (!root) throw new Error('zd-availability-picker rendered no shadow root');
  return root;
}

function texts(element: Picker, part: string): string[] {
  return [...shadow(element).querySelectorAll(`[part="${part}"]`)].map(
    (node) => node.textContent?.trim() ?? ''
  );
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

    // The most recent call, not the first: this asserts on the window the component just
    // asked for, and stays right if setting the ids ever costs more than one fetch.
    const [params] = vi.mocked(availability.getAvailability).mock.calls.at(-1)!;
    const start = Date.parse(`${params.startDate}T00:00:00Z`);
    const end = Date.parse(`${params.endDate}T00:00:00Z`);

    expect((end - start) / 86_400_000).toBe(30);
    expect(element.days).toBe(90);
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
