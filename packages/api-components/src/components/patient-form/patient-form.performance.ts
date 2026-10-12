import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import type { ZdPatientForm } from './index.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

/** The documented test patient (TEST-003) — the same values patient-form.test.ts uses. */
const TEST_PATIENT_VALUES = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '5551234567',
  email_address: 'test@example.test',
};

describe('zd-patient-form performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdPatientForm>(
      {
        name: 'patient-form',
        create: () => document.createElement('zd-patient-form') as ZdPatientForm,
        update: (element) => (element.values = { ...TEST_PATIENT_VALUES }),
      },
      OPTIONS
    );
  });
});
