import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import {
  benchmarkComponent,
  COMPOSED_OPTIONS,
  untilPart,
} from '../../../../primitives/src/utils/test/performance.js';
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import { PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import * as providerLocations from '../../client/provider-locations.js';
import * as referenceData from '../../client/reference-data.js';
import type { ZdBooking } from './index.js';
import './index.js';

vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });
vi.mock('../../client/provider-locations.js', { spy: true });
vi.mock('../../client/reference-data.js', { spy: true });

/** First step only: search plus results from supplied `providers`. Nothing is booked. */
describe('zd-booking performance', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'createAppointment').mockRejectedValue(
      new Error('not booked in a benchmark')
    );
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([]);
    vi.spyOn(providerLocations, 'searchProviderLocations').mockRejectedValue(
      new Error('no search in a benchmark')
    );
    vi.spyOn(referenceData, 'getSpecialties').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getVisitReasons').mockResolvedValue([]);
    vi.spyOn(referenceData, 'getInsurancePlans').mockResolvedValue([]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdBooking>(
      {
        name: 'booking',
        create: () => {
          const element = document.createElement('zd-booking') as ZdBooking;
          element.setAttribute('zip-code', SCENARIOS.zipWithResults);
          element.providers = PROVIDER_LOCATIONS;
          return element;
        },
        update: (element) => element.toggleAttribute('hide-photos'),
        ready: untilPart('results'),
      },
      { ...COMPOSED_OPTIONS, record: 'api-components' }
    );
  });
});
