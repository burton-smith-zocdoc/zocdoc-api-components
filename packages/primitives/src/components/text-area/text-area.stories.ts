import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdTextArea } from './text-area.js';
import './text-area.js';

const { args, argTypes, template } = getStorybookHelpers<ZdTextArea>('zd-text-area', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdTextArea> = {
  title: 'Primitives/Text Area',
  component: 'zd-text-area',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdTextArea>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Reason for visit', placeholder: 'Tell the provider what to expect' },
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <zd-text-area label="Default size"></zd-text-area>
      <zd-text-area label="Small size" size="small"></zd-text-area>
    </div>
  `,
};
