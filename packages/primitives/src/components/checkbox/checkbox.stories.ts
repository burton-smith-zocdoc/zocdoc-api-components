import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdCheckbox } from './checkbox.js';
import './checkbox.js';

const { args, argTypes, template } = getStorybookHelpers<ZdCheckbox>('zd-checkbox', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdCheckbox> = {
  title: 'Primitives/Checkbox',
  component: 'zd-checkbox',
  args,
  argTypes,
  render: (args) => template(args, html`Send me appointment reminders`),
};

export default meta;
type Story = StoryObj<ZdCheckbox>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <zd-checkbox>Default size</zd-checkbox>
      <zd-checkbox size="small">Small size</zd-checkbox>
    </div>
  `,
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => template(args, html`Some visit reasons selected`),
};
