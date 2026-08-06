import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { ZdBookingFlow } from './booking-flow.js';
import './index.js';

/**
 * The whole funnel against the mock transport: no token, and no outbound request from any of
 * the five children (PHI-003). Search a ZIP, pick a provider, pick a time, fill the form.
 *
 * The form is real, so treat it as one: the documented testing data at
 * `https://api-docs.zocdoc.com/guides/testing-data` is what belongs in it, never a real
 * person's details (PHI-002).
 *
 * Which booking outcome the last step shows is decided by the *provider location*, not by a
 * story argument: the sentinel ids the sandbox matches on are the ones the mock matches on
 * too. The stories below therefore steer the outcome with `provider-location-id`, which is
 * also how they open past the first step.
 */
configureZocdocMock();

const { args, argTypes, template } = getStorybookHelpers<ZdBookingFlow>('zd-booking-flow', {
  excludeCategories: ['cssParts'],
});

/**
 * A documented visit reason id. Every story that opens past the search sets one: the visit
 * reason normally arrives with the provider the patient picked, and both availability and
 * booking require it, so a deep link without one would sit on a picker that never fetches.
 */
const VISIT_REASON_ID = 'pc_FRO-18leckytNKtruw5dLR';

const START_TIME = '2026-08-05T09:00:00-04:00';

/**
 * `booking-complete` and `booking-error` are declared on the component, so the helpers wire
 * both into the Actions panel — completing a booking logs the appointment id and status the
 * host page would receive.
 */
const meta: Meta<ZdBookingFlow> = {
  title: 'Booking/Booking Flow',
  component: 'zd-booking-flow',
  args: {
    ...args,
    zipCode: SCENARIOS.zipWithResults,
  },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdBookingFlow>;

/**
 * The default path. Press Search, pick a provider, pick a time, then fill the form — each step
 * replaces the last, and focus moves to the new step's heading on every transition.
 */
export const Default: Story = {};

/**
 * Opened past the search, the way a host page resumes a booking it already has a provider for.
 * The step is derived from the properties that are set, so setting `provider-location-id`
 * *is* navigating to the time step.
 */
export const StartAtTimeSelection: Story = {
  args: {
    providerLocationId: SCENARIOS.providerLocationConfirmed,
    visitReasonId: VISIT_REASON_ID,
  },
};

/**
 * Straight to the details form, with the provider and time already decided. Nothing is
 * submitted until the form validates every field, and no field value is ever reflected into an
 * attribute (PHI-001).
 */
export const StartAtPatientDetails: Story = {
  args: {
    providerLocationId: SCENARIOS.providerLocationConfirmed,
    visitReasonId: VISIT_REASON_ID,
    startTime: START_TIME,
  },
};

/**
 * The documented provider location whose booking comes back `pending_booking`. It is a
 * success — the request is in and there is a confirmation number — but the practice has yet to
 * accept, so the confirmation says so rather than claiming the appointment is confirmed.
 */
export const PendingPractice: Story = {
  args: {
    providerLocationId: SCENARIOS.providerLocationPending,
    visitReasonId: VISIT_REASON_ID,
    startTime: START_TIME,
  },
};

/**
 * The documented provider location whose booking answers **200** with `booking_failed`. The
 * flow stays on the form with a danger alert instead of showing a confirmation number for an
 * appointment that does not exist.
 */
export const BookingFails: Story = {
  args: {
    providerLocationId: SCENARIOS.providerLocationBookingFailed,
    visitReasonId: VISIT_REASON_ID,
    startTime: START_TIME,
  },
};

/**
 * Paging, wound down to two per page so the five fixture locations make three of them.
 *
 * Press Search, then Next: the list reports the page change, the flow hands it to the search,
 * and the search fetches it. Neither child knows the other exists — which is why the same
 * pager works when a host page supplies its own list.
 */
export const Paged: Story = {
  args: { pageSize: 2 },
};

/**
 * Day counts on the cards, which is the circle the other stories only show half of.
 *
 * Press Search. The results arrive, this component makes **one** `getAvailability` call for every
 * location on the page, and each card counts the slots it was handed — ten cards, one request.
 * Then press the range arrows above the list: the list reports `window-change`, this refetches
 * that range, and every card moves together. Nothing calls a method on a child in either
 * direction (COMP-002).
 *
 * A visit reason is required, because the availability endpoint requires one. Without it the list
 * renders with no grids at all rather than sending a request that would fail — which is also what
 * happens if the batch errors, and why there is no error state to show here.
 */
export const AvailabilityOnResults: Story = {
  args: { visitReasonId: VISIT_REASON_ID },
};

/**
 * The ZIP code that returns a 500. The search's own error state handles it and the flow stays
 * on the first step — user-facing copy only, never the developer-facing message (CLIENT-003).
 */
export const SearchFails: Story = {
  args: { zipCode: SCENARIOS.zipError },
};
