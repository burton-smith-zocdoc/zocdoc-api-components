import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdCheckboxGroup } from './checkbox-group.js';
import './checkbox-group.js';
import '../checkbox/checkbox.js';

const { args, argTypes, template } = getStorybookHelpers<ZdCheckboxGroup>('zd-checkbox-group', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdCheckboxGroup> = {
  title: 'Primitives/CheckboxGroup',
  component: 'zd-checkbox-group',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-checkbox value="morning">Morning</zd-checkbox>
        <zd-checkbox value="afternoon">Afternoon</zd-checkbox>
        <zd-checkbox value="evening">Evening</zd-checkbox>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdCheckboxGroup>;

export const Default: Story = {
  args: { label: 'Preferred times', name: 'times' },
};

export const Horizontal: Story = {
  args: { label: 'Preferred times', name: 'times', layout: 'horizontal' },
};

export const WithDefaultValue: Story = {
  args: { label: 'Languages spoken', name: 'languages', value: 'en,es' },
  render: (args) =>
    template(
      args,
      html`
        <zd-checkbox value="en">English</zd-checkbox>
        <zd-checkbox value="es">Spanish</zd-checkbox>
        <zd-checkbox value="fr">French</zd-checkbox>
      `
    ),
};

export const HelpText: Story = {
  args: {
    label: 'Preferred times',
    name: 'times',
    helpText: 'Choose all that apply.',
  },
};

export const RequiredInvalid: Story = {
  args: {
    label: 'Preferred times',
    name: 'times',
    required: true,
    invalid: true,
    errorMessage: 'Choose at least one time.',
  },
};

export const Disabled: Story = {
  args: { label: 'Preferred times', name: 'times', disabled: true },
};
