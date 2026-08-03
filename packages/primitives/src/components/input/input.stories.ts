import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdInput } from './input.js';
import './input.js';

const { args, argTypes, template } = getStorybookHelpers<ZdInput>('zd-input', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdInput> = {
  title: 'Primitives/Input',
  component: 'zd-input',
  tags: ['autodocs'],
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
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <zd-input label="Text" type="text" placeholder="Text input"></zd-input>
      <zd-input label="Email" type="email" placeholder="email@example.com"></zd-input>
      <zd-input label="Password" type="password" placeholder="Password"></zd-input>
      <zd-input label="Phone" type="tel" placeholder="(555) 555-5555"></zd-input>
      <zd-input label="Number" type="number" placeholder="0"></zd-input>
    </div>
  `,
};
