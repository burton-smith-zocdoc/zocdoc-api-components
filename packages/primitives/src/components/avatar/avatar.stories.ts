import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdAvatar } from './avatar.js';
import './avatar.js';

const { args, argTypes, template } = getStorybookHelpers<ZdAvatar>('zd-avatar', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdAvatar> = {
  title: 'Primitives/Avatar',
  component: 'zd-avatar',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdAvatar>;

/**
 * Charm's avatar takes `initials` for the rendered text and `label` for the alt
 * text - it does not derive one from the other, so both are set here.
 */
export const Default: Story = {
  args: { initials: 'JS', label: 'Jane Smith' },
};

export const WithImage: Story = {
  args: {
    initials: 'JS',
    label: 'Jane Smith',
    image: 'https://placehold.co/64x64',
  },
};

export const Initials: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem;">
      <zd-avatar initials="AB" label="Alice Brown"></zd-avatar>
      <zd-avatar initials="BC" label="Bob Carter"></zd-avatar>
      <zd-avatar initials="CD" label="Carol Davis"></zd-avatar>
    </div>
  `,
};
