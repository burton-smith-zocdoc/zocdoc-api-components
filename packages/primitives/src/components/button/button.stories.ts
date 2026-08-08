import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdButton } from './button.js';
import './button.js';
import '../icon/icon.js';

const { args, argTypes, template } = getStorybookHelpers<ZdButton>('zd-button', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdButton> = {
  title: 'Primitives/Button',
  component: 'zd-button',
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

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="primary">Default</zd-button>
      <zd-button variant="primary" size="small">Small</zd-button>
    </div>
  `,
};

export const Fluid: Story = {
  render: () => html`<zd-button variant="primary" fluid>Full Width Button</zd-button>`,
};

export const WithStartIcon: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="primary">
        <zd-icon slot="start" name="person"></zd-icon>
        View Profile
      </zd-button>
      <zd-button variant="secondary">
        <zd-icon slot="start" name="checkmark"></zd-icon>
        Confirm
      </zd-button>
    </div>
  `,
};

export const WithEndIcon: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="primary">
        Next
        <zd-icon slot="end" name="chevron-right"></zd-icon>
      </zd-button>
      <zd-button variant="secondary">
        More
        <zd-icon slot="end" name="chevron-down"></zd-icon>
      </zd-button>
    </div>
  `,
};

export const WithBothIcons: Story = {
  render: () => html`
    <zd-button variant="primary">
      <zd-icon slot="start" name="person"></zd-icon>
      Account
      <zd-icon slot="end" name="chevron-down"></zd-icon>
    </zd-button>
  `,
};

export const IconOnly: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="primary" icon-only aria-label="Close">
        <zd-icon slot="start" name="dismiss"></zd-icon>
      </zd-button>
      <zd-button variant="secondary" icon-only aria-label="More options">
        <zd-icon slot="start" name="more"></zd-icon>
      </zd-button>
      <zd-button variant="ghost" icon-only aria-label="Expand">
        <zd-icon slot="start" name="chevron-down"></zd-icon>
      </zd-button>
      <zd-button variant="primary" icon-only size="small" aria-label="Close">
        <zd-icon slot="start" name="dismiss"></zd-icon>
      </zd-button>
    </div>
  `,
};

export const AsLink: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="primary" href="https://zocdoc.com">Visit Zocdoc</zd-button>
      <zd-button variant="secondary" href="https://zocdoc.com" target="_blank">
        Open in New Tab
        <zd-icon slot="end" name="chevron-right"></zd-icon>
      </zd-button>
    </div>
  `,
};

export const Toggle: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
      <zd-button variant="secondary" toggle>Toggle me</zd-button>
      <zd-button variant="secondary" toggle pressed>Already pressed</zd-button>
    </div>
  `,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => template(args, html`Disabled`),
};
