import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdMenuGroup } from './menu-group.js';
import './menu-group.js';
import '../menu/menu.js';
import '../menu-item/menu-item.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdMenuGroup>('zd-menu-group', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdMenuGroup> = {
  title: 'Primitives/Menu Group',
  component: 'zd-menu-group',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-menu-item>In person</zd-menu-item>
        <zd-menu-item>Video visit</zd-menu-item>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdMenuGroup>;

export const Default: Story = {};

export const InMenu: Story = {
  render: () => html`
    <zd-menu>
      <zd-button slot="trigger">Filters</zd-button>
      <zd-menu-group heading="Visit type" select="single">
        <zd-menu-item>In person</zd-menu-item>
        <zd-menu-item>Video visit</zd-menu-item>
      </zd-menu-group>
    </zd-menu>
  `,
};
