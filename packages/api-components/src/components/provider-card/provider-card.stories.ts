import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import type { ZdProviderCard } from './provider-card.js';
import './index.js';

const PROVIDER = PROVIDER_LOCATIONS[0]!;

const meta: Meta<ZdProviderCard> = {
  title: 'Components/Provider Card',
  component: 'zd-provider-card',
  argTypes: {
    showPhoto: { control: 'boolean' },
    insuranceName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<ZdProviderCard>;

export const Default: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER}></zd-provider-card>
  `,
};

export const WithPhoto: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER} show-photo></zd-provider-card>
  `,
};

export const WithInsurance: Story = {
  render: () => html`
    <zd-provider-card
      .provider=${PROVIDER}
      show-photo
      insurance-name="Anthem Blue Cross"
    ></zd-provider-card>
  `,
};

export const WithAvailability: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER} show-photo>
      <div slot="availability" style="padding: 1rem; background: #f0f0f0; border-radius: 4px;">
        [Availability Grid Placeholder]
      </div>
    </zd-provider-card>
  `,
};

export const WithBadges: Story = {
  render: () => html`
    <zd-provider-card .provider=${PROVIDER} show-photo>
      <zd-badge slot="badges" variant="info">Top Provider</zd-badge>
    </zd-provider-card>
  `,
};
