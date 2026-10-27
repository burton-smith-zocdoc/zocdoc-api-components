import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import {
  benchmarkComponent,
  untilPart,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import * as availability from '../../client/availability.js';
import { buildTimeslots, SCENARIOS, VISIT_REASONS } from '../../client/mock/fixtures.js';
import { jsonBlock } from '../../utils/test/hydration.js';
import type { ZdAvailabilityPicker } from './index.js';
import './index.js';

vi.mock('../../client/availability.js', { spy: true });

const OPTIONS: PerformanceOptions = { record: 'api-components' };

const PROVIDER_LOCATION_ID = SCENARIOS.providerLocationConfirmed;
const SLOTS = [
  ...buildTimeslots('2026-08-05', ['09:00', '14:00', '15:30']),
  ...buildTimeslots('2026-08-06', ['09:00']),
];

describe('zd-availability-picker performance', () => {
  beforeEach(() => {
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([
      {
        provider_location_id: PROVIDER_LOCATION_ID,
        first_availability: SLOTS[0],
        timeslots: SLOTS,
      },
    ]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdAvailabilityPicker>(
      {
        name: 'availability-picker',
        create: () => {
          const element = document.createElement('zd-availability-picker') as ZdAvailabilityPicker;
          element.setAttribute('visit-reason-id', VISIT_REASONS[0].id);
          element.setAttribute('start-date', '2026-08-05');
          element.providerLocationId = PROVIDER_LOCATION_ID;
          return element;
        },
        update: (element, i) => (element.selectedStartTime = SLOTS[i % SLOTS.length].start_time),
        // `days` renders only once availability has loaded.
        ready: untilPart('days'),
      },
      OPTIONS
    );
  });

  it('reports timings with supplied timeslots', async () => {
    await benchmarkComponent<ZdAvailabilityPicker>(
      {
        name: 'availability-picker/supplied',
        create: () => {
          const element = document.createElement('zd-availability-picker') as ZdAvailabilityPicker;
          element.setAttribute('visit-reason-id', VISIT_REASONS[0].id);
          element.setAttribute('start-date', '2026-08-05');
          element.providerLocationId = PROVIDER_LOCATION_ID;
          element.timeslots = SLOTS;
          return element;
        },
        update: (element, i) => (element.selectedStartTime = SLOTS[i % SLOTS.length].start_time),
        ready: untilPart('days'),
      },
      OPTIONS
    );
  });

  it('reports timings when hydrated from a JSON block', async () => {
    await benchmarkComponent<ZdAvailabilityPicker>(
      {
        name: 'availability-picker/hydrated',
        create: () => {
          const element = document.createElement('zd-availability-picker') as ZdAvailabilityPicker;
          element.setAttribute('visit-reason-id', VISIT_REASONS[0].id);
          element.setAttribute('start-date', '2026-08-05');
          element.setAttribute('provider-location-id', PROVIDER_LOCATION_ID);
          element.innerHTML = jsonBlock('timeslots', SLOTS);
          return element;
        },
        update: (element, i) => (element.selectedStartTime = SLOTS[i % SLOTS.length].start_time),
        ready: untilPart('days'),
      },
      OPTIONS
    );
  });
});
