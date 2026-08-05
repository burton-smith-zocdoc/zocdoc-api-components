import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZocdocError } from '../../client/errors.js';
import * as providerLocations from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';
import type { ProviderSearchResult } from '../../client/provider-locations.js';
import { SCENARIOS, SPECIALTIES, VISIT_REASONS } from '../../client/mock/fixtures.js';
import type { VisitType } from '../../client/types.js';
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

/** The documented fixture specialty every test searches within (TEST-003). */
const SPECIALTY = SPECIALTIES[0]!;
const SPECIALTY_REASONS = VISIT_REASONS.filter((reason) => reason.specialty_id === SPECIALTY.id);
const REASON = SPECIALTY_REASONS[0]!;

/** A reason belonging to a different specialty, for the staleness cases. */
const OTHER_SPECIALTY = SPECIALTIES[1]!;
const OTHER_REASON = VISIT_REASONS.find((reason) => reason.specialty_id === OTHER_SPECIALTY.id)!;

function searchResult(
  providers: ProviderSearchResult['providerLocations'],
  searchParameters?: ProviderSearchResult['searchParameters']
): ProviderSearchResult {
  return {
    providerLocations: providers,
    totalCount: providers.length,
    searchParameters,
  };
}

type Search = HTMLElement & {
  zipCode: string;
  specialtyId?: string;
  visitReasonId?: string;
  insurancePlanId?: string;
  visitType?: VisitType;
  maxDistanceToPatientMi?: number;
  page: number;
  pageSize?: number;
  search(): Promise<void>;
};

/** Charm's form controls, as far as these tests need them. */
type FormControl = HTMLElement & { label?: string; errorMessage: string; disabled: boolean };

function shadow(element: Search): ShadowRoot {
  const root = element.shadowRoot;
  if (!root) throw new Error('zd-provider-search rendered no shadow root');
  return root;
}

function control(element: Search, part: string): FormControl {
  const node = shadow(element).querySelector<FormControl>(`[part='${part}']`);
  if (!node) throw new Error(`zd-provider-search rendered no [part='${part}']`);
  return node;
}

