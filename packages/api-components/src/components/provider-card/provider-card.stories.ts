import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { buildTimeslots, PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { addDays, todayDayKey } from '../../utilities/provider-time.js';
import { jsonBlock } from '../../utils/test/json-block.js';
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

export const HiddenPhoto: Story = {
  args: { hidePhoto: true },
};

export const WithInsurance: Story = {
  args: { insuranceName: 'Anthem Blue Cross' },
};

/**
 * The availability grid slots into the card and displays alongside the provider info,
 * wrapping below on narrow viewports.
 */
export const WithAvailability: Story = {
  render: (storyArgs) => html`
    <zd-provider-card
      .provider=${storyArgs.provider}
      ?hide-photo=${storyArgs.hidePhoto}
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
};

export const WithBadges: Story = {
  render: (storyArgs) => html`
    <zd-provider-card
      .provider=${storyArgs.provider}
      ?hide-photo=${storyArgs.hidePhoto}
      insurance-name=${storyArgs.insuranceName ?? ''}
    >
      <span slot="badges" style="color: var(--zd-color-success, green); font-size: 0.875rem;">
        ★ Highly Recommended
      </span>
    </zd-provider-card>
  `,
};

/** The card in a narrow container, showing how the layout wraps. */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 20rem">${story()}</div>`],
};

/**
 * Skeletons hold the card's shape while the parent's request is in flight. The card never
 * fetches, so the parent sets `loading` and clears it when data arrives.
 */
export const Loading: Story = {
  args: { loading: true },
};

/**
 * The three annotation slots. Each is the patient-facing text the host page writes, and an empty
 * one takes no space.
 */
export const WithAnnotations: Story = {
  render: (storyArgs) => html`
    <zd-provider-card .provider=${storyArgs.provider}>
      <span slot="reason">Sees new patients for annual checkups</span>
      <span slot="review">"Thorough and kind."</span>
      <span slot="sponsored">Sponsored</span>
    </zd-provider-card>
  `,
};

/**
 * Handoff mode, as a card hydrated from markup or placed by a hydrated list. "Book now" links to
 * the provider's Zocdoc profile and logs a cancelable `book-select` first.
 */
export const BookNowLink: Story = {
  args: {
    handoff: true,
    provider: {
      ...PROVIDER,
      provider: {
        ...PROVIDER.provider,
        profile_url: 'https://www.zocdoc.com/doctor/test-provider-12345',
      },
    },
  },
};

/** "Book now" as a button that only emits `book-select`, for a page that books in its own step. */
export const Selectable: Story = {
  args: { selectable: true },
};

/**
 * The provider written into the HTML as a JSON block, with the reason in its slot, and no script.
 * Hydrating from markup is what puts the card in handoff mode, so "Book now" links to the
 * provider's Zocdoc profile without setting `handoff`.
 */
export const FromMarkup: Story = {
  render: () => {
    const host = document.createElement('div');
    host.innerHTML = `<zd-provider-card>${jsonBlock('provider', {
      ...PROVIDER,
      provider: {
        ...PROVIDER.provider,
        profile_url: 'https://www.zocdoc.com/doctor/test-provider-12345',
      },
    })}<span slot="reason">Sees new patients for annual checkups</span></zd-provider-card>`;
    return host;
  },
};
