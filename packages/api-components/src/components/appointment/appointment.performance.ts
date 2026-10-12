import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import {
  benchmarkComponent,
  COMPOSED_OPTIONS,
  untilPart,
} from '../../../../primitives/src/utils/test/performance.js';
import * as appointments from '../../client/appointments.js';
import * as availability from '../../client/availability.js';
import { buildAppointment, PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import * as providerLocations from '../../client/provider-locations.js';
import './index.js';

vi.mock('../../client/appointments.js', { spy: true });
vi.mock('../../client/availability.js', { spy: true });
vi.mock('../../client/provider-locations.js', { spy: true });

const ID = SCENARIOS.appointmentConfirmed;
const APPOINTMENT = buildAppointment(ID, '2026-08-01')!;

describe('zd-appointment performance', () => {
  beforeEach(() => {
    vi.spyOn(appointments, 'getAppointment').mockResolvedValue(APPOINTMENT);
    vi.spyOn(providerLocations, 'getProviderLocation').mockResolvedValue(PROVIDER_LOCATIONS[0]);
    vi.spyOn(availability, 'getAvailability').mockResolvedValue([]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent(
      {
        name: 'appointment',
        create: () => {
          const element = document.createElement('zd-appointment');
          element.setAttribute('appointment-id', ID);
          return element;
        },
        update: (element, i) => element.toggleAttribute('hide-photo', i % 2 === 0),
        ready: untilPart('panel'),
      },
      { ...COMPOSED_OPTIONS, record: 'api-components' }
    );
  });
});
