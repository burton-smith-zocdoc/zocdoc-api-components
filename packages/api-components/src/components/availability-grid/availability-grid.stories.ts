import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { buildTimeslots, SCENARIOS } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { AvailabilitySlot } from '../../client/types.js';
import { addDays, todayDayKey } from '../internal/provider-time.js';
import type { ZdAvailabilityGrid } from './availability-grid.js';
import './index.js';

/**
 * The self-fetching stories go through the mock transport, so no token is needed and nothing
 * leaves the browser (PHI-003).
 */
configureZocdocMock();

const { args, argTypes, template } = getStorybookHelpers<ZdAvailabilityGrid>(
  'zd-availability-grid',
  { excludeCategories: ['cssParts'] }
);

/** A documented visit reason id. Availability is always for one, so a fetch needs it. */
const VISIT_REASON_ID = 'pc_FRO-18leckytNKtruw5dLR';

/**
 * A day key relative to today. The window always starts at today, so a hard-coded date would
 * fall out of it and every count would read zero the following morning.
 *
 * Through the component's own helpers on purpose: unlike the tests, a story asserts nothing,
 * so there is no reason for it to hold an independent implementation of the same arithmetic.
 */
const dayFromToday = (offset: number): string => addDays(todayDayKey(), offset);

/**
 * An uneven fortnight, built with the same generator the mock transport uses so the shape and
 * the `-04:00` offset match what the sandbox sends (TEST-003). The gaps are the point: a
 * practice is closed some days, and those cells are what the grid exists to distinguish.
 */
const SUPPLIED_SLOTS: AvailabilitySlot[] = [
  ...buildTimeslots(dayFromToday(0), ['09:00']),
  ...buildTimeslots(dayFromToday(1), ['09:00', '09:30', '10:00', '14:00']),
  ...buildTimeslots(dayFromToday(2), ['11:00', '13:00']),
  ...buildTimeslots(dayFromToday(5), ['09:00', '09:30', '10:00', '11:00', '13:00', '14:00']),
  ...buildTimeslots(dayFromToday(6), ['16:00']),
  ...buildTimeslots(dayFromToday(9), ['09:00', '15:30']),
  ...buildTimeslots(dayFromToday(12), ['10:00']),
];

/**
 * Two weeks of day counts — the view a patient scans to pick a day worth opening, before
 * caring what the times on it are.
 *
 * `day-select`, `window-change`, and `more-select` are declared on the component, so the
 * helpers wire all three into the Actions panel.
 *
 * Two ways in, and the stories show both. Handed `timeslots` it counts them and fetches
 * nothing, which is how it sits inside a results list where the parent makes one batched call
 * for the whole page. Handed a `provider-location-id` and a `visit-reason-id` it fetches its
 * own window, which is what a profile page needs.
 */
const meta: Meta<ZdAvailabilityGrid> = {
  title: 'Booking/Availability Grid',
  component: 'zd-availability-grid',
  args: { ...args, timeslots: SUPPLIED_SLOTS },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdAvailabilityGrid>;

/**
 * Slots supplied by a parent. Press Later dates: the window moves and `window-change` shows up
 * in the Actions panel, but the counts do not change — this component cannot fetch the range it
 * just asked for, because without a visit reason there is nothing the API would accept. Handing
 * back new `timeslots` is the parent's half of that exchange (COMP-002).
 */
export const Supplied: Story = {};

/**
 * A range with nothing in it. The message announces it, and the day cells stay — they are
 * derived from the dates, not the data, so they are still true, and paging on is the only way
 * out of an empty fortnight.
 */
export const NoAvailability: Story = {
  args: { timeslots: [] },
};

/**
 * Fetching for itself, which is what setting a visit reason asks for. Dropping `timeslots` is
 * what hands the work over: a component that has been given slots has no reason to ask for
 * more.
 */
export const SelfFetching: Story = {
  args: {
    timeslots: undefined,
    providerLocationId: SCENARIOS.providerLocationConfirmed,
    visitReasonId: VISIT_REASON_ID,
  },
};

/**
 * The documented provider location the sandbox answers with no availability at all. A
 * successful request that found nothing, which is a different thing from a failure (COMP-001).
 */
export const FetchedEmpty: Story = {
  args: {
    timeslots: undefined,
    providerLocationId: SCENARIOS.providerLocationNoAvailability,
    visitReasonId: VISIT_REASON_ID,
  },
};

/**
 * The documented provider location whose availability call fails. The day cells go: fourteen
 * cells reading "No appts" because the request failed would be a claim about the practice that
 * the retry button beside them contradicts. User-facing copy only, never the developer-facing
 * message (CLIENT-003).
 */
export const FetchFails: Story = {
  args: {
    timeslots: undefined,
    providerLocationId: SCENARIOS.providerLocationError,
    visitReasonId: VISIT_REASON_ID,
  },
};

/**
 * One week instead of two, which is one row.
 *
 * `days` is both the number of cells and the range requested, so a shorter window is also a
 * smaller request — and the pager still tiles, moving on by exactly a week.
 */
export const OneWeek: Story = {
  args: { days: 7 },
};

/**
 * The "More" control, off by default. It emits `more-select` and does nothing else: where it
 * goes — a profile, a full calendar — is the host page's business, and only the host knows.
 */
export const WithMore: Story = {
  args: { showMore: true },
};

/**
 * A window opening later than today, the way a detail panel that starts at tomorrow does.
 * Setting `start-date` is what enables Earlier dates, which clamps back to today rather than
 * paging into the past — the API returns nothing there, and an empty range reads as no
 * availability at all.
 */
export const StartsLater: Story = {
  args: { startDate: dayFromToday(7) },
};

/**
 * The same fortnight inside a results card's width, where seven columns will not fit. The grid
 * drops to four by the space it actually has rather than by the viewport, which is why the host
 * is a containment context — this renders inside a card as often as it renders full width.
 */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 20rem">${story()}</div>`],
};
