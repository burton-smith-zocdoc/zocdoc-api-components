import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { PROVIDER_LOCATIONS, SCENARIOS } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { ZdAvailabilityPicker } from './availability-picker.js';
import './index.js';

/**
 * Stories run against the mock transport, so they need no token and make no outbound
 * request (PHI-003). States are driven by the documented sentinel provider location ids
 * the real sandbox recognises, not by a mock-only flag.
 *
 * No `availabilityStartDate` is pinned here: the window comes from what the component
 * asks for, which is what a demo should show. Stories therefore render today onward and
 * the dates move day to day — deliberate, since a picker frozen on a past date is the one
 * thing this component must never do.
 */
configureZocdocMock();

const { args, argTypes, template } = getStorybookHelpers<ZdAvailabilityPicker>(
  'zd-availability-picker',
  { excludeCategories: ['cssParts'] }
);

const PROVIDER_LOCATION_ID =
  PROVIDER_LOCATIONS[0]?.provider_location_id ??
  'pr_abc123-def456_wxyz7890|lo_abc123-def456_wxyz7890';

const VISIT_REASON_ID = 'pc_FRO-18leckytNKtruw5dLR';

/**
 * `slot-select` is declared on the component, so the helpers wire it into the Actions
 * panel — choosing a time logs the `startTime` that would go to `POST /v1/appointments`.
 */
const meta: Meta<ZdAvailabilityPicker> = {
  title: 'Booking/Availability Picker',
  component: 'zd-availability-picker',
  args: {
    ...args,
    providerLocationId: PROVIDER_LOCATION_ID,
    visitReasonId: VISIT_REASON_ID,
  },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdAvailabilityPicker>;

/**
 * A week of availability with gaps, because the fixture generator closes the practice
 * every third day. Pick a day to see its times; the selected day carries `aria-current`.
 */
export const Default: Story = {};

/**
 * A month, which is the widest window the API allows. The day strip scrolls horizontally
 * rather than wrapping, so the times stay in a predictable place as days are picked.
 */
export const FullMonth: Story = {
  args: { days: 30 },
};

/**
 * The documented provider location with nothing bookable. Empty is a success, not an
 * error — the endpoint answers about the location either way (COMP-001).
 */
export const NoAvailability: Story = {
  args: { providerLocationId: SCENARIOS.providerLocationNoAvailability },
};

/**
 * The documented provider location that returns a 500. The alert shows user-facing copy,
 * never the developer-facing message from the client (CLIENT-003), and offers a retry.
 */
export const RequestFails: Story = {
  args: { providerLocationId: SCENARIOS.providerLocationError },
};

/**
 * Nothing is fetched until both ids are present, so a picker waiting on an earlier step
 * renders empty rather than firing a request it cannot complete.
 */
export const AwaitingVisitReason: Story = {
  args: { visitReasonId: undefined },
};

/**
 * The same picker in a narrow column, which is how this renders inside a sidebar. The day
 * strip scrolls and the times wrap, so neither overflows the container.
 */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 18rem">${story()}</div>`],
};
