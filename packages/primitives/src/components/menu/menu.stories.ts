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

const stage = 'padding: 16px 48px 200px;';

export const Open: Story = {
  args: { open: true },
  decorators: [(story) => html`<div style=${stage}>${story()}</div>`],
};

export const Placements: Story = {
  render: () => html`
    <zd-flex gap="24" style=${stage}>
      ${['bottom-start', 'bottom-end', 'top-start', 'end-top'].map(
        (placement) => html`
          <zd-menu placement=${placement}>
            <zd-button slot="trigger">${placement}</zd-button>
            <zd-menu-item>Reschedule</zd-menu-item>
            <zd-menu-item>Cancel</zd-menu-item>
          </zd-menu>
        `
      )}
    </zd-flex>
  `,
};

export const FixedPlacement: Story = {
  render: () => html`
    <div style="overflow: hidden; height: 80px; padding: 16px;">
      <zd-menu fixed-placement open>
        <zd-button slot="trigger">Inside a clipping container</zd-button>
        <zd-menu-item>Reschedule</zd-menu-item>
        <zd-menu-item>Cancel</zd-menu-item>
      </zd-menu>
    </div>
  `,
};
