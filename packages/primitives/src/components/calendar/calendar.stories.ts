import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdCalendar } from './calendar.js';
import './calendar.js';

const { args, argTypes, template } = getStorybookHelpers<ZdCalendar>('zd-calendar', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdCalendar> = {
  title: 'Primitives/Calendar',
  component: 'zd-calendar',
  // Charm sets these defaults in its constructor, so the manifest records none and the
  // helper seeds them as ''. An empty weekdayFormat reaches Intl.DateTimeFormat and throws.
  args: { ...args, weekdayFormat: 'short', firstDayOfWeek: undefined },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdCalendar>;

export const Default: Story = {
  args: { focusDate: '2026-03-01' },
};

export const WithValueAndBounds: Story = {
  args: { value: '2026-03-10', min: '2026-03-05', max: '2026-03-25' },
};

export const Range: Story = {
  args: { selectionMode: 'range', value: '2026-03-10/2026-03-14' },
};

export const WeekdaysUnavailable: Story = {
  args: { focusDate: '2026-03-01', disabledWeekDays: '0,6' },
};

export const Disabled: Story = {
  args: { focusDate: '2026-03-01', disabled: true },
};
