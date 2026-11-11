import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdDateRangePicker } from './date-range-picker.js';
import './date-range-picker.js';

const { args, argTypes, template } = getStorybookHelpers<ZdDateRangePicker>(
  'zd-date-range-picker',
  {
    excludeCategories: ['cssParts'],
  }
);

const meta: Meta<ZdDateRangePicker> = {
  title: 'Primitives/Date Range Picker',
  component: 'zd-date-range-picker',
  // Charm sets these defaults in its constructor, so the manifest records none and the
  // helper seeds them as ''. An empty weekdayFormat reaches Intl.DateTimeFormat and throws.
  args: { ...args, weekdayFormat: 'short', firstDayOfWeek: undefined },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdDateRangePicker>;

export const Default: Story = {
  args: { label: 'Availability window' },
};

export const WithValue: Story = {
  args: {
    label: 'Availability window',
    value: '2026-03-10/2026-03-14',
    helpText: 'Choose a start and end date.',
  },
};

export const Open: Story = {
  args: { label: 'Availability window', focusDate: '2026-03-01', open: true },
};

export const Invalid: Story = {
  args: {
    label: 'Availability window',
    required: true,
    invalid: true,
    errorMessage: 'Enter a date range.',
  },
};

export const Disabled: Story = {
  args: { label: 'Availability window', disabled: true },
};
