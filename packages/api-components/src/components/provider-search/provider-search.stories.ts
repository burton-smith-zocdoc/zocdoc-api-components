import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { SCENARIOS, SPECIALTIES } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { ZdProviderResults } from '../provider-results/provider-results.js';
import type { ZdProviderSearch } from './provider-search.js';
import '../provider-results/index.js';
import './index.js';

/**
 * Stories run against the mock transport, so they need no token and make no outbound
 * request (PHI-003). Each state is driven by the documented sentinel ZIP it would send to
 * the real sandbox rather than by a mock-only flag, which keeps the stories honest — the
 * same markup works against the live API once `configureZocdoc` points at it.
 *
 * The default 300ms latency is deliberate: with an instant resolve the loading leg of the
 * COMP-001 state machine never paints and a broken spinner would look fine.
 */
configureZocdocMock();

const { args, argTypes, template } = getStorybookHelpers<ZdProviderSearch>('zd-provider-search', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdProviderSearch> = {
  title: 'Booking/Provider Search',
  component: 'zd-provider-search',
  args: { ...args, zipCode: SCENARIOS.zipWithResults, specialtyId: SPECIALTIES[0]!.id },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdProviderSearch>;

/**
 * Press Search, or focus the ZIP field and press Enter — Charm's input calls
 * `form.requestSubmit()`, so the keyboard path needs no extra handler. Results leave
 * through `provider-results`, which the Actions panel logs.
 */
export const Default: Story = {};

/**
 * Nothing chosen. `GET /v1/provider_locations` requires a 5-digit ZIP and one of
 * `specialty_id` or `visit_reason_id`, so this form cannot search yet — press Search to see
 * both fields report it rather than the request coming back a 400.
 *
 * The visit reason select is disabled until a specialty is chosen. Unscoped it would be every
 * reason across all 310 specialties, which is neither a list a patient can read nor one worth
 * fetching.
 */
export const NothingChosen: Story = {
  args: { zipCode: '', specialtyId: undefined },
};

/** The documented ZIP that matches nothing. Empty is a success, not an error (COMP-001). */
export const NoResults: Story = {
  args: { zipCode: SCENARIOS.zipEmpty },
};

/**
 * The documented ZIP that returns a 500. The alert shows user-facing copy, never the
 * developer-facing message from the client (CLIENT-003), and offers a retry.
 */
export const RequestFails: Story = {
  args: { zipCode: SCENARIOS.zipError },
};

/**
 * The composition this component exists for: search emits, results render. Neither knows
 * about the other beyond the event, so a host page can put anything in between (COMP-002).
 *
 * The listener sits on the wrapper because `emit()` events bubble and are composed, so a
 * common ancestor sees them without either component reaching for the other.
 */
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
      ${template(args)}
      <zd-provider-results></zd-provider-results>
    </div>
  `,
};
