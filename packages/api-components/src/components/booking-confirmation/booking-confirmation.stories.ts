import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { BOOKINGS, DEFAULT_BOOKING, SCENARIOS } from '../../client/mock/fixtures.js';
import type { ZdBookingConfirmation } from './booking-confirmation.js';
import './index.js';

/**
 * No mock transport and no token: this component fetches nothing. Everything it shows is
 * handed to it, which is also why it can be the whole of a standalone confirmation page.
 *
 * The ids below are the sandbox's own documented values, and the provider name comes from
 * the fixture directory. Nothing here is patient data — a confirmation deliberately shows
 * none, since a booking reference and a time are enough to identify the appointment
 * without repeating who it is for (PHI-001).
 */
const { args, argTypes, template } = getStorybookHelpers<ZdBookingConfirmation>(
  'zd-booking-confirmation',
  { excludeCategories: ['cssParts'] }
);

const PROVIDER = 'Dr. Avery Sandoval, MD';

/** 9 AM where the practice is. The `-04:00` is the provider's, and it is what is shown. */
const START_TIME = '2026-08-05T09:00:00-04:00';

const meta: Meta<ZdBookingConfirmation> = {
  title: 'API Components/Booking Confirmation',
  component: 'zd-booking-confirmation',
  args: {
    ...args,
    appointmentId: DEFAULT_BOOKING.appointmentId,
    startTime: START_TIME,
    providerName: PROVIDER,
  },
  argTypes: {
    ...argTypes,
    /*
     * The manifest reports `status` as the named `AppointmentStatus`, which the helpers can
     * only turn into a text field. Spelling the options out makes the difference between the
     * two booking outcomes — and the nothing rendered for anything else — something you can
     * flip between rather than read about.
     */
    status: {
      control: 'select',
      options: ['confirmed', 'pending_booking', 'booking_failed', 'cancelled'],
    },
  },
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdBookingConfirmation>;

/**
 * The booking a practice on automatic confirmation returns. The time reads as 9:00 whatever
 * zone this browser is in, because the offset in `startTime` belongs to the practice.
 */
export const Confirmed: Story = {};

/**
 * The same 200, different status. A practice on manual confirmation returns
 * `pending_booking`, and calling that "confirmed" is how a patient ends up not showing up
 * for an appointment nobody accepted.
 */
export const PendingBooking: Story = {
  args: {
    appointmentId: BOOKINGS[SCENARIOS.providerLocationPending]?.appointmentId,
    status: 'pending_booking',
  },
};

/**
 * Only the confirmation number, which is the least a host page can pass. Each line appears
 * on its own terms rather than as an empty row or a placeholder.
 */
export const ReferenceOnly: Story = {
  args: { startTime: undefined, providerName: undefined },
};

/**
 * A status that is not a successful booking renders nothing at all — an empty canvas here is
 * the story. A failed booking belongs to the flow's error state, which owns retrying, and
 * `booking_failed` arrives on a 200 just like the two above.
 */
export const NotABooking: Story = {
  args: {
    appointmentId: BOOKINGS[SCENARIOS.providerLocationBookingFailed]?.appointmentId,
    status: 'booking_failed',
  },
};
