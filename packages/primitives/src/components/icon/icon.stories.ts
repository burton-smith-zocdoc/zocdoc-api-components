import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdIcon } from './icon.js';
import './icon.js';

const { args, argTypes, template } = getStorybookHelpers<ZdIcon>('zd-icon', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdIcon> = {
  title: 'Primitives/Icon',
  component: 'zd-icon',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdIcon>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <zd-icon name="checkmark" size="small"></zd-icon>
      <zd-icon name="checkmark"></zd-icon>
      <zd-icon name="checkmark" size="large"></zd-icon>
    </div>
  `,
};
