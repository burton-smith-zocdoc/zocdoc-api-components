import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdBadge } from './badge.js';
import './badge.js';

const { args, argTypes, template } = getStorybookHelpers<ZdBadge>('zd-badge', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdBadge> = {
  title: 'Primitives/Badge',
  component: 'zd-badge',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`Badge`),
};

export default meta;
type Story = StoryObj<ZdBadge>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-badge variant="neutral">Neutral</zd-badge>
      <zd-badge variant="inverse">Inverse</zd-badge>
      <zd-badge variant="info">Info</zd-badge>
      <zd-badge variant="success">Success</zd-badge>
      <zd-badge variant="warning">Warning</zd-badge>
      <zd-badge variant="danger">Danger</zd-badge>
      <zd-badge variant="caution">Caution</zd-badge>
      <zd-badge variant="brand">Brand</zd-badge>
    </div>
  `,
};

export const InContext: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <span>Availability</span>
      <zd-badge>Available today</zd-badge>
    </div>
  `,
};

export const Specialty: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <zd-badge>Dentist</zd-badge>
      <zd-badge>Accepts new patients</zd-badge>
      <zd-badge>Highly rated</zd-badge>
    </div>
  `,
};
