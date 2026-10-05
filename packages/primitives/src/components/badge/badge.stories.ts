import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdBadge } from './badge.js';
import './badge.js';

const { args, argTypes, template } = getStorybookHelpers<ZdBadge>('zd-badge', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdBadge> = {
  title: 'Primitives/Badge',
  component: 'zd-badge',
  args,
  argTypes,
  render: (args) => template(args, html`Badge`),
};

export default meta;
type Story = StoryObj<ZdBadge>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <zd-flex wrap align="center" gap="8">
      <zd-badge variant="neutral">Neutral</zd-badge>
      <zd-badge variant="inverse">Inverse</zd-badge>
      <zd-badge variant="info">Info</zd-badge>
      <zd-badge variant="success">Success</zd-badge>
      <zd-badge variant="warning">Warning</zd-badge>
      <zd-badge variant="danger">Danger</zd-badge>
      <zd-badge variant="caution">Caution</zd-badge>
      <zd-badge variant="brand">Brand</zd-badge>
    </zd-flex>
  `,
};

export const InContext: Story = {
  render: () => html`
    <zd-flex align="center" gap="8">
      <span>Availability</span>
      <zd-badge>Available today</zd-badge>
    </zd-flex>
  `,
};

export const Specialty: Story = {
  render: () => html`
    <zd-flex wrap gap="8">
      <zd-badge>Dentist</zd-badge>
      <zd-badge>Accepts new patients</zd-badge>
      <zd-badge>Highly rated</zd-badge>
    </zd-flex>
  `,
};
