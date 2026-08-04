import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdDialog } from './dialog.js';
import './dialog.js';
import '../button/button.js';
import '../icon/icon.js';

const { args, argTypes, template } = getStorybookHelpers<ZdDialog>('zd-dialog', {
  excludeCategories: ['cssParts'],
});

function openDialog(e: Event) {
  const button = e.target as HTMLElement;
  const dialog = button.parentElement?.querySelector('zd-dialog') as ZdDialog;
  dialog?.show();
}

function closeDialog(e: Event) {
  const button = e.target as HTMLElement;
  const dialog = button.closest('zd-dialog') as ZdDialog;
  dialog?.hide();
}

const meta: Meta<ZdDialog> = {
  title: 'Primitives/Dialog',
  component: 'zd-dialog',
  args,
  argTypes,
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Dialog</zd-button>
    ${template(args, html`Your appointment is confirmed for Tuesday at 9:00 AM.`)}
  `,
};

export default meta;
type Story = StoryObj<ZdDialog>;

export const Default: Story = {
  args: { heading: 'Appointment Confirmed' },
};

export const OpenByDefault: Story = {
  args: { open: true, heading: 'Appointment Confirmed' },
  render: (args) => template(args, html`Your appointment is confirmed for Tuesday at 9:00 AM.`),
};

export const WithFooter: Story = {
  args: { heading: 'Cancel this appointment?' },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Dialog</zd-button>
    ${template(
      args,
      html`
        You can rebook at any time.
        <div slot="footer">
          <zd-button variant="ghost" @click=${closeDialog}>Keep it</zd-button>
          <zd-button variant="destructive" @click=${closeDialog}>Cancel appointment</zd-button>
        </div>
      `
    )}
  `,
};

export const WithActionsSlot: Story = {
  args: { heading: 'Patient Details' },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Dialog</zd-button>
    ${template(
      args,
      html`
        <zd-button slot="actions" variant="ghost" size="small" @click=${closeDialog}>
          <zd-icon slot="start" name="chevron-left"></zd-icon>
          Back
        </zd-button>
        Review the patient information below before confirming.
        <div slot="footer">
          <zd-button variant="ghost" @click=${closeDialog}>Cancel</zd-button>
          <zd-button @click=${closeDialog}>Confirm</zd-button>
        </div>
      `
    )}
  `,
};

export const WithHeadingSlot: Story = {
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Dialog</zd-button>
    ${template(
      args,
      html`
        <span slot="heading">
          <zd-icon name="calendar"></zd-icon>
          Reschedule Appointment
        </span>
        Select a new date and time for your appointment.
        <div slot="footer">
          <zd-button variant="ghost" @click=${closeDialog}>Cancel</zd-button>
          <zd-button @click=${closeDialog}>Reschedule</zd-button>
        </div>
      `
    )}
  `,
};

export const AlertMode: Story = {
  args: { heading: 'Session Expiring', alert: true },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Alert Dialog</zd-button>
    ${template(
      args,
      html`
        Your session will expire in 2 minutes. Would you like to continue?
        <div slot="footer">
          <zd-button variant="ghost" @click=${closeDialog}>Sign Out</zd-button>
          <zd-button @click=${closeDialog}>Continue Session</zd-button>
        </div>
      `
    )}
  `,
};

export const NoHeader: Story = {
  args: { noHeader: true },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Dialog</zd-button>
    ${template(
      args,
      html`
        <p>This dialog has no visible header. The close button is still accessible via keyboard.</p>
        <div slot="footer">
          <zd-button @click=${closeDialog}>Close</zd-button>
        </div>
      `
    )}
  `,
};

export const HideCloseButton: Story = {
  args: { heading: 'Important Notice', hideCloseButton: true },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Dialog</zd-button>
    ${template(
      args,
      html`
        The close button is hidden until focused.
        <div slot="footer">
          <zd-button @click=${closeDialog}>Got it</zd-button>
        </div>
      `
    )}
  `,
};

export const PositionStart: Story = {
  args: { heading: 'Side Panel', position: 'start' },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Start Position</zd-button>
    ${template(
      args,
      html`
        This dialog slides in from the start (left in LTR).
        <div slot="footer">
          <zd-button @click=${closeDialog}>Close</zd-button>
        </div>
      `
    )}
  `,
};

export const PositionEnd: Story = {
  args: { heading: 'Side Panel', position: 'end' },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open End Position</zd-button>
    ${template(
      args,
      html`
        This dialog slides in from the end (right in LTR).
        <div slot="footer">
          <zd-button @click=${closeDialog}>Close</zd-button>
        </div>
      `
    )}
  `,
};

export const PositionBottom: Story = {
  args: { heading: 'Bottom Sheet', position: 'bottom' },
  render: (args) => html`
    <zd-button @click=${openDialog}>Open Bottom Sheet</zd-button>
    ${template(
      args,
      html`
        This dialog slides up from the bottom, useful for mobile interfaces.
        <div slot="footer">
          <zd-button @click=${closeDialog}>Close</zd-button>
        </div>
      `
    )}
  `,
};
