import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdMenu } from './menu.js';
import './menu.js';
import '../menu-item/menu-item.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdMenu>('zd-menu', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdMenu> = {
  title: 'Primitives/Menu',
  component: 'zd-menu',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-button slot="trigger">Appointment options</zd-button>
        <zd-menu-item>Reschedule</zd-menu-item>
        <zd-menu-item>Cancel</zd-menu-item>
        <zd-menu-item>Add to calendar</zd-menu-item>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdMenu>;

export const Default: Story = {};
