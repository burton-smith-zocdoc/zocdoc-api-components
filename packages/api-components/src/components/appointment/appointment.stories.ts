import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import { configureZocdocMock } from '../../client/mock/transport.js';
import type { ZdAppointment } from './appointment.js';
import './index.js';

/**
 * Driven by the mock with the sandbox's own appointment IDs, so each story is the state the
 * real sandbox returns for that ID. The mock is stateless: cancelling here and reloading
 * shows the original status again.
 */
configureZocdocMock();

const meta: Meta<ZdAppointment> = {
  title: 'API Components/Appointment',
  component: 'zd-appointment',
  args: {
    appointmentId: SCENARIOS.appointmentConfirmed,
    providerName: 'Dr. Avery Sandoval, MD',
  },
  render: (args) => html`
    <zd-appointment
      appointment-id=${args.appointmentId ?? ''}
      provider-name=${args.providerName ?? ''}
    ></zd-appointment>
  `,
};

export default meta;
type Story = StoryObj<ZdAppointment>;

/** Confirmed. Both actions are offered. */
export const Confirmed: Story = {};

/** Waiting on the practice. Both actions are still offered. */
export const Pending: Story = { args: { appointmentId: SCENARIOS.appointmentPending } };

/** A time change waiting on the practice. */
export const PendingReschedule: Story = {
  args: { appointmentId: SCENARIOS.appointmentPendingReschedule },
};

/** A failed time change. Only cancelling is offered. */
export const RescheduleFailed: Story = {
  args: { appointmentId: SCENARIOS.appointmentRescheduleFailed },
};

/** Already cancelled. No actions. */
export const Cancelled: Story = { args: { appointmentId: SCENARIOS.appointmentCancelled } };

/** Marked as a no-show. No actions. */
export const NoShow: Story = { args: { appointmentId: SCENARIOS.appointmentNoShow } };

/** The documented 404 ID. */
export const NotFound: Story = { args: { appointmentId: SCENARIOS.appointmentNotFound } };

/** The documented 500 ID. Retry is offered. */
export const ServerError: Story = { args: { appointmentId: SCENARIOS.appointmentError } };
