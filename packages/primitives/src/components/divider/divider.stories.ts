import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdDivider } from './divider.js';
import './divider.js';

const { args, argTypes, template } = getStorybookHelpers<ZdDivider>('zd-divider', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdDivider> = {
  title: 'Primitives/Divider',
  component: 'zd-divider',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdDivider>;

export const Default: Story = {};

export const WithContent: Story = {
  render: () => html`<zd-divider>or</zd-divider>`,
};

export const Vertical: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 0.5rem; height: 2rem;">
      <span>In person</span>
      <zd-divider orientation="vertical"></zd-divider>
      <span>Video visit</span>
    </div>
  `,
};
