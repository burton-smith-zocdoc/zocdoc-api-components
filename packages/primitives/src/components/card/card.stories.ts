import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdCard } from './card.js';
import './card.js';
import '../avatar/avatar.js';

const { args, argTypes, template } = getStorybookHelpers<ZdCard>('zd-card', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdCard> = {
  title: 'Primitives/Card',
  component: 'zd-card',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <h3>Card Title</h3>
        <p>Card content goes here.</p>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdCard>;

export const Default: Story = {};

export const ProviderCard: Story = {
  render: () => html`
    <zd-card style="max-width: 400px;">
      <div style="display: flex; gap: 1rem;">
        <zd-avatar name="Dr. Jane Smith"></zd-avatar>
        <div>
          <h3 style="margin: 0;">Dr. Jane Smith</h3>
          <p style="margin: 0; color: var(--color-text-secondary);">Dentist</p>
          <p style="margin: 0.5rem 0 0;">123 Main St, New York, NY</p>
        </div>
      </div>
    </zd-card>
  `,
};
