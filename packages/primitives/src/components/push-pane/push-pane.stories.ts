import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdPushPane } from './push-pane.js';
import './push-pane.js';

const { args, argTypes, template } = getStorybookHelpers<ZdPushPane>('zd-push-pane', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdPushPane> = {
  title: 'Primitives/Push Pane',
  component: 'zd-push-pane',
  args,
  argTypes,
  render: (args) =>
    template(args, html`Filter results by insurance, visit reason, and availability.`),
};

export default meta;
type Story = StoryObj<ZdPushPane>;

export const Default: Story = {};
