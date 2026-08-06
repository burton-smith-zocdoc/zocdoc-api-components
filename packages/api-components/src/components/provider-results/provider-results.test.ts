import { describe, expect, it, vi } from 'vitest';
import * as availability from '../../client/availability.js';
import { buildTimeslots } from '../../client/mock/fixtures.js';
import type { ProviderLocation, ProviderLocationAvailability } from '../../client/types.js';
import { expectNoViolations } from '../../test/a11y.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

/**
 * Only so the availability tests can prove the cards fetch *nothing* — this component hands its
 * grids their slots, and the whole reason the batch lives in the parent is that ten cards asking
 * for themselves would be ten requests (TEST-002). `{ spy: true }` keeps the real implementations
 * while making the exports redefinable, which `vi.spyOn` needs in browser mode.
 */
vi.mock('../../client/availability.js', { spy: true });

/**
 * Deliberately unmistakable fake names. Providers are directory data rather than
 * patient data, so they are not PHI — but PHI-002 still rules out anything that
 * reads like a real person.
 *
 * The second entry has no `full_name` and no `specialties`, because production
 * marks every `Provider` field except `provider_id` optional. The component has
 * to survive that, so a fixture has to exercise it.
 */
const PROVIDERS: ProviderLocation[] = [
  {
    provider_location_id: 'pr_a|lo_a',
    accepts_patient_insurance: 'accepted',
    provider: {
      provider_id: 'pr_a',
      full_name: 'Dr. Ada Testerson',
      specialties: ['Dermatologist'],
      provider_photo_url: '//images.test/ada.jpg',
    },
    location: {
      address1: '1 Sandbox Plaza',
      city: 'Brooklyn',
      state: 'NY',
      zip_code: '11201',
      distance_to_patient_mi: 0.8,
    },
  },
  {
    provider_location_id: 'pr_b|lo_b',
    provider: { provider_id: 'pr_b', first_name: 'Bo', last_name: 'Sampleton' },
  },
];

/**
 * A day key relative to today, computed here rather than imported from the component's own
 * helper — otherwise a bug in that helper would move the fixtures and the assertions together and
 * the tests would agree with it. The window starts at today, so a hard-coded date would fall
 * outside it tomorrow and every count would read zero.
 */
