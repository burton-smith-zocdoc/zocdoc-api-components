import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdSwitch } from './switch.js';
import './switch.js';

const { args, argTypes, template } = getStorybookHelpers<ZdSwitch>('zd-switch', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdSwitch> = {
  title: 'Primitives/Switch',
  component: 'zd-switch',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdSwitch>;

export const Default: Story = {
  args: { label: 'Text message reminders' },
};

export const Checked: Story = {
  args: { label: 'Text message reminders', checked: true },
};

export const WithMessages: Story = {
  render: () => html`
    <zd-switch label="Text message reminders">
      <span slot="checked-message">Reminders on</span>
      <span slot="unchecked-message">Reminders off</span>
    </zd-switch>
  `,
};
