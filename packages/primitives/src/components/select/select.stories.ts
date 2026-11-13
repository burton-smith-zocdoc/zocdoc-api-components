import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdSelect } from './select.js';
import './select.js';

const { args, argTypes, template } = getStorybookHelpers<ZdSelect>('zd-select', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdSelect> = {
  title: 'Primitives/Select',
  component: 'zd-select',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <option value="">Select an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdSelect>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Choose a specialty' },
  render: (args) =>
    template(
      args,
      html`
        <option value="">Select specialty</option>
        <option value="dentist">Dentist</option>
        <option value="dermatologist">Dermatologist</option>
        <option value="primary-care">Primary Care</option>
      `
    ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Required: Story = {
  args: { label: 'Choose a specialty', required: true },
};

export const HelpText: Story = {
  args: { label: 'Choose a specialty', helpText: 'You can change this later.' },
};

export const Invalid: Story = {
  args: {
    label: 'Choose a specialty',
    required: true,
    invalid: true,
    errorMessage: 'Select a specialty to continue.',
  },
};

export const Readonly: Story = {
  args: { label: 'Choose a specialty', readonly: true },
};

export const Multiple: Story = {
  args: { label: 'Choose specialties', multiple: true },
  render: (args) =>
    template(
      args,
      html`
        <option value="dentist">Dentist</option>
        <option value="dermatologist">Dermatologist</option>
        <option value="primary-care">Primary Care</option>
      `
    ),
};

export const Sizes: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-select label="Default size">
        <option value="1">Option 1</option>
      </zd-select>
      <zd-select label="Small size" size="small">
        <option value="1">Option 1</option>
      </zd-select>
    </zd-flex>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-select label="Label on top (default)" label-position="top">
        <option value="1">Option 1</option>
      </zd-select>
      <zd-select label="Label at the start" label-position="start">
        <option value="1">Option 1</option>
      </zd-select>
    </zd-flex>
  `,
};
