import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdRadioGroup } from './radio-group.js';
import './radio-group.js';
import '../radio/radio.js';

const { args, argTypes, template } = getStorybookHelpers<ZdRadioGroup>('zd-radio-group', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdRadioGroup> = {
  title: 'Primitives/RadioGroup',
  component: 'zd-radio-group',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`
    <zd-radio value="1">Option 1</zd-radio>
    <zd-radio value="2">Option 2</zd-radio>
    <zd-radio value="3">Option 3</zd-radio>
  `),
};

export default meta;
type Story = StoryObj<ZdRadioGroup>;

export const Default: Story = {
  args: { label: 'Select an option', name: 'options' },
};

export const Horizontal: Story = {
  args: { label: 'Appointment type', name: 'type' },
  render: (args) => template(args, html`
    <zd-radio value="in-person">In-person</zd-radio>
    <zd-radio value="video">Video visit</zd-radio>
  `),
};

export const WithDefaultValue: Story = {
  args: { label: 'Insurance', name: 'insurance', value: 'yes' },
  render: (args) => template(args, html`
    <zd-radio value="yes">I have insurance</zd-radio>
    <zd-radio value="no">I'll pay out of pocket</zd-radio>
  `),
};
