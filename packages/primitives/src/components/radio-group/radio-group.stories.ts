import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdRadioGroup } from './radio-group.js';
import './radio-group.js';
import '../radio/radio.js';

const { args, argTypes, template } = getStorybookHelpers<ZdRadioGroup>('zd-radio-group', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdRadioGroup> = {
  title: 'Primitives/RadioGroup',
  component: 'zd-radio-group',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="1">Option 1</zd-radio>
        <zd-radio value="2">Option 2</zd-radio>
        <zd-radio value="3">Option 3</zd-radio>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdRadioGroup>;

export const Default: Story = {
  args: { label: 'Select an option', name: 'options' },
};

export const Horizontal: Story = {
  args: { label: 'Appointment type', name: 'type', layout: 'horizontal' },
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="in-person">In-person</zd-radio>
        <zd-radio value="video">Video visit</zd-radio>
      `
    ),
};

export const WithDefaultValue: Story = {
  args: { label: 'Insurance', name: 'insurance', value: 'yes' },
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="yes">I have insurance</zd-radio>
        <zd-radio value="no">I'll pay out of pocket</zd-radio>
      `
    ),
};

export const HorizontalStacked: Story = {
  args: { label: 'Appointment type', name: 'type-stacked', layout: 'horizontal-stacked' },
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="in-person">In-person</zd-radio>
        <zd-radio value="video">Video visit</zd-radio>
      `
    ),
};

export const HelpText: Story = {
  args: {
    label: 'Appointment type',
    name: 'type-help',
    helpText: 'Video visits are available for most providers.',
  },
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="in-person">In-person</zd-radio>
        <zd-radio value="video">Video visit</zd-radio>
      `
    ),
};

export const Disabled: Story = {
  args: { label: 'Insurance', name: 'insurance-disabled', disabled: true, value: 'yes' },
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="yes">I have insurance</zd-radio>
        <zd-radio value="no">I'll pay out of pocket</zd-radio>
      `
    ),
};

export const Readonly: Story = {
  args: { label: 'Insurance', name: 'insurance-readonly', readonly: true, value: 'yes' },
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="yes">I have insurance</zd-radio>
        <zd-radio value="no">I'll pay out of pocket</zd-radio>
      `
    ),
};

export const RequiredInvalid: Story = {
  args: {
    label: 'Appointment type',
    name: 'type-invalid',
    required: true,
    invalid: true,
    errorMessage: 'Choose an appointment type to continue.',
  },
  render: (args) =>
    template(
      args,
      html`
        <zd-radio value="in-person">In-person</zd-radio>
        <zd-radio value="video">Video visit</zd-radio>
      `
    ),
};

export const LabelPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="24">
      <zd-radio-group label="Label at the end (default)" name="lp-end" label-position="end">
        <zd-radio value="a">Option A</zd-radio>
        <zd-radio value="b">Option B</zd-radio>
      </zd-radio-group>
      <zd-radio-group label="Label at the start" name="lp-start" label-position="start">
        <zd-radio value="a">Option A</zd-radio>
        <zd-radio value="b">Option B</zd-radio>
      </zd-radio-group>
      <zd-radio-group label="Label on top" name="lp-top" label-position="top">
        <zd-radio value="a">Option A</zd-radio>
        <zd-radio value="b">Option B</zd-radio>
      </zd-radio-group>
    </zd-flex>
  `,
};
