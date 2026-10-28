import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { jsonBlock } from '../../utils/test/json-block.js';
import type { ZdProviderSummary } from './provider-summary.js';
import './index.js';

const { args, argTypes, template } = getStorybookHelpers<ZdProviderSummary>(
  'zd-provider-summary',
  { excludeCategories: ['cssParts'] }
);

const PROVIDER = PROVIDER_LOCATIONS[0]!;

/**
 * The compact provider header `zd-provider-card` and `zd-booking` are built from. It fetches
 * nothing and renders the `ProviderLocation` it is handed.
 */
const meta: Meta<ZdProviderSummary> = {
  title: 'API Components/Provider Summary',
  component: 'zd-provider-summary',
  args: { ...args, provider: PROVIDER },
  argTypes,
  render: (storyArgs) => template(storyArgs),
};

export default meta;
type Story = StoryObj<ZdProviderSummary>;

export const Default: Story = {};

/** The provider from a JSON block instead of a property, as a server-rendered page writes it. */
export const FromMarkup: Story = {
  render: () => {
    const host = document.createElement('div');
    host.innerHTML = `<zd-provider-summary>${jsonBlock('provider', PROVIDER)}</zd-provider-summary>`;
    return host;
  },
};
