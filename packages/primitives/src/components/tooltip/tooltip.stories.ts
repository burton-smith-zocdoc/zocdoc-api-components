import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdTooltip } from './tooltip.js';
import './tooltip.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdTooltip>('zd-tooltip', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdTooltip> = {
  title: 'Primitives/Tooltip',
  component: 'zd-tooltip',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-button>Insurance</zd-button>
        <span slot="content">We check your plan before you book.</span>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdTooltip>;

export const Default: Story = {};
