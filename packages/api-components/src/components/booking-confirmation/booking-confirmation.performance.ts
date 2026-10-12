import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import type { ZdBookingConfirmation } from './index.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

describe('zd-booking-confirmation performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdBookingConfirmation>(
      {
        name: 'booking-confirmation',
        create: () => {
          const element = document.createElement(
            'zd-booking-confirmation'
          ) as ZdBookingConfirmation;
          element.setAttribute('appointment-id', SCENARIOS.appointmentConfirmed);
          element.setAttribute('start-time', '2026-08-05T09:00:00-04:00');
          element.setAttribute('provider-name', 'Dr. Avery Sandoval, MD');
          return element;
        },
        update: (element) => (element.status = 'pending_booking'),
      },
      OPTIONS
    );
  });
});