function options(element: Search, part: string): HTMLOptionElement[] {
  return [...shadow(element).querySelectorAll<HTMLOptionElement>(`[part='${part}'] option`)];
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
    vi.spyOn(referenceData, 'getVisitReasons').mockImplementation((specialtyId?: string) =>
      Promise.resolve(VISIT_REASONS.filter((reason) => reason.specialty_id === specialtyId))
    );
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

  it('populates the three selects from reference data', async () => {
    const element = await mountSearch();

    // One placeholder option apiece, plus the loaded ones.
    await vi.waitFor(() => {
      expect(options(element, 'specialty')).toHaveLength(SPECIALTIES.length + 1);
      expect(options(element, 'visit-reason')).toHaveLength(SPECIALTY_REASONS.length + 1);
      expect(options(element, 'insurance')).toHaveLength(2);
    });
  });

  it('sends the selected specialty, visit reason and insurance with the search', async () => {
    const element = await mountSearch();
    element.visitReasonId = REASON.id;
    element.insurancePlanId = 'ip_1';
    await settled(element);
    await element.search();

    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({
        zipCode: SCENARIOS.zipWithResults,
        specialtyId: SPECIALTY.id,
        visitReasonId: REASON.id,
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
   * The bug this validation exists for: the endpoint requires one of `specialty_id` or
   * `visit_reason_id` and answers a request with neither with a 400, so the previous
   * "Any reason" default could not search at all.
   */
  it('refuses to search with neither a specialty nor a visit reason, and says which field', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    await element.search();
    await settled(element);

    expect(providerLocations.searchProviderLocations).not.toHaveBeenCalled();
    expect(control(element, 'specialty').errorMessage).toBe('Choose a specialty to search.');
  });

  // A visit reason alone satisfies the endpoint, so requiring the specialty outright would
  // reject a request the API accepts.
  it('searches on a visit reason alone', async () => {
    const element = await mount<Search>(
      `<zd-provider-search
        zip-code="${SCENARIOS.zipWithResults}"
        visit-reason-id="${REASON.id}"
      ></zd-provider-search>`
    );

    await element.search();

    expect(providerLocations.searchProviderLocations).toHaveBeenCalledWith(
      expect.objectContaining({ specialtyId: undefined, visitReasonId: REASON.id })
    );
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
    expect(control(element, 'zip').errorMessage).toBe('Enter a 5-digit ZIP code.');
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

    expect(control(element, 'zip').errorMessage).toBe('');
    expect(providerLocations.searchProviderLocations).toHaveBeenCalledTimes(1);
  });

  /**
   * Unscoped, `/v1/visit_reasons` is every reason across all 310 specialties. Not fetching it
   * is the point of the disabled state, so the assertion is on the call as much as the DOM.
   */
  it('offers no visit reasons until a specialty is chosen', async () => {
    const element = await mount<Search>(
      `<zd-provider-search zip-code="${SCENARIOS.zipWithResults}"></zd-provider-search>`
    );

    expect(control(element, 'visit-reason').disabled).toBe(true);
    expect(options(element, 'visit-reason')).toHaveLength(1);
    expect(referenceData.getVisitReasons).not.toHaveBeenCalled();
  });

  it('reloads the visit reasons when the specialty changes', async () => {
    const element = await mountSearch();
    await vi.waitFor(() => {
      expect(options(element, 'visit-reason')).toHaveLength(SPECIALTY_REASONS.length + 1);
    });

    element.specialtyId = OTHER_SPECIALTY.id;
    await settled(element);

    await vi.waitFor(() => {
      const labels = options(element, 'visit-reason').map((option) => option.textContent?.trim());
      expect(labels).toContain(OTHER_REASON.name);
      expect(labels).not.toContain(REASON.name);
    });
  });

  /**
   * The API resolves a mismatched `specialty_id`/`visit_reason_id` pair rather than rejecting
   * it, so a reason left over from the previous specialty would quietly search for something
   * the patient can no longer see selected.
   */
  it('drops a visit reason that does not belong to the new specialty', async () => {
    const element = await mountSearch();
    element.visitReasonId = REASON.id;
    await settled(element);

    element.specialtyId = OTHER_SPECIALTY.id;
    await vi.waitFor(() => expect(element.visitReasonId).toBeUndefined());
  });

  // An empty list is also what a failed request looks like, and a failure is no evidence that
  // the host's reason is wrong.
  it('keeps a host-set visit reason when the reasons cannot be loaded', async () => {
    vi.mocked(referenceData.getVisitReasons).mockRejectedValue(new ZocdocError('boom', 500));

    const element = await mount<Search>(
      `<zd-provider-search
        zip-code="${SCENARIOS.zipWithResults}"
        specialty-id="${SPECIALTY.id}"
        visit-reason-id="${REASON.id}"
      ></zd-provider-search>`
    );
    await settled(element);

    await element.search();
    expect(element.visitReasonId).toBe(REASON.id);
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

  // Plan names are not unique across carriers, so a bare list of them gives a patient no way
  // to tell theirs from another company's.
  it('labels an insurance plan with its carrier', async () => {
    vi.mocked(referenceData.getInsurancePlans).mockResolvedValue([
      { id: 'ip_1', name: 'Blue Card PPO', carrier: { id: 'ic_1', name: 'Anthem' } },
    ]);

    const element = await mountSearch();

    await vi.waitFor(() => {
      const labels = options(element, 'insurance').map((option) => option.textContent?.trim());
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
    element.visitReasonId = REASON.id;
    await settled(element);

    const events: CustomEvent[] = [];
    element.addEventListener('provider-results', (event) => events.push(event as CustomEvent));

    await element.search();

    expect(events[0]!.detail).toMatchObject({
      zipCode: SCENARIOS.zipWithResults,
      specialtyId: SPECIALTY.id,
      visitReasonId: REASON.id,
      insurancePlanId: undefined,
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

    const labels = [
      ...shadow(element).querySelectorAll(
        '[part="specialty"], [part="zip"], [part="visit-reason"], [part="insurance"]'
      ),
    ].map((node) => (node as FormControl).label);

    expect(labels).toEqual(['Specialty', 'ZIP code', 'Reason for visit', 'Insurance']);
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
      // and axe would otherwise measure a form that is still three placeholders.
      await vi.waitFor(() => {
        expect(options(element, 'visit-reason')).toHaveLength(SPECIALTY_REASONS.length + 1);
      });

      await expectNoViolations(element);
    });

    /* The invalid fields carry `aria-invalid` and an `aria-errormessage` pointing at copy
     * Charm renders — a wiring axe can check and a colour pair it has to measure. */
    it('passes axe checks with both fields invalid', async () => {
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
