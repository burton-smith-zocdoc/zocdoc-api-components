import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdInput } from './input.js';
import './input.js';

const { args, argTypes, template } = getStorybookHelpers<ZdInput>('zd-input', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdInput> = {
  title: 'Primitives/Input',
  component: 'zd-input',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdInput>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const WithLabel: Story = {
  args: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Disabled input' },
};

export const Types: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-input label="Text" type="text" placeholder="Text input"></zd-input>
      <zd-input label="Email" type="email" placeholder="email@example.com"></zd-input>
      <zd-input label="Password" type="password" placeholder="Password"></zd-input>
      <zd-input label="Phone" type="tel" placeholder="(555) 555-5555"></zd-input>
      <zd-input label="Number" type="number" placeholder="0"></zd-input>
    </zd-flex>
  `,
};

export const Required: Story = {
  args: { label: 'Email', type: 'email', required: true },
};

export const HelpText: Story = {
  args: { label: 'Email', type: 'email', helpText: 'We only use this to send your confirmation.' },
};

export const Invalid: Story = {
  args: {
    label: 'Email',
    type: 'email',
    value: 'not-an-email',
    invalid: true,
    errorMessage: 'Enter an email address like name@example.com.',
  },
};

export const Readonly: Story = {
  args: { label: 'Email', type: 'email', readonly: true, value: 'name@example.com' },
};

export const Sizes: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-input label="Default size"></zd-input>
      <zd-input label="Small size" size="small"></zd-input>
    </zd-flex>
  `,
};

export const WithClear: Story = {
  args: { label: 'Search', withClear: true, value: 'Dermatology' },
};

export const PasswordToggle: Story = {
  args: { label: 'Password', type: 'password', passwordToggle: true, value: 'example-password' },
};

export const NumberRange: Story = {
  args: { label: 'Number of guests', type: 'number', min: 1, max: 4, step: 1, value: '2' },
};

export const MaxLength: Story = {
  args: { label: 'Nickname', maxlength: 20, helpText: 'Up to 20 characters.' },
};

export const HideLabel: Story = {
  args: { label: 'Search providers', hideLabel: true, placeholder: 'Search providers' },
};

export const LabelPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      <zd-input label="Label on top (default)" label-position="top"></zd-input>
      <zd-input label="Label at the start" label-position="start"></zd-input>
      <zd-input label="Label at the end" label-position="end"></zd-input>
    </zd-flex>
  `,
};