function dayFromToday(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Two slots for the first provider and none at all for the second — the second has no entry
 * rather than an empty one, which is the case a batch produces when the API answers about fewer
 * locations than were asked about. Both cards still have to render a grid.
 */
function batch(): ProviderLocationAvailability[] {
  const timeslots = buildTimeslots(dayFromToday(0), ['14:00', '15:30']);
  return [
    { provider_location_id: 'pr_a|lo_a', first_availability: timeslots[0] ?? null, timeslots },
  ];
}

type Results = HTMLElement & {
  providers: ProviderLocation[];
  selectedId?: string;
  showPhotos: boolean;
  insuranceName?: string;
  totalCount?: number;
  page: number;
  pageSize: number;
  availability?: ProviderLocationAvailability[];
  availabilityStart?: string;
  availabilityDays: number;
  goToPage(page: number): void;
  shiftWindow(direction: -1 | 1): void;
};

/** One card's grid, which is a `zd-availability-grid` element with its own shadow root. */
type Grid = HTMLElement & { timeslots?: readonly unknown[]; startDate?: string };

async function mountWithAvailability(entries = batch()): Promise<Results> {
  const element = await mountResults(PROVIDERS);
  element.totalCount = 25;
  element.availability = entries;
  await settled(element);
  await settleGrids(element);
  return element;
}

function grids(element: Results): Grid[] {
  return [...shadow(element).querySelectorAll<Grid>('[part="provider-availability"]')];
}

/** The cards' grids update on their own schedule, so settling the list is not enough. */
async function settleGrids(element: Results): Promise<void> {
  await Promise.all(grids(element).map((grid) => settled(grid)));
}

/** The count lines from one card's grid, which is what says whether it got the right slots. */
function gridCounts(grid: Grid): string[] {
  const root = grid.shadowRoot;
  if (!root) throw new Error('zd-availability-grid rendered no shadow root');
  return [...root.querySelectorAll('[part="day-count"]')].map(
    (node) => node.textContent?.trim() ?? ''
  );
}

async function mountResults(providers: ProviderLocation[]): Promise<Results> {
  const element = await mount<Results>('<zd-provider-results></zd-provider-results>');
  element.providers = providers;
  await settled(element);
  return element;
}

/**
 * A paged list: two providers in hand out of 25, ten to a page, so there are three pages and
 * `providers.length` is nothing like the total. That gap is what the pager exists for.
 */
async function mountPaged(page = 0): Promise<Results> {
  const element = await mountResults(PROVIDERS);
  element.totalCount = 25;
  element.pageSize = 10;
  element.page = page;
  await settled(element);
  return element;
}

function pagerButton(element: Results, direction: 'previous' | 'next'): HTMLElement {
  const node = shadow(element).querySelector<HTMLElement>(`[part="pager-${direction}"]`);
  if (!node) throw new Error(`zd-provider-results rendered no [part='pager-${direction}']`);
  return node;
}

/**
 * Read off the attribute rather than the property: Charm's button leaves `disabled` undefined
 * until something sets it, and the attribute is what both the shadow `<button>` and a screen
 * reader are actually going by.
 */
function isDisabled(element: Results, direction: 'previous' | 'next'): boolean {
  return pagerButton(element, direction).hasAttribute('disabled');
}

function shadow(element: Results): ShadowRoot {
  const root = element.shadowRoot;
  if (!root) throw new Error('zd-provider-results rendered no shadow root');
  return root;
}

describe('zd-provider-results', () => {
  it('renders one card per provider', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelectorAll('[part="provider"]')).toHaveLength(2);
  });

  it('shows an empty state when given no providers', async () => {
    const element = await mountResults([]);
    expect(shadow(element).textContent).toContain('No providers');
  });

  it('emits provider-select with the chosen provider', async () => {
    const element = await mountResults(PROVIDERS);
    const events: CustomEvent[] = [];
    element.addEventListener('provider-select', (event) => events.push(event as CustomEvent));

    shadow(element).querySelectorAll<HTMLElement>('[part="provider"]')[1]!.click();

    expect(events).toHaveLength(1);
    expect(events[0]!.detail.provider.provider_location_id).toBe('pr_b|lo_b');
  });

  it('emits a composed event that escapes the shadow root', async () => {
    const element = await mountResults(PROVIDERS);
    const events: Event[] = [];
    // `once` so the listener does not outlive this test — document.body is not
    // torn down between tests the way the mounted element is.
    document.body.addEventListener('provider-select', (event) => events.push(event), {
      once: true,
    });

    shadow(element).querySelector<HTMLElement>('[part="provider"]')!.click();

    expect(events).toHaveLength(1);
  });

  it('derives a display name from first and last name when full_name is absent', async () => {
    const element = await mountResults(PROVIDERS);
    const names = [...shadow(element).querySelectorAll('[part="provider-name"]')].map((node) =>
      node.textContent?.trim()
    );
    expect(names).toEqual(['Dr. Ada Testerson', 'Bo Sampleton']);
  });

  it('omits the specialty line for a provider with no specialties', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelectorAll('[part="provider-specialty"]')).toHaveLength(1);
  });

  /*
   * The card is `renderProviderSummary`, which has its own tests — these cover the wiring, not
   * the formatting: that the two host properties reach it, and that the shared block is what
   * lands in this component's shadow root so its parts are stylable from a host page.
   */
  it('shows the distance and address on the card', async () => {
    const element = await mountResults(PROVIDERS);
    const where = shadow(element).querySelector('[part="provider-location"]')?.textContent;

    expect(where).toContain('1 Sandbox Plaza, Brooklyn, NY 11201');
  });

  it('renders no photo until asked, even when the API supplied one', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelector('img')).toBeNull();

    element.showPhotos = true;
    await settled(element);

    expect(shadow(element).querySelector('img')?.getAttribute('src')).toBe(
      'https://images.test/ada.jpg'
    );
  });

  /* Without a plan named there is nothing for `accepts_patient_insurance` to be relative to. */
  it('shows the network line only once an insurance plan is named', async () => {
    const element = await mountResults(PROVIDERS);
    expect(shadow(element).querySelector('[part="provider-insurance"]')).toBeNull();

    element.insuranceName = 'Test Health PPO';
    await settled(element);

    expect(shadow(element).querySelector('[part="provider-insurance"]')?.textContent).toContain(
      'In-network · Test Health PPO'
    );
  });

  it('marks only the selected provider with aria-current', async () => {
    const element = await mountResults(PROVIDERS);
    element.selectedId = 'pr_b|lo_b';
    await settled(element);

    const current = [...shadow(element).querySelectorAll('[part="provider"]')].map((node) =>
      node.getAttribute('aria-current')
    );
    expect(current).toEqual([null, 'true']);
  });

  it('tracks selection when a provider is chosen', async () => {
    const element = await mountResults(PROVIDERS);
    shadow(element).querySelectorAll<HTMLElement>('[part="provider"]')[1]!.click();
    await settled(element);

    expect(element.selectedId).toBe('pr_b|lo_b');
  });

  // A11Y-001. The provider control is a real <button> inside a real list, which
  // is what makes Enter and Space work without a keydown handler and what gives
  // a screen reader the item count. Asserting the tag names keeps someone from
  // "simplifying" this into a div with role="button".
  it('uses native list and button semantics', async () => {
    const element = await mountResults(PROVIDERS);
    const root = shadow(element);

    expect(root.querySelectorAll('ul > li')).toHaveLength(2);
    expect(root.querySelector('[part="provider"]')?.tagName).toBe('BUTTON');
    expect(root.querySelector('[part="provider"]')?.getAttribute('type')).toBe('button');
  });

  it('renders the provider name as text, not as an attribute', async () => {
    const element = await mountResults(PROVIDERS);
    for (const node of shadow(element).querySelectorAll('*')) {
      expect(node.getAttribute('aria-label')).toBeNull();
    }
    expect(shadow(element).textContent).toContain('Dr. Ada Testerson');
  });

  /*
   * The count is the total rather than `providers.length`, which is the whole reason it needs a
   * property: page two of 25 holds two providers and saying "2 providers" would be a worse
   * answer than saying nothing.
   */
  describe('the count line', () => {
    it('counts what the search matched, not what is on the page', async () => {
      const element = await mountPaged();

      expect(shadow(element).querySelector('[part="summary"]')?.textContent?.trim()).toBe(
        '25 providers'
      );
    });

    it('says nothing without a total to report', async () => {
      const element = await mountResults(PROVIDERS);

      expect(shadow(element).querySelector('[part="summary"]')).toBeNull();
    });

    it('drops the plural for a single match', async () => {
      const element = await mountResults(PROVIDERS);
      element.totalCount = 1;
      await settled(element);

      expect(shadow(element).querySelector('[part="summary"]')?.textContent?.trim()).toBe(
        '1 provider'
      );
    });

    /*
     * A11Y-002. Paging swaps the list without moving focus, so without this the only feedback a
     * screen reader user gets for pressing Next is that what they were reading has changed.
     */
    it('is a live region, since paging replaces the list silently', async () => {
      const element = await mountPaged();
      const summary = shadow(element).querySelector('[part="summary"]');

      expect(summary?.getAttribute('role')).toBe('status');
      expect(summary?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('the pager', () => {
    it('is absent without a total, which is the only way to know where it ends', async () => {
      const element = await mountResults(PROVIDERS);

      expect(shadow(element).querySelector('[part="pager"]')).toBeNull();
    });

    /* One page is not something to page through. */
    it('is absent when everything fits on one page', async () => {
      const element = await mountResults(PROVIDERS);
      element.totalCount = 8;
      element.pageSize = 10;
      await settled(element);

      expect(shadow(element).querySelector('[part="pager"]')).toBeNull();
    });

    it('counts pages from the total and the page size', async () => {
      const element = await mountPaged();

      expect(shadow(element).querySelector('[part="pager-position"]')?.textContent?.trim()).toBe(
        'Page 1 of 3'
      );
    });

    it('disables Previous on the first page and Next on the last', async () => {
      const element = await mountPaged();
      expect(isDisabled(element, 'previous')).toBe(true);
      expect(isDisabled(element, 'next')).toBe(false);

      element.page = 2;
      await settled(element);

      expect(isDisabled(element, 'previous')).toBe(false);
      expect(isDisabled(element, 'next')).toBe(true);
    });

    it('emits page-change and moves its own page on Next', async () => {
      const element = await mountPaged();
      const events: CustomEvent[] = [];
      element.addEventListener('page-change', (event) => events.push(event as CustomEvent));

      pagerButton(element, 'next').click();
      await settled(element);

      expect(events).toHaveLength(1);
      expect(events[0]!.detail.page).toBe(1);
      expect(element.page).toBe(1);
    });

    it('goes back a page on Previous', async () => {
      const element = await mountPaged(2);
      const events: CustomEvent[] = [];
      element.addEventListener('page-change', (event) => events.push(event as CustomEvent));

      pagerButton(element, 'previous').click();

      expect(events[0]!.detail.page).toBe(1);
    });

    /*
     * `page` is a settable property, so a host page's own pager can ask for anything. An
     * out-of-range page is a request the API answers with an empty list, which this component
     * would then render as "no providers match" for a search that matched 25.
     */
    describe('goToPage', () => {
      it('clamps past the last page', async () => {
        const element = await mountPaged();
        element.goToPage(99);

        expect(element.page).toBe(2);
      });

      it('clamps below the first page', async () => {
        const element = await mountPaged(1);
        element.goToPage(-3);

        expect(element.page).toBe(0);
      });

      /* A repeated request is not a page change, and refetching the page in hand is waste. */
      it('says nothing when the page has not moved', async () => {
        const element = await mountPaged(1);
        const events: CustomEvent[] = [];
        element.addEventListener('page-change', (event) => events.push(event as CustomEvent));

        element.goToPage(1);

        expect(events).toHaveLength(0);
      });
    });
  });

  /*
   * The badges hook renders nothing here, which is the part worth pinning: the marks it exists
   * for ("Sponsored", awards) are not in this API, and a default that reserved space or invented
   * a label would put an unsourced claim on every card.
   */
  it('adds no badges of its own', async () => {
    const element = await mountResults(PROVIDERS);

    expect(shadow(element).querySelector('[part="provider-badges"]')).toBeNull();
  });

  describe('availability on the cards', () => {
    /*
     * The standalone case, and the default. A host page with no availability to show gets the
     * list it asked for and nothing else — not a row of empty grids implying the practices have
     * no openings (COMP-004).
     */
    it('renders no grids until availability is supplied', async () => {
      const element = await mountResults(PROVIDERS);

      expect(grids(element)).toHaveLength(0);
      expect(shadow(element).querySelector('[part="window"]')).toBeNull();
    });

    it('gives every card a grid once availability arrives', async () => {
      const element = await mountWithAvailability();

      expect(grids(element)).toHaveLength(2);
    });

    /* The batch answers for many locations at once, so each card has to be handed its own. */
    it('hands each card the slots for its own location', async () => {
      const element = await mountWithAvailability();
      const [first, second] = grids(element);

      expect(gridCounts(first!)[0]).toBe('2 appts');
      expect(gridCounts(second!)[0]).toBe('No appts');
    });

    /*
     * A location the batch did not answer for gets an empty list rather than nothing at all.
     * Nothing would read to the grid as permission to fetch for itself, which would turn one
     * request for the page into one per card — the thing the batch exists to prevent.
     */
    it('leaves a card the batch missed with slots rather than a licence to fetch', async () => {
      const getAvailability = vi.spyOn(availability, 'getAvailability');
      const element = await mountWithAvailability();

      expect(grids(element)[1]!.timeslots).toEqual([]);
      expect(getAvailability).not.toHaveBeenCalled();
    });

    /*
     * The grid is full of buttons and `part="provider"` is a button, so nesting them would be the
     * axe `nested-interactive` violation and, worse, unreachable by keyboard. The axe check below
     * would catch it; this pins the structure so a refactor cannot quietly move it back inside.
     */
    it('renders the grid beside the provider control rather than inside it', async () => {
      const element = await mountWithAvailability();
      const provider = shadow(element).querySelector('[part="provider"]');

      expect(provider!.querySelector('[part="provider-availability"]')).toBeNull();
      expect(grids(element)[0]!.closest('[part="provider"]')).toBeNull();
    });

    /*
     * One control above the list, not one per card. Ten pagers stepping independently would put
     * every card on different dates, and a patient comparing them would be comparing nothing.
     */
    it('renders one window control for the whole list', async () => {
      const element = await mountWithAvailability();

      expect(shadow(element).querySelectorAll('[part="window"]')).toHaveLength(1);
      for (const grid of grids(element)) {
        expect(grid.shadowRoot!.querySelector('[part="window"]')).toBeNull();
      }
    });

    it('starts every card on the same day', async () => {
      const element = await mountWithAvailability();
      element.availabilityStart = dayFromToday(7);
      await settled(element);
      await settleGrids(element);

      expect(grids(element).map((grid) => grid.startDate)).toEqual([
        dayFromToday(7),
        dayFromToday(7),
      ]);
    });

    /*
     * Reported, not performed — the same shape as paging. This component never learns the visit
     * reason, so it could not fetch the new window even if it wanted to (COMP-002).
     */
    it('emits window-change with the range it moved to', async () => {
      const element = await mountWithAvailability();
      const events: CustomEvent[] = [];
      element.addEventListener('window-change', (event) => events.push(event as CustomEvent));

      shadow(element).querySelector<HTMLButtonElement>('[part="window-next"]')!.click();
      await settled(element);

      expect(events).toHaveLength(1);
      expect(events[0]!.detail).toEqual({
        startDate: dayFromToday(14),
        endDate: dayFromToday(27),
      });
    });

    /* Nowhere earlier to go on the first window, since the API returns nothing in the past. */
    it('disables the earlier control at today', async () => {
      const element = await mountWithAvailability();
      const previous = shadow(element).querySelector<HTMLButtonElement>('[part="window-previous"]');

      expect(previous!.disabled).toBe(true);
    });

    it('says nothing when the window cannot move any earlier', async () => {
      const element = await mountWithAvailability();
      const events: CustomEvent[] = [];
      element.addEventListener('window-change', (event) => events.push(event as CustomEvent));

      element.shiftWindow(-1);

      expect(events).toHaveLength(0);
    });

    /*
     * A bare day key is not actionable by a parent holding ten cards, so the provider is attached
     * on the way through. Without it, a booking flow could not tell which card was pressed.
     */
    it('forwards day-select with the provider attached', async () => {
      const element = await mountWithAvailability();
      const events: CustomEvent[] = [];
      element.addEventListener('day-select', (event) => events.push(event as CustomEvent));

      const cell = grids(element)[0]!.shadowRoot!.querySelector<HTMLButtonElement>('[part="day"]');
      cell!.click();

      expect(events).toHaveLength(1);
      expect(events[0]!.detail.day).toBe(dayFromToday(0));
      expect(events[0]!.detail.provider).toBe(PROVIDERS[0]);
    });

    /* The grid's own event stops here, so a listener never sees the same press twice. */
    it('does not let a card day-select through unchanged', async () => {
      const element = await mountWithAvailability();
      const details: unknown[] = [];
      element.addEventListener('day-select', (event) =>
        details.push((event as CustomEvent).detail)
      );

      grids(element)[0]!.shadowRoot!.querySelector<HTMLButtonElement>('[part="day"]')!.click();

      expect(details).toHaveLength(1);
    });

    /* The count line and the window control share a row, and the count still announces itself. */
    it('keeps the count line beside the window control', async () => {
      const element = await mountWithAvailability();
      const header = shadow(element).querySelector('[part="header"]');

      expect(header!.querySelector('[part="summary"]')).not.toBeNull();
      expect(header!.querySelector('[part="window"]')).not.toBeNull();
    });
  });

  describe('accessibility', () => {
    it('passes axe checks with providers', async () => {
      const element = await mountResults(PROVIDERS);

      await expectNoViolations(element);
    });

    /*
     * The empty state is its own markup rather than a shorter list, so it is its own
     * check (A11Y-005). An empty `<ul>` in place of the message would pass every
     * assertion above and fail here.
     */
    it('passes axe checks when empty', async () => {
      const element = await mountResults([]);

      await expectNoViolations(element);
    });

    /* Selection adds `aria-current` to one card, which is markup nothing else covers. */
    it('passes axe checks with a provider selected', async () => {
      const element = await mountResults(PROVIDERS);
      element.selectedId = 'pr_b|lo_b';
      await settled(element);

      await expectNoViolations(element);
    });

    /*
     * The count line and the pager are markup no other state renders, and the pager's middle
     * page is the only one where neither button is disabled (A11Y-005).
     */
    it('passes axe checks with the count line and pager', async () => {
      const element = await mountPaged(1);

      await expectNoViolations(element);
    });

    /*
     * The one arrangement most likely to break: a grid of buttons per card, plus the shared window
     * control. A grid rendered inside `part="provider"` — itself a button — is axe's
     * `nested-interactive`, and this is the check that would catch it (A11Y-005).
     */
    it('passes axe checks with availability on every card', async () => {
      const element = await mountWithAvailability();

      await expectNoViolations(element);
    });
  });
});
