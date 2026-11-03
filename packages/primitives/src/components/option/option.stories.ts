import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdOption } from './option.js';
import './option.js';
import '../combobox/combobox.js';

const { args, argTypes, template } = getStorybookHelpers<ZdOption>('zd-option', {
  excludeCategories: ['cssParts'],
});

// An option only renders its row inside a combobox listbox, so each story wraps it in one.
const meta: Meta<ZdOption> = {
  title: 'Primitives/Option',
  component: 'zd-option',
  args: { ...args, value: 'in-person' },
  argTypes,
  render: (args) => html`
    <zd-combobox label="Visit type" mode="select-only">
      ${template(args, html`In person`)}
      <zd-option value="video">Video visit</zd-option>
      <zd-option value="phone">Phone call</zd-option>
    </zd-combobox>
  `,
};

export default meta;
type Story = StoryObj<ZdOption>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
