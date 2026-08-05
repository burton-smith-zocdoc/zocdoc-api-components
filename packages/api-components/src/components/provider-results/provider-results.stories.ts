import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import type { ZdProviderResults } from './provider-results.js';
import './index.js';

const { args, argTypes, template } = getStorybookHelpers<ZdProviderResults>('zd-provider-results', {
  excludeCategories: ['cssParts'],
});

/** A grey circle, inline, so the photo story fetches nothing. See `WithPhotos`. */
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23d8d8d8"/%3E%3C/svg%3E';

/**
 * Providers come from the documented sandbox fixtures rather than invented names, so a
 * story shows the shapes the API actually returns — including the entry with no
 * `full_name`, which is what exercises the display-name fallback (PHI-002, TEST-003).
 *
 * `provider-select` is declared on the component, so the helpers wire it into the Actions
 * panel — picking a provider logs the event rather than needing a story to prove it fires.
 */
const meta: Meta<ZdProviderResults> = {
  title: 'Booking/Provider Results',
  component: 'zd-provider-results',
  args: { ...args, providers: PROVIDER_LOCATIONS },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdProviderResults>;

export const WithResults: Story = {};

export const Empty: Story = {
  args: { providers: [] },
};

/** `aria-current` marks the selected item, so it is announced as the current choice. */
export const Selected: Story = {
  args: { selectedId: PROVIDER_LOCATIONS[0]?.provider_location_id },
};

/**
 * A provider with neither `full_name` nor `first_name`/`last_name` falls back to the
 * practice name, and one with no specialties drops the specialty line entirely. Every
 * field but `provider_id` is optional in production, so both cases are real.
 */
export const SparseProviderData: Story = {
  args: {
    providers: [
      {
        provider_location_id: 'pr_sparse|lo_sparse',
        provider: { provider_id: 'pr_sparse' },
        practice: { practice_id: 'pra_1', practice_name: 'Example Family Practice' },
      },
      {
        provider_location_id: 'pr_named|lo_named',
        provider: { provider_id: 'pr_named', first_name: 'Bo', last_name: 'Sampleton' },
      },
    ],
  },
};

/**
 * The same data in a narrow column, which is how this renders inside a sidebar. Names wrap
 * rather than overflowing, and the button stays full-width so the whole row is the target.
 */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 18rem">${story()}</div>`],
};

/**
 * The network line, which renders only once a plan is named.
 *
 * `accepts_patient_insurance` answers the question relative to the `insurance_plan_id` the
 * search sent, so without one there is nothing for "In-network" to be in the network of — and
 * that is a claim a patient could take to an appointment and be billed for. A page that ran
 * the search passes the plan's own name down.
 */
export const WithInsurance: Story = {
  args: { insuranceName: 'Anthem – Blue Card PPO' },
};

/**
 * Photos, which are off by default.
 *
 * `provider_photo_url` points at an image CDN rather than the configured `baseUrl`, so
 * painting it makes an outbound request to a host PHI-003 does not otherwise allow — a host
 * page opts in knowingly. This story uses an inline `data:` placeholder rather than a real
 * `//d2uur…` URL, so demonstrating the layout does not itself make the request the flag exists
 * to gate.
 */
export const WithPhotos: Story = {
  args: {
    showPhotos: true,
    providers: [
      {
        provider_location_id: 'pr_photo|lo_photo',
        provider: {
          provider_id: 'pr_photo',
          full_name: 'Ada Testerson',
          title: 'MD',
          specialties: ['Dermatologist'],
          provider_photo_url: PLACEHOLDER_PHOTO,
        },
        location: { address1: '1 Sandbox Plaza', city: 'Brooklyn', state: 'NY', zip_code: '11201' },
      },
      // Most providers have no photo. The row still has to line up with the one above it.
      {
        provider_location_id: 'pr_nophoto|lo_nophoto',
        provider: { provider_id: 'pr_nophoto', first_name: 'Bo', last_name: 'Sampleton' },
      },
    ],
  },
};
