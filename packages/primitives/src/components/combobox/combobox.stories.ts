import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdCombobox } from './combobox.js';
import './combobox.js';
import '../option/option.js';
import '../option-group/option-group.js';

const { args, argTypes, template } = getStorybookHelpers<ZdCombobox>('zd-combobox', {
  excludeCategories: ['cssParts'],
});

const specialties = html`
  <zd-option value="dermatology">Dermatology</zd-option>
  <zd-option value="dentistry">Dentistry</zd-option>
  <zd-option value="cardiology">Cardiology</zd-option>
  <zd-option value="primary-care">Primary care</zd-option>
`;

const meta: Meta<ZdCombobox> = {
  title: 'Primitives/Combobox',
  component: 'zd-combobox',
  args: { ...args, label: 'Specialty' },
  argTypes,
  render: (args) => template(args, specialties),
};

export default meta;
type Story = StoryObj<ZdCombobox>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Search specialties', helpText: 'Type to filter the list.' },
};

export const Grouped: Story = {
  render: (args) =>
    template(
      args,
      html`
        <zd-option-group label="Medical">
          <zd-option value="cardiology">Cardiology</zd-option>
          <zd-option value="dermatology">Dermatology</zd-option>
        </zd-option-group>
        <zd-option-group label="Dental">
          <zd-option value="dentistry">Dentistry</zd-option>
          <zd-option value="orthodontics">Orthodontics</zd-option>
        </zd-option-group>
      `
    ),
};

export const Multiple: Story = {
  args: { label: 'Insurance carriers', multiple: true, withClear: true },
  render: (args) =>
    template(
      args,
      html`
        <zd-option value="aetna">Aetna</zd-option>
        <zd-option value="cigna">Cigna</zd-option>
        <zd-option value="unitedhealthcare">UnitedHealthcare</zd-option>
      `
    ),
};

export const Required: Story = {
  args: { required: true, invalid: true, errorMessage: 'Choose a specialty to continue.' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
