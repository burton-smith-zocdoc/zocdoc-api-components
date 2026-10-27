import type { Meta, StoryObj } from '@storybook/web-components';
import { html, nothing } from 'lit';
import {
  buildAppointment,
  buildTimeslots,
  PROVIDER_LOCATIONS,
  SCENARIOS,
} from '../../client/mock/fixtures.js';
import { addDays, todayDayKey } from '../../utilities/provider-time.js';
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
    hidePhoto: false,
  },
  render: (args) => html`
    <zd-appointment
      appointment-id=${args.appointmentId ?? ''}
      provider-name=${args.providerName ?? nothing}
      ?hide-photo=${args.hidePhoto}
    ></zd-appointment>
  `,
};

export default meta;
type Story = StoryObj<ZdAppointment>;

const dayFromToday = (offset: number): string => addDays(todayDayKey(), offset);

/** Confirmed. Both actions are offered, and the provider is looked up by location. */
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

/** No photo, for host pages that make no image requests. */
export const WithoutPhoto: Story = { args: { hidePhoto: true } };

/**
 * A host that also passes `provider-name`. It shows during the mock's latency and is replaced
 * by the looked-up summary. The lookup-fails fallback is pinned by the component tests instead:
 * every mock appointment's location answers, and a story must not reach into private members
 * to force a failure.
 */
export const WithProviderName: Story = { args: { providerName: 'Dr. Avery Sandoval, MD' } };

/** The appointment as a host page supplies it. Logged requests, and the host answers below. */
const SUPPLIED = buildAppointment(SCENARIOS.appointmentConfirmed, dayFromToday(3))!;

/**
 * Supplied mode, as an MCP server would use it: the host sets `appointment` and answers each
 * request event. Here it answers a cancel with the cancelled appointment after a pause, so the
 * "Cancelling your appointment…" status shows first, and fails every reschedule with
 * `actionError`.
 */
export const Supplied: Story = {
  render: () => html`
    <zd-appointment
      .appointment=${SUPPLIED}
      .providerLocation=${PROVIDER_LOCATIONS[0]}
      .rescheduleTimeslots=${buildTimeslots(dayFromToday(1), ['09:00', '14:00'])}
      @appointment-cancel-request=${(event: Event) => {
        const element = event.currentTarget as ZdAppointment;
        setTimeout(() => {
          element.appointment = { ...SUPPLIED, appointment_status: 'cancelled' };
        }, 1500);
      }}
      @appointment-reschedule-request=${(event: Event) => {
        const element = event.currentTarget as ZdAppointment;
        setTimeout(() => (element.actionError = 'failed'), 1500);
      }}
    ></zd-appointment>
  `,
};

/** Supplied mode with a request the host never answers, so the busy state stays on screen. */
export const SuppliedPending: Story = {
  render: () => html`
    <zd-appointment
      .appointment=${SUPPLIED}
      .providerLocation=${PROVIDER_LOCATIONS[0]}
      @appointment-cancel-request=${() => undefined}
    ></zd-appointment>
  `,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector<ZdAppointment>('zd-appointment')!;
    await element.updateComplete;
    await element.cancel();
  },
};
