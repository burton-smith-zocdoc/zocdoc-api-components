import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdTextArea } from './text-area.js';
import './text-area.js';

const { args, argTypes, template } = getStorybookHelpers<ZdTextArea>('zd-text-area', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdTextArea> = {
  title: 'Primitives/Text Area',
  component: 'zd-text-area',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdTextArea>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Reason for visit', placeholder: 'Tell the provider what to expect' },
};

export const Sizes: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-text-area label="Default size"></zd-text-area>
      <zd-text-area label="Small size" size="small"></zd-text-area>
    </zd-flex>
  `,
};

export const Disabled: Story = {
  args: { label: 'Reason for visit', disabled: true },
};

export const Readonly: Story = {
  args: { label: 'Reason for visit', readonly: true, value: 'Annual checkup' },
};

export const HelpText: Story = {
  args: { label: 'Reason for visit', helpText: 'Do not include personal health details here.' },
};

export const Required: Story = {
  args: { label: 'Reason for visit', required: true },
};

export const Invalid: Story = {
  args: {
    label: 'Reason for visit',
    required: true,
    invalid: true,
    errorMessage: 'Enter a reason for the visit.',
  },
};

export const MaxLength: Story = {
  args: { label: 'Reason for visit', maxlength: 120, helpText: 'Up to 120 characters.' },
};

export const Rows: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-text-area label="Two rows" rows="2"></zd-text-area>
      <zd-text-area label="Ten rows" rows="10"></zd-text-area>
    </zd-flex>
  `,
};

export const Resize: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-text-area label="Resize vertical (default)" resize="vertical"></zd-text-area>
      <zd-text-area label="Resize horizontal" resize="horizontal"></zd-text-area>
      <zd-text-area label="Resize both" resize="both"></zd-text-area>
      <zd-text-area label="No resize" resize="none"></zd-text-area>
    </zd-flex>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-text-area label="Label on top (default)" label-position="top"></zd-text-area>
      <zd-text-area label="Label at the start" label-position="start"></zd-text-area>
      <zd-text-area label="Label at the end" label-position="end"></zd-text-area>
    </zd-flex>
  `,
};
