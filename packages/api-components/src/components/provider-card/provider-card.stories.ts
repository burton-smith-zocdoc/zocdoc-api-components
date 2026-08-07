import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { buildTimeslots, PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import type { ZdProviderCard } from './provider-card.js';
import '../availability-grid/index.js';
import './index.js';

const PROVIDER = PROVIDER_LOCATIONS[0]!;
const TODAY = new Date().toISOString().slice(0, 10);
const TIMESLOTS = buildTimeslots(TODAY, ['09:00', '09:30', '10:00', '11:00', '14:00', '15:30']);

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
      <zd-availability-grid
        slot="availability"
        .timeslots=${TIMESLOTS}
        start-date=${TODAY}
        hide-window
      ></zd-availability-grid>
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
