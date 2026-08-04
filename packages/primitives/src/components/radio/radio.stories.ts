import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdRadio } from './radio.js';
import './radio.js';

const { args, argTypes, template } = getStorybookHelpers<ZdRadio>('zd-radio', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdRadio> = {
  title: 'Primitives/Radio',
  component: 'zd-radio',
  args,
  argTypes,
  render: (args) => template(args, html`Radio option`),
};

export default meta;
type Story = StoryObj<ZdRadio>;

export const Default: Story = {};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
