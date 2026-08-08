import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { addDays, todayDayKey } from '../../utilities/provider-time.js';
import type { ZdAvailabilityWindow } from './availability-window.js';
import './index.js';

const { args, argTypes, template } = getStorybookHelpers<ZdAvailabilityWindow>(
  'zd-availability-window',
  { excludeCategories: ['cssParts'] }
);

const today = todayDayKey();
const twoWeeksLater = addDays(today, 13);

/**
 * The date range pager shared by `zd-availability-grid` and `zd-provider-results`.
 *
 * Renders ghost icon-only buttons for navigation with visually hidden labels for accessibility
 * (I18N-001). Emits `window-shift` with `{ direction: -1 | 1 }` when pressed.
 */
const meta: Meta<ZdAvailabilityWindow> = {
  title: 'API Components/Availability Window',
  component: 'zd-availability-window',
  args: {
    ...args,
    startDate: today,
    endDate: twoWeeksLater,
    canGoEarlier: false,
  },
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdAvailabilityWindow>;

/** Default state starting at today — Earlier dates is disabled since there's nowhere earlier to go. */
export const Default: Story = {};

/** Starting later than today, so both navigation directions are available. */
export const CanGoEarlier: Story = {
  args: {
    startDate: addDays(today, 14),
    endDate: addDays(today, 27),
    canGoEarlier: true,
  },
};

/** A one-week range instead of two. */
export const OneWeek: Story = {
  args: {
    endDate: addDays(today, 6),
  },
};

/** Inside a narrow container to verify layout at small sizes. */
export const NarrowContainer: Story = {
  decorators: [(story) => html`<div style="max-inline-size: 16rem">${story()}</div>`],
};
