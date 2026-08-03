import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdTabs } from './tabs.js';
import './tabs.js';
import '../tab/tab.js';
import '../tab-panel/tab-panel.js';

const { args, argTypes, template } = getStorybookHelpers<ZdTabs>('zd-tabs', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdTabs> = {
  title: 'Primitives/Tabs',
  component: 'zd-tabs',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-tab>Availability</zd-tab>
        <zd-tab>About</zd-tab>
        <zd-tab>Reviews</zd-tab>
        <zd-tab-panel>Next available: Tuesday at 9:00 AM</zd-tab-panel>
        <zd-tab-panel>Board certified, accepting new patients.</zd-tab-panel>
        <zd-tab-panel>4.9 out of 5 from 320 patients.</zd-tab-panel>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdTabs>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { layout: 'vertical' },
  render: (args) =>
    template(
      args,
      html`
        <zd-tab>Availability</zd-tab>
        <zd-tab>About</zd-tab>
        <zd-tab-panel>Next available: Tuesday at 9:00 AM</zd-tab-panel>
        <zd-tab-panel>Board certified, accepting new patients.</zd-tab-panel>
      `
    ),
};
