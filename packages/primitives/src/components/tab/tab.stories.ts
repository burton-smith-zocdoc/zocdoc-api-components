import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdTab } from './tab.js';
import './tab.js';

const { args, argTypes, template } = getStorybookHelpers<ZdTab>('zd-tab', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdTab> = {
  title: 'Primitives/Tab',
  component: 'zd-tab',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`Availability`),
};

export default meta;
type Story = StoryObj<ZdTab>;

export const Default: Story = {};
