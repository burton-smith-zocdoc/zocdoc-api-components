import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdRadio } from './radio.js';
import './radio.js';
import '../radio-group/radio-group.js';

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

export const Readonly: Story = {
  args: { readonly: true, checked: true },
};

export const Sizes: Story = {
  render: () => html`
    <zd-radio-group label="Radio sizes" name="sizes" value="default">
      <zd-radio value="default">Default size</zd-radio>
      <zd-radio value="small" size="small">Small size</zd-radio>
    </zd-radio-group>
  `,
};

export const LabelPositions: Story = {
  render: () => html`
    <zd-radio-group label="Label positions" name="positions" value="end">
      <zd-radio value="end" label-position="end">Label at the end (default)</zd-radio>
      <zd-radio value="start" label-position="start">Label at the start</zd-radio>
      <zd-radio value="top" label-position="top">Label on top</zd-radio>
    </zd-radio-group>
  `,
};
