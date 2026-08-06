import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { buildAvailability, PROVIDER_LOCATIONS } from '../../client/mock/fixtures.js';
import { addDays, todayDayKey } from '../internal/provider-time.js';
import type { ZdProviderResults } from './provider-results.js';
import './index.js';

const { args, argTypes, template } = getStorybookHelpers<ZdProviderResults>('zd-provider-results', {
  excludeCategories: ['cssParts'],
});

/** A grey circle, inline, so the photo story fetches nothing. See `WithPhotos`. */
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23d8d8d8"/%3E%3C/svg%3E';

/**
 * A `YYYY-MM-DD` key relative to today, which is what the availability fixtures are built around:
 * a hard-coded date would fall behind the window and every count would read zero tomorrow.
 *
 * `todayDayKey` reads the local date rather than going through `toISOString`, which would use
 * UTC and name tomorrow for anyone west of Greenwich in the evening.
 */
const dayFromToday = (offset: number): string => addDays(todayDayKey(), offset);

/**
 * What one batched `getAvailability` for this page would return: one entry per provider, built by
 * the same generator the mock transport uses. The list never fetches this itself — see
 * `WithAvailability`.
 */
const AVAILABILITY = PROVIDER_LOCATIONS.map((location) =>
  buildAvailability(location.provider_location_id, dayFromToday(0), 14)
);

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
 * The count line and the pager, both of which need `total-count`.
 *
 * `providers` is one page, so it is the only thing this component cannot count for itself —
 * "2 providers" for page four of 334 would be worse than saying nothing, which is what it does
 * when no total is given. Paging is reported rather than performed: `page-change` shows up in
 * the Actions panel and the list stays put, because fetching the next page belongs to whatever
 * ran the search.
 */
export const Paged: Story = {
  args: { totalCount: 334, page: 3, pageSize: 10 },
};

/** A total that fits on one page gets the count and no pager — one page is nothing to page. */
export const SinglePage: Story = {
  args: { totalCount: PROVIDER_LOCATIONS.length },
};

/**
 * The production card: a summary with a fortnight of day counts under it and one range control
 * for the whole list.
 *
 * Nothing here fetches. `availability` is a batch a parent already made — the endpoint takes an
 * array of `provider_location_ids`, so one request covers the page, and the cards count what they
 * are handed (COMP-002). Pressing the arrows moves the dates and logs `window-change` in the
 * Actions panel without the counts changing, which is exactly what the component promises: the
 * range is reported, and refetching it belongs to whoever owns the search. `zd-booking-flow` is
 * where that circle closes.
 *
 * The last fixture provider is the no-availability sentinel, so its card shows a full window of
 * "No appts" — the state a practice with a closed book really returns.
 */
export const WithAvailability: Story = {
  args: { totalCount: 334, availability: AVAILABILITY, availabilityDays: 14 },
};

/**
 * The same page a week out, which is what a host page binds back down after `window-change`.
 *
 * The counts are the same fixtures, so most cells read "No appts" here — the batch was fetched
 * for the first window and the cards only count the days on show. That mismatch is the reason
 * `zd-booking-flow` refetches on every move rather than paging the data it already has.
 */
export const AvailabilityLaterWindow: Story = {
  args: {
    totalCount: 334,
    availability: AVAILABILITY,
    availabilityStart: dayFromToday(7),
  },
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
