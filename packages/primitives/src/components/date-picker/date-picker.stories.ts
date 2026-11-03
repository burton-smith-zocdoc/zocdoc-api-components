import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdDatePicker } from './date-picker.js';
import './date-picker.js';

const { args, argTypes, template } = getStorybookHelpers<ZdDatePicker>('zd-date-picker', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdDatePicker> = {
  title: 'Primitives/Date Picker',
  component: 'zd-date-picker',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdDatePicker>;

export const Default: Story = {
  args: { label: 'Appointment date' },
};

export const WithValue: Story = {
  args: {
    label: 'Appointment date',
    value: '2026-03-10',
    helpText: 'Choose a date within the next month.',
  },
};

export const Open: Story = {
  args: { label: 'Appointment date', focusDate: '2026-03-01', open: true },
};

export const Invalid: Story = {
  args: { label: 'Appointment date', required: true, invalid: true, errorMessage: 'Enter a date.' },
};

export const Disabled: Story = {
  args: { label: 'Appointment date', disabled: true },
};
