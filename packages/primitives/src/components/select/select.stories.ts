import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdSelect } from './select.js';
import './select.js';

const { args, argTypes, template } = getStorybookHelpers<ZdSelect>('zd-select', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdSelect> = {
  title: 'Primitives/Select',
  component: 'zd-select',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  `),
};

export default meta;
type Story = StoryObj<ZdSelect>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Choose a specialty' },
  render: (args) => template(args, html`
    <option value="">Select specialty</option>
    <option value="dentist">Dentist</option>
    <option value="dermatologist">Dermatologist</option>
    <option value="primary-care">Primary Care</option>
  `),
};

export const Disabled: Story = {
  args: { disabled: true },
};
