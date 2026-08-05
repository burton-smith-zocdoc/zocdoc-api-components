import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZocdocError } from '../../client/errors.js';
import * as providerLocations from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';
import type { ProviderSearchResult } from '../../client/provider-locations.js';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import { expectNoViolations } from '../../test/a11y.js';
import { mount, settled } from '../../test/mount.js';
import './index.js';

/**
 * `{ spy: true }` keeps the real implementations but makes every export a spy, which is
 * what lets `vi.spyOn` redefine them (TEST-002). Without it the exports of a Vite-served
 * ES module are non-configurable in browser mode and `vi.spyOn` throws.
 */
vi.mock('../../client/provider-locations.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

function searchResult(providers: ProviderSearchResult['providerLocations']): ProviderSearchResult {
  return {
    providerLocations: providers,
    totalCount: providers.length,
    searchParameters: undefined,
  };
}

type Search = HTMLElement & {
  zipCode: string;
  visitReasonId?: string;
  insurancePlanId?: string;
  search(): Promise<void>;
};

function shadow(element: Search): ShadowRoot {
  const root = element.shadowRoot;
  if (!root) throw new Error('zd-provider-search rendered no shadow root');
  return root;
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
    vi.spyOn(referenceData, 'getVisitReasons').mockResolvedValue([
      { id: 'vr_1', name: 'Skin check', specialty_id: 'sp_1' },
    ]);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([
      { id: 'ip_1', name: 'Aetna PPO' },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not search until asked', async () => {
    await mount('<zd-provider-search></zd-provider-search>');
    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
  });

  it('populates the visit reason and insurance selects from reference data', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    // One placeholder option plus one loaded option in each select.
    await vi.waitFor(() => {
      expect(shadow(element).querySelectorAll('[part="visit-reason"] option')).toHaveLength(2);
      expect(shadow(element).querySelectorAll('[part="insurance"] option')).toHaveLength(2);
    });
  });

  it('sends the selected visit reason and insurance with the search', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );
    element.visitReasonId = 'vr_1';
    element.insurancePlanId = 'ip_1';
    await settled(element);
    await element.search();

    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({
        zipCode: SCENARIOS.zipWithResults,
        visitReasonId: 'vr_1',
        insurancePlanId: 'ip_1',
      })
    );
  });

  // Reference data only powers the filters, so losing it degrades the form to ZIP-only
  // rather than blocking search. COMP-001's error leg belongs to the search itself.
  it('still renders the form when reference data fails to load', async () => {
    vi.mocked(referenceData.getVisitReasons).mockRejectedValue(new ZocdocError('boom', 500));

    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    await vi.waitFor(() => expect(shadow(element).querySelector('[part="submit"]')).not.toBeNull());
    expect(shadow(element).querySelector('[part="error"]')).toBeNull();
  });

  it('emits provider-results after a successful search', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();
    await settled(element);

    expect(events).toHaveLength(1);
    expect(events[0]!.detail.providers).toHaveLength(1);
  });

  /**
   * The patient can change all three fields after a parent handed them down, so the event
   * carries what was actually used. A coordinator that guessed instead would push its own
   * stale ZIP back down on the next render.
   */
  it('emits the criteria it searched with, including ones the patient changed', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );
    element.visitReasonId = 'vr_1';
    await settled(element);

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();

    expect(events[0]!.detail).toMatchObject({
      zipCode: SCENARIOS.zipWithResults,
      visitReasonId: 'vr_1',
      insurancePlanId: undefined,
    });
  });

  it('renders the error state and emits provider-search-error when the request fails', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockRejectedValue(
      new ZocdocError('Zocdoc API request failed with 500.', 500)
    );

    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipError}"></zd-provider-search>`
    );

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

    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipError}"></zd-provider-search>`
    );
    await element.search();
    await settled(element);

    const text = shadow(element).querySelector('[part="error"]')?.textContent ?? '';
    expect(text).toContain('Something went wrong');
    expect(text).not.toContain('500');
  });

  it('renders the empty state when no providers come back', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue(searchResult([]));

    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipEmpty}"></zd-provider-search>`
    );
    await element.search();
    await settled(element);

    expect(shadow(element).querySelector('[part="empty"]')).not.toBeNull();
  });

  // A listener that rendered the previous result set needs to be told to clear it, so an
  // empty match is still a successful search that emits.
  it('emits provider-results with an empty array when nothing matches', async () => {
    vi.mocked(providerLocations.searchProviderLocations).mockResolvedValue(searchResult([]));

    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipEmpty}"></zd-provider-search>`
    );

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

    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );
    const pending = element.search();
    await settled(element);

    expect(shadow(element).querySelector('[part="submit"]')).toHaveProperty('disabled', true);

    resolveSearch(searchResult([]));
    await pending;
    await settled(element);

    expect(shadow(element).querySelector('[part="submit"]')).toHaveProperty('disabled', false);
  });

  // I18N-001. Both labels have to be real text in the DOM so browser translation can reach
  // them; a placeholder-only field would leave them untranslatable.
  it('renders visible labels for every field', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    const labels = [
      ...shadow(element).querySelectorAll(
        '[part="zip"], [part="visit-reason"], [part="insurance"]'
      ),
    ].map((node) => (node as HTMLElement & { label?: string }).label);

    expect(labels).toEqual(['ZIP code', 'Reason for visit', 'Insurance']);
  });

  /**
   * One check per leg of COMP-001's state machine that renders anything, because each one
   * is different markup rather than a different string (A11Y-005). `idle` is skipped only
   * because it is the form, which `success` also renders.
   */
  describe('accessibility', () => {
    function mountSearch(zipCode: string): Promise<Search> {
      return mount<Search>(`<zd-provider-search zip-code="${zipCode}"></zd-provider-search>`);
    }

    it('passes axe checks with the filters loaded', async () => {
      const element = await mountSearch(SCENARIOS.zipWithResults);

      // Waited for rather than assumed: the selects render their options asynchronously,
      // and axe would otherwise measure a form that is still two placeholders.
      await vi.waitFor(() => {
        expect(shadow(element).querySelectorAll('[part="visit-reason"] option')).toHaveLength(2);
      });

      await expectNoViolations(element);
    });

    it('passes axe checks while the search is in flight', async () => {
      let resolveSearch!: (result: ProviderSearchResult) => void;
      vi.mocked(providerLocations.searchProviderLocations).mockReturnValue(
        new Promise<ProviderSearchResult>((resolve) => {
          resolveSearch = resolve;
        })
      );

      const element = await mountSearch(SCENARIOS.zipWithResults);
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
