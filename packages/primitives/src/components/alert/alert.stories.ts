import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdAlert } from './alert.js';
import './alert.js';

const { args, argTypes, template } = getStorybookHelpers<ZdAlert>('zd-alert', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdAlert> = {
  title: 'Primitives/Alert',
  component: 'zd-alert',
  tags: ['autodocs'],
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
