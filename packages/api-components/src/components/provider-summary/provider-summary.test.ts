import { describe, expect, it } from 'vitest';
import type { ProviderLocation } from '../../client/types.js';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { jsonBlock, mountBeforeUpgrade, renderedText } from '../../utils/test/hydration.js';
import { mount, settled } from '../../utils/test/mount.js';
import './index.js';

const PROVIDER = PROVIDER_LOCATIONS[0]!;

type Summary = HTMLElement & { provider?: ProviderLocation };

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
