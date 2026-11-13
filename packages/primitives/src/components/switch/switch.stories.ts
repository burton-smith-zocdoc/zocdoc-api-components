import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdSwitch } from './switch.js';
import './switch.js';

const { args, argTypes, template } = getStorybookHelpers<ZdSwitch>('zd-switch', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdSwitch> = {
  title: 'Primitives/Switch',
  component: 'zd-switch',
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

export const Disabled: Story = {
  args: { label: 'Text message reminders', disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: 'Text message reminders', disabled: true, checked: true },
};

export const Readonly: Story = {
  args: { label: 'Text message reminders', readonly: true, checked: true },
};

export const HelpText: Story = {
  args: { label: 'Text message reminders', helpText: 'Standard message rates may apply.' },
};

export const Invalid: Story = {
  args: {
    label: 'Accept the cancellation policy',
    required: true,
    invalid: true,
    errorMessage: 'Turn this on to continue.',
  },
};

export const LabelPositions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="12">
      <zd-switch label="Label at the end (default)" label-position="end"></zd-switch>
      <zd-switch label="Label at the start" label-position="start"></zd-switch>
      <zd-switch label="Label on top" label-position="top"></zd-switch>
    </zd-flex>
  `,
};
