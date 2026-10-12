import { afterEach, describe, it, vi } from 'vitest';
import {
  benchmarkComponent,
  untilPart,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import type { PatientAuth } from '../../client/patient-auth.js';
import type { ZdSignIn } from './index.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

/** A signed-out `PatientAuth` with nothing to complete, as sign-in.test.ts stubs it. */
function stubAuth(): PatientAuth {
  return {
    signIn: vi.fn<PatientAuth['signIn']>().mockResolvedValue(undefined),
    completeSignIn: vi.fn<PatientAuth['completeSignIn']>().mockResolvedValue(false),
    getToken: vi.fn<PatientAuth['getToken']>().mockResolvedValue('stub-token-not-a-credential'),
    isSignedIn: vi.fn<PatientAuth['isSignedIn']>().mockReturnValue(false),
  };
}

/** First step only. `@example.test` is a reserved, non-routable domain (PHI-002). */
describe('zd-sign-in performance', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdSignIn>(
      {
        name: 'sign-in',
        create: () => {
          const element = document.createElement('zd-sign-in') as ZdSignIn;
          element.auth = stubAuth();
          return element;
        },
        update: (element, i) => (element.email = `patient${i}@example.test`),
        ready: untilPart('form'),
      },
      OPTIONS
    );
  });
});
