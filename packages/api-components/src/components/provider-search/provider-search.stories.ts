import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { SCENARIOS, SPECIALTIES } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { ZdProviderResults } from '../provider-results/provider-results.js';
import type { ZdProviderSearch } from './provider-search.js';
import '../provider-results/index.js';
import './index.js';

configureZocdocMock();

const meta: Meta<ZdProviderSearch> = {
  title: 'API Components/Provider Search',
  component: 'zd-provider-search',
  args: {
    zipCode: SCENARIOS.zipWithResults,
    specialtyId: SPECIALTIES[0]!.id,
  },
};

export default meta;
type Story = StoryObj<ZdProviderSearch>;

/**
 * The compact search bar with specialty, ZIP, and insurance fields.
 * Press "Find care" or Enter to search.
 */
export const Default: Story = {
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
      specialty-id=${args.specialtyId ?? ''}
      insurance-plan-id=${args.insurancePlanId ?? ''}
    ></zd-provider-search>
  `,
};

/**
 * Nothing chosen. The form validates that a specialty and valid ZIP are required.
 */
export const NothingChosen: Story = {
  args: { zipCode: '', specialtyId: undefined },
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
    ></zd-provider-search>
  `,
};

/** The documented ZIP that matches nothing. Empty is a success, not an error. */
export const NoResults: Story = {
  args: { zipCode: SCENARIOS.zipEmpty },
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
      specialty-id=${args.specialtyId ?? ''}
    ></zd-provider-search>
  `,
};

/** The documented ZIP that returns a 500. Shows user-facing error with retry. */
export const RequestFails: Story = {
  args: { zipCode: SCENARIOS.zipError },
  render: (args) => html`
    <zd-provider-search
      zip-code=${args.zipCode ?? ''}
      specialty-id=${args.specialtyId ?? ''}
    ></zd-provider-search>
  `,
};

/** Search wired to results - the composition this component exists for. */
export const WiredToResults: Story = {
  render: (args) => html`
    <div
      @provider-results=${(event: CustomEvent) => {
        const results = (event.currentTarget as HTMLElement).querySelector<ZdProviderResults>(
          'zd-provider-results'
        );
        if (results) {
          results.providers = event.detail.providers;
        }
      }}
    >
      <zd-provider-search
        zip-code=${args.zipCode ?? ''}
        specialty-id=${args.specialtyId ?? ''}
      ></zd-provider-search>
      <zd-provider-results style="margin-top: 1rem;"></zd-provider-results>
    </div>
  `,
};

/** Narrow viewport - fields wrap gracefully. */
export const NarrowViewport: Story = {
  render: (args) => html`
    <div style="max-width: 400px;">
      <zd-provider-search
        zip-code=${args.zipCode ?? ''}
        specialty-id=${args.specialtyId ?? ''}
      ></zd-provider-search>
    </div>
  `,
};
