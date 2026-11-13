import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdButtonGroupOverflow } from './button-group-overflow.js';
import './button-group-overflow.js';
import '../button/button.js';
import '../button-group/button-group.js';

const { args, argTypes, template } = getStorybookHelpers<ZdButtonGroupOverflow>(
  'zd-button-group-overflow',
  { excludeCategories: ['cssParts'] }
);

const meta: Meta<ZdButtonGroupOverflow> = {
  title: 'Primitives/Button Group Overflow',
  component: 'zd-button-group-overflow',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-button>Book</zd-button>
        <zd-button>Reschedule</zd-button>
        <zd-button>Cancel</zd-button>
        <zd-button>Message</zd-button>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdButtonGroupOverflow>;

export const Default: Story = {};

const buttons = html`
  <zd-button>Book</zd-button>
  <zd-button>Reschedule</zd-button>
  <zd-button>Cancel</zd-button>
  <zd-button>Message</zd-button>
`;

export const Constrained: Story = {
  render: () => html`
    <div style="max-width: 280px;">
      <zd-button-group-overflow>${buttons}</zd-button-group-overflow>
    </div>
  `,
};

export const MinimumVisible: Story = {
  render: () => html`
    <div style="max-width: 140px;">
      <zd-button-group-overflow min="2">${buttons}</zd-button-group-overflow>
    </div>
  `,
};

export const MenuPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      ${['end', 'start', 'none'].map(
        (menuPosition) => html`
          <div style="max-width: 280px;">
            <zd-button-group-overflow menu-position=${menuPosition}>
              ${buttons}
            </zd-button-group-overflow>
          </div>
        `
      )}
    </zd-flex>
  `,
};

export const OverflowDirection: Story = {
  render: () => html`
    <div style="max-width: 280px;">
      <zd-button-group-overflow overflow-direction="start"> ${buttons} </zd-button-group-overflow>
    </div>
  `,
};

export const NestedGroups: Story = {
  render: () => html`
    <div style="max-width: 320px;">
      <zd-button-group-overflow>
        <zd-button-group>
          <zd-button>Book</zd-button>
          <zd-button>Reschedule</zd-button>
        </zd-button-group>
        <zd-button-group>
          <zd-button>Message</zd-button>
          <zd-button>Directions</zd-button>
        </zd-button-group>
      </zd-button-group-overflow>
    </div>
  `,
};
