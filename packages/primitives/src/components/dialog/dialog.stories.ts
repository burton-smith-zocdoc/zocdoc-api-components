import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdDialog } from './dialog.js';
import './dialog.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdDialog>('zd-dialog', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdDialog> = {
  title: 'Primitives/Dialog',
  component: 'zd-dialog',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`Your appointment is confirmed for Tuesday at 9:00 AM.`),
};

export default meta;
type Story = StoryObj<ZdDialog>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: { open: true, heading: 'Cancel this appointment?' },
  render: (args) =>
    template(
      args,
      html`
        You can rebook at any time.
        <div slot="footer">
          <zd-button variant="ghost">Keep it</zd-button>
          <zd-button variant="destructive">Cancel appointment</zd-button>
        </div>
      `
    ),
};
