import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdOverflow } from './overflow.js';
import './overflow.js';
import '../badge/badge.js';

const { args, argTypes, template } = getStorybookHelpers<ZdOverflow>('zd-overflow', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdOverflow> = {
  title: 'Primitives/Overflow',
  component: 'zd-overflow',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-badge>Dentist</zd-badge>
        <zd-badge>Accepts new patients</zd-badge>
        <zd-badge>Highly rated</zd-badge>
        <zd-badge>Video visits</zd-badge>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdOverflow>;

export const Default: Story = {};

const items = html`
  <zd-badge>Dentist</zd-badge>
  <zd-badge>Accepts new patients</zd-badge>
  <zd-badge>Highly rated</zd-badge>
  <zd-badge>Video visits</zd-badge>
`;

export const Constrained: Story = {
  render: () => html`
    <div style="max-width: 240px;">
      <zd-overflow>${items}</zd-overflow>
    </div>
  `,
};

export const MinimumVisible: Story = {
  render: () => html`
    <div style="max-width: 120px;">
      <zd-overflow min="2">${items}</zd-overflow>
    </div>
  `,
};

export const MenuPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      ${['end', 'start', 'none'].map(
        (menuPosition) => html`
          <div style="max-width: 240px;">
            <zd-overflow menu-position=${menuPosition}>${items}</zd-overflow>
          </div>
        `
      )}
    </zd-flex>
  `,
};

export const OverflowDirection: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      ${['end', 'start'].map(
        (direction) => html`
          <div style="max-width: 240px;">
            <zd-overflow overflow-direction=${direction}>${items}</zd-overflow>
          </div>
        `
      )}
    </zd-flex>
  `,
};

export const StaticContent: Story = {
  render: () => html`
    <div style="max-width: 320px;">
      <zd-overflow>
        <zd-badge slot="start">Filters</zd-badge>
        ${items}
        <zd-badge slot="end">Clear</zd-badge>
      </zd-overflow>
    </div>
  `,
};

export const FixedPlacement: Story = {
  render: () => html`
    <div style="max-width: 240px; overflow: hidden; height: 64px;">
      <zd-overflow fixed-placement>${items}</zd-overflow>
    </div>
  `,
};
