import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import {
  benchmarkComponent,
  COMPOSED_OPTIONS,
} from '../../../../primitives/src/utils/test/performance.js';
import * as availability from '../../client/availability.js';
import { buildTimeslots, PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import type { ZdProviderResults } from './index.js';
import './index.js';

vi.mock('../../client/availability.js', { spy: true });

const START = '2026-08-05';
const AVAILABILITY = PROVIDER_LOCATIONS.map((location) => {
  const timeslots = buildTimeslots(START, ['09:00', '14:00']);
  return {
    provider_location_id: location.provider_location_id,
    first_availability: timeslots[0] ?? null,
    timeslots,
  };
});

/** Supplied `availability` means the cards' grids do not fetch; the mock is a safety net. */
describe('zd-provider-results performance', () => {
  beforeEach(() => {
    vi.spyOn(availability, 'getAvailability').mockResolvedValue(AVAILABILITY);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdProviderResults>(
      {
        name: 'provider-results',
        create: () => {
          const element = document.createElement('zd-provider-results') as ZdProviderResults;
          element.providers = PROVIDER_LOCATIONS;
          element.totalCount = PROVIDER_LOCATIONS.length;
          element.availabilityStart = START;
          element.availability = AVAILABILITY;
          return element;
        },
        update: (element, i) =>
          (element.selectedId =
            PROVIDER_LOCATIONS[i % PROVIDER_LOCATIONS.length].provider_location_id),
      },
      { ...COMPOSED_OPTIONS, record: 'api-components' }
    );
  });
});
