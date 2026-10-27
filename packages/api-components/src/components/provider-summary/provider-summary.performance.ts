import { describe, it } from 'vitest';
import {
  benchmarkComponent,
  type PerformanceOptions,
} from '../../../../primitives/src/utils/test/performance.js';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { jsonBlock } from '../../utils/test/hydration.js';
import type { ZdProviderSummary } from './index.js';
import './index.js';

const OPTIONS: PerformanceOptions = { record: 'api-components' };

describe('zd-provider-summary performance', () => {
  it('reports mount, rerender, and bulk mount timings', async () => {
    await benchmarkComponent<ZdProviderSummary>(
      {
        name: 'provider-summary',
        create: () => {
          const element = document.createElement('zd-provider-summary') as ZdProviderSummary;
          element.provider = PROVIDER_LOCATIONS[0];
          return element;
        },
        update: (element, i) =>
          (element.provider = PROVIDER_LOCATIONS[1 + (i % (PROVIDER_LOCATIONS.length - 1))]),
      },
      OPTIONS
    );
  });

  it('reports timings when hydrated from a JSON block', async () => {
    await benchmarkComponent<ZdProviderSummary>(
      {
        name: 'provider-summary/hydrated',
        create: () => {
          const element = document.createElement('zd-provider-summary') as ZdProviderSummary;
          element.innerHTML = jsonBlock('provider', PROVIDER_LOCATIONS[0]);
          return element;
        },
        update: (element, i) =>
          (element.provider = PROVIDER_LOCATIONS[1 + (i % (PROVIDER_LOCATIONS.length - 1))]),
      },
      OPTIONS
    );
  });
});
