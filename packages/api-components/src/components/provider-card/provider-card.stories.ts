import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { buildTimeslots, PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { addDays, todayDayKey } from '../../utilities/provider-time.js';
import type { ZdProviderCard } from './provider-card.js';
import '../availability-grid/index.js';
import './index.js';

const { args, argTypes, template } = getStorybookHelpers<ZdProviderCard>('zd-provider-card', {
  excludeCategories: ['cssParts'],
});

const PROVIDER = PROVIDER_LOCATIONS[0]!;

/** A `YYYY-MM-DD` key relative to today so availability doesn't fall behind the window. */
const dayFromToday = (offset: number): string => addDays(todayDayKey(), offset);

const TODAY = dayFromToday(0);
const TIMESLOTS = buildTimeslots(TODAY, ['09:00', '09:30', '10:00', '11:00', '14:00', '15:30']);

/**
 * Displays a provider's photo, name, specialty, location, and insurance status
 * in a card layout with slots for availability and badges.
 *
 * `profile-request` is declared on the component, so the helpers wire it into the Actions
 * panel — clicking the provider name logs the event.
 */
const meta: Meta<ZdProviderCard> = {
  title: 'API Components/Provider Card',
  component: 'zd-provider-card',
  args: { ...args, provider: PROVIDER },
  argTypes,
  render: (storyArgs) => template(storyArgs),
};

export default meta;
type Story = StoryObj<ZdProviderCard>;

export const Default: Story = {};

export const WithPhoto: Story = {
  args: { showPhoto: true },
};

export const WithInsurance: Story = {
  args: { showPhoto: true, insuranceName: 'Anthem Blue Cross' },
};

/**
 * The availability grid slots into the card and displays alongside the provider info,
 * wrapping below on narrow viewports.
 */
export const WithAvailability: Story = {
  render: (storyArgs) => html`
    <zd-provider-card
      .provider=${storyArgs.provider}
      ?show-photo=${storyArgs.showPhoto}
      insurance-name=${storyArgs.insuranceName ?? ''}
    >
      <zd-availability-grid
        slot="availability"
        .timeslots=${TIMESLOTS}
        start-date=${TODAY}
        hide-window
      ></zd-availability-grid>
    </zd-provider-card>
  `,
  args: { showPhoto: true },
};

export const WithBadges: Story = {
  render: (storyArgs) => html`
    <zd-provider-card
      .provider=${storyArgs.provider}
      ?show-photo=${storyArgs.showPhoto}
      insurance-name=${storyArgs.insuranceName ?? ''}
    >
      <span slot="badges" style="color: var(--zd-color-success, green); font-size: 0.875rem;">
        ★ Highly Recommended
      </span>
    </zd-provider-card>
  `,
  args: { showPhoto: true },
};

/** The card in a narrow container, showing how the layout wraps. */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 20rem">${story()}</div>`],
  args: { showPhoto: true },
};
