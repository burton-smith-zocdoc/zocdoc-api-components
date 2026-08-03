import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdButton } from './button.js';
import './button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdButton>('zd-button', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdButton> = {
  title: 'Primitives/Button',
  component: 'zd-button',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`Button`),
};

export default meta;
type Story = StoryObj<ZdButton>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="primary">Primary</zd-button>
      <zd-button variant="secondary">Secondary</zd-button>
      <zd-button variant="inverse">Inverse</zd-button>
      <zd-button variant="ghost">Ghost</zd-button>
      <zd-button variant="destructive">Destructive</zd-button>
      <zd-button variant="link">Link</zd-button>
    </div>
  `,
};

export const VariantsDisabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="primary" disabled>Primary</zd-button>
      <zd-button variant="secondary" disabled>Secondary</zd-button>
      <zd-button variant="inverse" disabled>Inverse</zd-button>
      <zd-button variant="ghost" disabled>Ghost</zd-button>
      <zd-button variant="destructive" disabled>Destructive</zd-button>
      <zd-button variant="link" disabled>Link</zd-button>
    </div>
  `,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => template(args, html`Disabled`),
};

export const AsLink: Story = {
  args: { href: 'https://zocdoc.com' },
  render: (args) => template(args, html`Visit Zocdoc`),
};

export const Toggle: Story = {
  args: { toggle: true },
  render: (args) => template(args, html`Toggle me`),
};
