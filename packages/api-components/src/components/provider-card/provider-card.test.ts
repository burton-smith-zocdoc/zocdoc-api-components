import { describe, expect, it } from 'vitest';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import type { ProviderLocation } from '../../client/types.js';
import { mount, shadow } from '../../utils/test/mount.js';
import './index.js';

/**
 * The fixture directory's own location rather than an invented one (TEST-003). The brief for
 * this task named `SCENARIOS.drJohnSmith.providerLocations[0]`, which does not exist in
 * `client/mock/fixtures.js` — `SCENARIOS` is a map of sentinel ids and zip codes, and the
 * provider fixtures live in the separate `PROVIDER_LOCATIONS` array that every other
 * component's tests already draw from (see `provider-profile.test.ts`).
 */
const PROVIDER = PROVIDER_LOCATIONS[0]!;

type Card = HTMLElement & {
  provider?: ProviderLocation;
  showPhoto: boolean;
  insuranceName?: string;
};

describe('zd-provider-card', () => {
  it('renders without provider', async () => {
    const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
    expect(shadow(card).textContent?.trim()).toBe('');
  });

  it('renders with provider', async () => {
    const card = await mount<Card>('<zd-provider-card></zd-provider-card>');
    card.provider = PROVIDER;
    await card.updateComplete;
    expect(shadow(card).textContent).toContain('TODO');
  });
});
