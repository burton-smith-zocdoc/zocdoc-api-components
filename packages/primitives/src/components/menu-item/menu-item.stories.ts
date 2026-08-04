import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdMenuItem } from './menu-item.js';
import './menu-item.js';

const { args, argTypes, template } = getStorybookHelpers<ZdMenuItem>('zd-menu-item', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdMenuItem> = {
  title: 'Primitives/Menu Item',
  component: 'zd-menu-item',
  args,
  argTypes,
  render: (args) => template(args, html`Reschedule`),
};

export default meta;
type Story = StoryObj<ZdMenuItem>;

export const Default: Story = {};
