import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdTabPanel } from './tab-panel.js';
import './tab-panel.js';

const { args, argTypes, template } = getStorybookHelpers<ZdTabPanel>('zd-tab-panel', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdTabPanel> = {
  title: 'Primitives/Tab Panel',
  component: 'zd-tab-panel',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`Next available: Tuesday at 9:00 AM`),
};

export default meta;
type Story = StoryObj<ZdTabPanel>;

export const Default: Story = {};
