import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdCheckbox } from './checkbox.js';
import './checkbox.js';

const { args, argTypes, template } = getStorybookHelpers<ZdCheckbox>('zd-checkbox', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdCheckbox> = {
  title: 'Primitives/Checkbox',
  component: 'zd-checkbox',
  args,
  argTypes,
  render: (args) => template(args, html`Send me appointment reminders`),
};

export default meta;
type Story = StoryObj<ZdCheckbox>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <zd-flex direction="column" gap="12">
      <zd-checkbox>Default size</zd-checkbox>
      <zd-checkbox size="small">Small size</zd-checkbox>
    </zd-flex>
  `,
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => template(args, html`Some visit reasons selected`),
};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Readonly: Story = {
  args: { readonly: true, checked: true },
};

export const HelpText: Story = {
  args: { helpText: 'You can change this later in your settings.' },
};

export const Required: Story = {
  args: { required: true },
  render: (args) => template(args, html`I agree to the terms`),
};

export const Invalid: Story = {
  args: { required: true, invalid: true, errorMessage: 'You have to agree before booking.' },
  render: (args) => template(args, html`I agree to the terms`),
};

export const LabelPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="12">
      <zd-checkbox label-position="end">Label at the end (default)</zd-checkbox>
      <zd-checkbox label-position="start">Label at the start</zd-checkbox>
      <zd-checkbox label-position="top">Label on top</zd-checkbox>
    </zd-flex>
  `,
};
