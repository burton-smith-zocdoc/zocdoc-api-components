import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZocdocError } from '../../client/errors.js';
import * as providerLocations from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';
import { DEFAULT_PAGE_SIZE, type ProviderSearchResult } from '../../client/provider-locations.js';
import { SCENARIOS, SPECIALTIES } from '../../client/mock/fixtures.js';
import type { VisitType } from '../../client/types.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { mount, settled, shadow } from '../../utils/test/mount.js';
import './index.js';

/**
 * `{ spy: true }` keeps the real implementations but makes every export a spy, which is
 * what lets `vi.spyOn` redefine them (TEST-002). Without it the exports of a Vite-served
 * ES module are non-configurable in browser mode and `vi.spyOn` throws.
 */
vi.mock('../../client/provider-locations.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

/** The documented fixture specialty every test searches within (TEST-003). */
const SPECIALTY = SPECIALTIES[0]!;

/**
 * `envelope` overrides the paging numbers, which for a single-page result are just the length.
 * A paging test needs a total larger than the page it hands back — that mismatch is the whole
 * point of `total_count`.
 */
function searchResult(
  providers: ProviderSearchResult['providerLocations'],
  searchParameters?: ProviderSearchResult['searchParameters'],
  envelope?: { totalCount?: number; pageSize?: number }
): ProviderSearchResult {
  return {
    providerLocations: providers,
    totalCount: envelope?.totalCount ?? providers.length,
    pageSize: envelope?.pageSize ?? DEFAULT_PAGE_SIZE,
    searchParameters,
  };
}

type Search = HTMLElement & {
  zipCode: string;
  specialtyId?: string;
  insurancePlanId?: string;
  visitType?: VisitType;
  maxDistanceToPatientMi?: number;
  page: number;
  pageSize?: number;
  search(): Promise<void>;
};

function control(element: Search, name: string): HTMLSelectElement | HTMLInputElement | null {
  return shadow(element).querySelector<HTMLSelectElement | HTMLInputElement>(`[part="${name}"]`);
}

function selectOptions(element: Search, name: string): HTMLOptionElement[] {
  const select = control(element, name) as HTMLSelectElement | null;
  return select ? [...select.querySelectorAll<HTMLOptionElement>('option')] : [];
}

function getErrorMessage(element: Search): string {
  return shadow(element).querySelector('[part="field-error"]')?.textContent?.trim() ?? '';
}

/**
 * Mounts with a specialty as well as a ZIP, because those are the two things the endpoint
 * requires — a ZIP-only element is the case the validation tests are about, not the baseline.
 */
function mountSearch(zipCode: string = SCENARIOS.zipWithResults): Promise<Search> {
  return mount<Search>(
    `<zd-provider-search zip-code="${zipCode}" specialty-id="${SPECIALTY.id}"></zd-provider-search>`
  );
}

describe('zd-provider-search', () => {
  beforeEach(() => {
    vi.spyOn(providerLocations, 'searchProviderLocations').mockResolvedValue(
      searchResult([
        {
          provider_location_id: 'pr_a|lo_a',
          provider: { provider_id: 'pr_a', full_name: 'Dr. Ada Testerson' },
        },
      ])
    );
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue(SPECIALTIES);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([
      { id: 'ip_1', name: 'Aetna PPO' },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not search until asked', async () => {
    await mountSearch();
    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
  });

  it('populates the two selects from reference data', async () => {
    const element = await mountSearch();

    // One placeholder option apiece, plus the loaded ones.
    await vi.waitFor(() => {
      expect(selectOptions(element, 'specialty')).toHaveLength(SPECIALTIES.length + 1);
      expect(selectOptions(element, 'insurance')).toHaveLength(2);
    });
  });

  it('sends the selected specialty and insurance with the search', async () => {
    const element = await mountSearch();
    element.insurancePlanId = 'ip_1';
    await settled(element);
    await element.search();

    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SPECIALTY.id,
        insurancePlanId: 'ip_1',
      })
    );
  });

  /**
   * These four reach the client but have no control of their own, so a host page is the only
   * thing that can set them — which makes the pass-through the whole of their contract.
   */
  it('sends the visit type, distance and paging parameters a host page set', async () => {
    const element = await mountSearch();
    element.visitType = 'all';
    element.maxDistanceToPatientMi = 10;
    element.page = 2;
    element.pageSize = 25;
    await settled(element);
    await element.search();

    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({
        visitType: 'all',
        maxDistanceToPatientMi: 10,
        page: 2,
        pageSize: 25,
      })
    );
  });

  /**
   * The bug this validation exists for: the endpoint requires `specialty_id` and answers a
   * request without one with a 400 whose body is developer-facing.
   */
  it('refuses to search without a specialty, and says which field', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    await element.search();
    await settled(element);

    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
    expect(getErrorMessage(element)).toBe('Choose a specialty to search.');
  });

  // The API takes five digits and 400s on four, which is a mistake worth catching before it
  // costs a request.
  it('refuses to search on a ZIP that is not five digits', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="1120" specialty-id="${SPECIALTY.id}"></zd-provider-search>`
    );

    await element.search();
    await settled(element);

    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
    expect(getErrorMessage(element)).toBe('Enter a 5-digit ZIP code.');
  });

  it('clears a field message once the field is corrected', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="1120" specialty-id="${SPECIALTY.id}"></zd-provider-search>`
    );
    await element.search();
    await settled(element);

    element.zipCode = SCENARIOS.zipWithResults;
    await element.search();
    await settled(element);

    expect(getErrorMessage(element)).toBe('');
    expect(providerLocations.searchProviderLocations).toHaveBeenCalledTimes(1);
  });

  // A submit is a new question, and answering it with page four of the old one is worse than
  // starting over.
  it('returns to the first page when the form is submitted', async () => {
    const element = await mountSearch();
    element.page = 3;
    await settled(element);

    shadow(element).querySelector('form')?.requestSubmit();
    await settled(element);

    expect(element.page).toBe(0);
    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0 })
    );
  });

  /*
   * How a pager elsewhere on the page turns into a request. `zd-provider-results` emits
   * `page-change`, a parent binds the new page back down here, and this refetches — so nothing
   * has to call a method on this element and the two components never talk to each other
   * (COMP-002).
   */
  describe('paging', () => {
    it('re-searches when the page it is given moves', async () => {
      const element = await mountSearch();
      await element.search();
      vi.mocked(providerLocations.searchProviderLocations).mockClear();

      element.page = 1;
      await settled(element);

      expect(providerLocations.searchProviderLocations).toHaveBeenCalledTimes(1);
      expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    /*
     * A submit sets `page` to 0 and searches, so an unguarded watcher would see the page move
     * and search a second time for the same thing.
     */
    it('searches once for a submit that also resets the page', async () => {
      const element = await mountSearch();
      element.page = 3;
      await settled(element);
      await element.search();
      vi.mocked(providerLocations.searchProviderLocations).mockClear();

      shadow(element).querySelector('form')?.requestSubmit();
      await settled(element);
      await settled(element);

      expect(providerLocations.searchProviderLocations).toHaveBeenCalledTimes(1);
    });

    /* A host page configuring where to start is not asking for a search. */
    it('stays inert when the page is set before anything has been searched', async () => {
      const element = await mountSearch();

      element.page = 2;
      await settled(element);

      expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
    });

    /*
     * The refused search still counts as having acted on the page. Left unrecorded, the render
     * that puts the field message in place would look like another page change and search again,
     * and again.
     */
    it('does not loop when a page change hits a form that cannot search', async () => {
      const element = await mount<Search>(
        `<zd-provider-search zip-code="1120" specialty-id="${SPECIALTY.id}"></zd-provider-search>`
      );
      await element.search();

      element.page = 1;
      await settled(element);
      await settled(element);

      expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
      expect(getErrorMessage(element)).toBe('Enter a 5-digit ZIP code.');
    });

    /*
     * The size the response was built with, not `pageSize`, which is usually unset. A pager
     * dividing a total by the wrong one offers pages that do not exist.
     */
    it('emits the page size the API used', async () => {
      vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue(
        searchResult(
          [{ provider_location_id: 'pr_a|lo_a', provider: { provider_id: 'pr_a' } }],
          {
            specialty_id: SPECIALTY.id,
          },
          { totalCount: 25, pageSize: 10 }
        )
      );

      const element = await mountSearch();
      const events: CustomEvent[] = [];
      element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

      await element.search();

      expect(events[0]!.detail).toMatchObject({ totalCount: 25, pageSize: 10 });
    });
  });

  // Plan names are not unique across carriers, so a bare list of them gives a patient no way
  // to tell theirs from another company's.
  it('labels an insurance plan with its carrier', async () => {
    vi.mocked(referenceData.getInsurancePlans).mockResolvedValue([
      { id: 'ip_1', name: 'Blue Card PPO', carrier: { id: 'ic_1', name: 'Anthem' } },
    ]);

    const element = await mountSearch();

    await vi.waitFor(() => {
      const labels = selectOptions(element, 'insurance').map((option) =>
        option.textContent?.trim()
      );
      expect(labels).toContain('Anthem – Blue Card PPO');
    });
  });

  // Reference data only powers the filters, so losing it degrades the form rather than
  // blocking search. COMP-001's error leg belongs to the search itself.
  it('still renders the form when reference data fails to load', async () => {
    vi.mocked(referenceData.getSpecialties).mockRejectedValue(new ZocdocError('boom', 500));

    const element = await mountSearch();

    await vi.waitFor(() => expect(shadow(element).querySelector('[part="submit"]')).not.toBeNull());
    expect(shadow(element).querySelector('[part="error"]')).toBeNull();
  });

  it('emits provider-results after a successful search', async () => {
    const element = await mountSearch();

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();
    await settled(element);

    expect(events).toHaveLength(1);
    expect(events[0]!.detail.providers).toHaveLength(1);
  });

  /**
   * The patient can change every field after a parent handed them down, so the event carries
   * what was actually used. A coordinator that guessed instead would push its own stale ZIP
   * back down on the next render.
   */
  it('emits the criteria it searched with, including ones the patient changed', async () => {
    const element = await mountSearch();
    element.insurancePlanId = 'ip_1';
    await settled(element);

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();

    expect(events[0]!.detail).toMatchObject({
      zipCode: SCENARIOS.zipWithResults,
      specialtyId: SPECIALTY.id,
      insurancePlanId: 'ip_1',
      page: 0,
    });
  });

  /**
   * `search_parameters` is the only place a parent learns the `visit_reason_id` the API filled
   * in for "Any reason" — and availability and booking both require one.
   */
  it('emits the total count and the parameters the API resolved', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue(
      searchResult([{ provider_location_id: 'pr_a|lo_a', provider: { provider_id: 'pr_a' } }], {
        specialty_id: SPECIALTY.id,
        visit_reason_id: SPECIALTY.default_visit_reason_id,
      })
    );

    const element = await mountSearch();

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();

    expect(events[0]!.detail.totalCount).toBe(1);
    expect(events[0]!.detail.searchParameters).toMatchObject({
      visit_reason_id: SPECIALTY.default_visit_reason_id,
    });
  });

  it('renders the error state and emits provider-search-error when the request fails', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockRejectedValue(
      new ZocdocError('Zocdoc API request failed with 500.', 500)
    );

    const element = await mountSearch(SCENARIOS.zipError);

    const errors: CustomEvent[] = [];
    element.addEventListener('provider-search-error', (event) => errors.push(event as CustomEvent));

    await element.search();
    await settled(element);

    expect(shadow(element).querySelector('[part="error"]')).not.toBeNull();
    expect(errors).toHaveLength(1);
  });

  // CLIENT-003. The developer-facing message names the status and the body can echo a
  // submitted value, so neither may reach the DOM. The raw error still rides the event.
  it('shows user-facing copy rather than the raw API error', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockRejectedValue(
      new ZocdocError('Zocdoc API request failed with 500.', 500)
    );

    const element = await mountSearch(SCENARIOS.zipError);
    await element.search();
    await settled(element);

    const text = shadow(element).querySelector('[part="error"]')?.textContent ?? '';
    expect(text).toContain('Something went wrong');
    expect(text).not.toContain('500');
  });

  it('renders the empty state when no providers come back', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue(searchResult([]));

    const element = await mountSearch(SCENARIOS.zipEmpty);
    await element.search();
    await settled(element);

    expect(shadow(element).querySelector('[part="empty"]')).not.toBeNull();
  });

  // A listener that rendered the previous result set needs to be told to clear it, so an
  // empty match is still a successful search that emits.
  it('emits provider-results with an empty array when nothing matches', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue(searchResult([]));

    const element = await mountSearch(SCENARIOS.zipEmpty);

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();

    expect(events).toHaveLength(1);
    expect(events[0]!.detail.providers).toEqual([]);
  });

  it('disables the submit button while the search is in flight', async () => {
    // Held open deliberately: `loading` is the one state that only exists mid-request, so
    // the request has to still be in flight when the assertion runs.
    let resolveSearch!: (result: ProviderSearchResult) => void;
    vi.mocked(providerLocations.searchProviderLocations).mockReturnValue(
      new Promise<ProviderSearchResult>((resolve) => {
        resolveSearch = resolve;
      })
    );

    const element = await mountSearch();
    const pending = element.search();
    await settled(element);

    expect(shadow(element).querySelector('[part="submit"]')).toHaveProperty('disabled', true);

    resolveSearch(searchResult([]));
    await pending;
    await settled(element);

    expect(shadow(element).querySelector('[part="submit"]')).toHaveProperty('disabled', false);
  });

  // I18N-001. Every label has to be real text in the DOM so browser translation can reach
  // them; a placeholder-only field would leave them untranslatable.
  it('renders visible labels for every field', async () => {
    const element = await mountSearch();

    const labels = [...shadow(element).querySelectorAll('.field label')].map(
      (label) => label.textContent?.trim()
    );

    expect(labels).toEqual(['Search', 'ZIP code', 'Insurance']);
  });

  /**
   * One check per leg of COMP-001's state machine that renders anything, because each one
   * is different markup rather than a different string (A11Y-005). `idle` is skipped only
   * because it is the form, which `success` also renders.
   */
  describe('accessibility', () => {
    it('passes axe checks with the filters loaded', async () => {
      const element = await mountSearch();

      // Waited for rather than assumed: the selects render their options asynchronously,
      // and axe would otherwise measure a form that is still showing only placeholders.
      await vi.waitFor(() => {
        expect(selectOptions(element, 'insurance')).toHaveLength(2);
      });

      await expectNoViolations(element);
    });

    /* The invalid field carries the shared error message announced via `role="alert"` —
     * a wiring axe can check and a colour pair it has to measure. */
    it('passes axe checks with validation error shown', async () => {
      const element = await mount<Search>(
        `<zd-provider-search zip-code="1120"></zd-provider-search>`
      );
      await element.search();
      await settled(element);

      await expectNoViolations(element);
    });

    it('passes axe checks while the search is in flight', async () => {
      let resolveSearch!: (result: ProviderSearchResult) => void;
      vi.mocked(providerLocations.searchProviderLocations).mockReturnValue(
        new Promise<ProviderSearchResult>((resolve) => {
          resolveSearch = resolve;
        })
      );

      const element = await mountSearch();
      const pending = element.search();
      await settled(element);

      await expectNoViolations(element);

      // Resolved before the test ends so the held promise does not outlive it.
      resolveSearch(searchResult([]));
      await pending;
    });

    it('passes axe checks in the empty state', async () => {
      vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue(searchResult([]));

      const element = await mountSearch(SCENARIOS.zipEmpty);
      await element.search();
      await settled(element);

      await expectNoViolations(element);
    });

    /* The error alert is `role="alert"` on a danger variant — its own colour pair to check. */
    it('passes axe checks in the error state', async () => {
      vi.mocked(providerLocations.searchProviderLocations).mockRejectedValue(
        new ZocdocError('Zocdoc API request failed with 500.', 500)
      );

      const element = await mountSearch(SCENARIOS.zipError);
      await element.search();
      await settled(element);

      await expectNoViolations(element);
    });
  });
});
