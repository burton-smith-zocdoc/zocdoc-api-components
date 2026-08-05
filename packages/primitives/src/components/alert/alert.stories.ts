import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdAlert } from './alert.js';
import './alert.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdAlert>('zd-alert', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdAlert> = {
  title: 'Primitives/Alert',
  component: 'zd-alert',
  args: { ...args, open: true },
  argTypes,
  render: (args) => template(args, html`Alert message`),
};

export default meta;
type Story = StoryObj<ZdAlert>;

export const Default: Story = {};

export const WithHeading: Story = {
  args: { heading: 'Important Notice' },
  render: (args) => template(args, html`Your appointment has been booked successfully.`),
};

export const Dismissible: Story = {
  args: { dismissible: true },
  render: (args) => template(args, html`This provider has limited availability.`),
};

export const WithHeadingAndDismissible: Story = {
  args: { heading: 'Error', dismissible: true },
  render: (args) => template(args, html`Unable to complete booking. Please try again.`),
};

export const Info: Story = {
  args: { variant: 'info' },
  render: (args) => template(args, html`This provider is accepting new patients.`),
};

export const Success: Story = {
  args: { variant: 'success', heading: 'Appointment booked' },
  render: (args) => template(args, html`You'll get a confirmation email shortly.`),
};

export const Warning: Story = {
  args: { variant: 'warning', heading: 'Insurance not verified' },
  render: (args) => template(args, html`We couldn't confirm your plan with this provider.`),
};

export const Danger: Story = {
  args: { variant: 'danger', heading: 'Booking failed' },
  render: (args) => template(args, html`We couldn't complete your booking.`),
};

/**
 * The severities side by side, which is the only way to see whether they read as
 * a set. Each renders its own icon, so a monochrome display still distinguishes
 * them.
 */
export const Severities: Story = {
  render: () => html`
    <div style="display: grid; gap: 0.75rem;">
      <zd-alert open variant="info">This provider is accepting new patients.</zd-alert>
      <zd-alert open variant="success">Your appointment has been booked.</zd-alert>
      <zd-alert open variant="warning">We couldn't confirm your insurance plan.</zd-alert>
      <zd-alert open variant="danger">We couldn't complete your booking.</zd-alert>
    </div>
  `,
};

/**
 * The composite the API components render for a failed request: a severity, a
 * heading, a retry control in the `action` slot, and a dismiss button. This is
 * where a tint earns its keep over a solid fill — a `secondary` button on a solid
 * `danger` surface would be unreadable.
 */
export const DangerWithAction: Story = {
  render: () => html`
    <zd-alert open dismissible variant="danger" heading="Booking failed">
      We couldn't complete your booking.
      <zd-button slot="action" variant="secondary" size="small">Try again</zd-button>
    </zd-alert>
  `,
};

/** A slotted icon replaces the severity's own. */
export const CustomIcon: Story = {
  render: () => html`
    <zd-alert open variant="warning" heading="Insurance not verified">
      <zd-icon slot="icon" name="warning-shield"></zd-icon>
      We couldn't confirm your plan with this provider.
    </zd-alert>
  `,
};
