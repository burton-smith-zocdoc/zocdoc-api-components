import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import type { ZdProviderProfile } from './provider-profile.js';
import './index.js';

/**
 * Nothing here configures the mock transport, and that is the point: this component fetches
 * nothing. It renders the `ProviderLocation` it is handed, which is exactly what
 * `zd-provider-results` emits on `provider-select` — so a host page wires the two together with
 * one assignment and no translation.
 *
 * The photo is left off in every story. `provider_photo_url` points at Zocdoc's image CDN rather
 * than the configured `baseUrl`, so painting it would make an outbound request from a story
 * (PHI-003); the fixture locations carry no photo url anyway.
 */
const { args, argTypes, template } = getStorybookHelpers<ZdProviderProfile>('zd-provider-profile', {
  excludeCategories: ['cssParts'],
});

/** The fixture location carrying every profile field. */
const FULL = PROVIDER_LOCATIONS[0]!;

/** The virtual one, which carries almost none — see `SparseProfile`. */
const VIRTUAL = PROVIDER_LOCATIONS[1]!;

const meta: Meta<ZdProviderProfile> = {
  title: 'API Components/Provider Profile',
  component: 'zd-provider-profile',
  args: { ...args, provider: FULL },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdProviderProfile>;

/**
 * Everything the API gives about one provider location: the header, the provider's own
 * statement, the languages they speak, what they are certified in, where they trained, and where
 * to go — with the practice's number as a `tel:` link.
 */
export const Default: Story = {};

/**
 * The same component on a location that carries almost nothing, which is the ordinary case
 * rather than the exception: every `Provider` field but `provider_id` is optional and production
 * populates them unevenly.
 *
 * Four sections are gone rather than blank. A page of empty headings reads as broken where a
 * shorter page reads as brief — and this one is virtual, so its Location section is the one line
 * it has instead of an address it does not.
 */
export const SparseProfile: Story = {
  args: { provider: VIRTUAL },
};

/**
 * Nothing renders without a provider. There is no loading state to show and no empty state to
 * word: this component fetches nothing, so an absent `provider` means the page above it has not
 * decided yet (COMP-001 belongs to whoever does the fetching).
 */
export const AwaitingProvider: Story = {
  args: { provider: undefined },
};

/**
 * The three holes, filled. The production profile also carries reviews, a ratings summary, and
 * FAQs — none of which exist in this API: there is no reviews or ratings endpoint, and the
 * highlights ("Patients often return") are derived from Zocdoc's own booking history.
 *
 * Rather than invent them, the component leaves slots where they belong. What is slotted here is
 * deliberately plain markup with no patient in it, which is also the rule for a real host page:
 * review text attributed to a named patient is exactly the content PHI-001 is about.
 *
 * Slotted content continues at `<h3>`, matching the component's own section headings, so the
 * outline stays walkable.
 */
export const WithHostSections: Story = {
  render: (args) =>
    template(
      args,
      html`
        <ul slot="highlights" style="margin: 0; padding-inline-start: 1.25rem">
          <li>Patients often return</li>
          <li>Excellent wait time</li>
        </ul>
        <div slot="reviews">
          <h3 style="margin: 0 0 0.5rem">Reviews</h3>
          <p style="margin: 0">4.92 average across 322 verified visits.</p>
        </div>
        <div slot="faqs">
          <h3 style="margin: 0 0 0.5rem">FAQs</h3>
          <p style="margin: 0">Does this provider offer video visits? No — in person only.</p>
        </div>
      `
    ),
};

/**
 * The Share and Save controls the production header carries, in the `actions` slot. Both are host
 * concerns: neither is API data, and what "save" means depends entirely on the page.
 */
export const WithHeaderActions: Story = {
  render: (args) =>
    template(
      args,
      html`
        <span slot="actions" style="display: flex; gap: 0.5rem">
          <zd-button variant="secondary" size="small">Share</zd-button>
          <zd-button variant="secondary" size="small">Save</zd-button>
        </span>
      `
    ),
};

/**
 * The network status line shows when `insurance-name` is set and the provider's
 * `accepts_patient_insurance` field is `accepted` or `not_accepted`. The fixture provider
 * has `accepted`, so it shows "In-network" here.
 */
export const WithInsurance: Story = {
  args: { insuranceName: 'CareFirst BlueCross BlueShield' },
};

/**
 * The profile in a narrow column, which is how it renders on a phone or in a sidebar. The header
 * keeps the photo box and the text column side by side, and the languages run wraps rather than
 * overflowing.
 */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 22rem">${story()}</div>`],
};
