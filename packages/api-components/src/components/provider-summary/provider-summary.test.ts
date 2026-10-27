import { describe, expect, it } from 'vitest';
import type { ProviderLocation } from '../../client/types.js';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { expectNoViolations } from '../../utils/test/a11y.js';
import { jsonBlock, mountBeforeUpgrade, renderedText } from '../../utils/test/hydration.js';
import { mount, settled } from '../../utils/test/mount.js';
import './index.js';

const PROVIDER = PROVIDER_LOCATIONS[0]!;

type Summary = HTMLElement & { provider?: ProviderLocation };

/** Only what the API requires: no photo, specialty, address detail or distance. */
const SPARSE: ProviderLocation = {
  provider_location_id: PROVIDER.provider_location_id,
  provider_location_type: 'in_person_provider',
  provider: { provider_id: PROVIDER.provider.provider_id, full_name: 'Avery Sandoval' },
} as ProviderLocation;

describe('zd-provider-summary accessibility', () => {
  it('has no violations with every field', async () => {
    const element = await mount<Summary>(
      '<zd-provider-summary insurance-name="Sandbox National PPO"></zd-provider-summary>'
    );
    element.provider = PROVIDER;
    await settled(element);

    await expectNoViolations(element);
  });

  it('has no violations with only the required fields', async () => {
    const element = await mount<Summary>('<zd-provider-summary hide-photo></zd-provider-summary>');
    element.provider = SPARSE;
    await settled(element);

    await expectNoViolations(element);
  });

  it('has no violations when hydrated from markup', async () => {
    const element = await mount<Summary>(
      `<zd-provider-summary>${jsonBlock('provider', PROVIDER)}</zd-provider-summary>`
    );

    await expectNoViolations(element);
  });
});

describe('zd-provider-summary markup hydration', () => {
  it('renders the same from a JSON block as from the property', async () => {
    const fromProperty = await mount<Summary>('<zd-provider-summary></zd-provider-summary>');
    fromProperty.provider = PROVIDER;
    await settled(fromProperty);
    const fromMarkup = await mount<Summary>(
      `<zd-provider-summary>${jsonBlock('provider', PROVIDER)}</zd-provider-summary>`
    );

    expect(renderedText(fromMarkup)).not.toBe('');
    expect(renderedText(fromMarkup)).toBe(renderedText(fromProperty));
  });

  it('lets a property set before upgrade win over the block', async () => {
    const other = PROVIDER_LOCATIONS[1]!;
    const element = await mountBeforeUpgrade<Summary>(
      `<zd-provider-summary>${jsonBlock('provider', PROVIDER)}</zd-provider-summary>`,
      { provider: other }
    );
    expect(element.provider).toBe(other);
  });
});
