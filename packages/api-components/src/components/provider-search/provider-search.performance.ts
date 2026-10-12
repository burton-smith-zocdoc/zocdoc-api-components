import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import {
  benchmarkComponent,
  untilPart,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import { INSURANCE_PLANS, SCENARIOS, SPECIALTIES } from '../../client/mock/fixtures.js';
import * as providerLocations from '../../client/provider-locations.js';
import { DEFAULT_PAGE_SIZE } from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';
import './index.js';

vi.mock('../../client/provider-locations.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

const OPTIONS: PerformanceOptions = { record: 'api-components' };

/** Ready once the specialty select holds the loaded options, not just its placeholder. */
async function referenceDataLoaded(element: HTMLElement): Promise<void> {
  await untilPart('specialty')(element);
  await vi.waitFor(
    () => {
      const options =
        element.shadowRoot?.querySelectorAll('[part~="specialty"] option').length ?? 0;
      if (options < SPECIALTIES.length + 1) throw new Error('specialties not loaded');
    },
    { timeout: 5_000, interval: 0 }
  );
}

/** Mount loads reference data; the search itself runs only on submit, so it is not timed. */
describe('zd-provider-search performance', () => {
  beforeEach(() => {
    vi.spyOn(providerLocations, 'searchProviderLocations').mockResolvedValue({
      providerLocations: [],
      totalCount: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      searchParameters: undefined,
    });
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue(SPECIALTIES);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue(INSURANCE_PLANS);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'provider-search',
        create: () => {
          const element = document.createElement('zd-provider-search');
          element.setAttribute('zip-code', SCENARIOS.zipWithResults);
          element.setAttribute('specialty-id', SPECIALTIES[0].id);
          return element;
        },
        update: (element, i) =>
          element.setAttribute('specialty-id', SPECIALTIES[i % SPECIALTIES.length].id),
        ready: referenceDataLoaded,
      },
      OPTIONS
    );
  });
});
