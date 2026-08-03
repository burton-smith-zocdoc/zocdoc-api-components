import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdButtonGroupOverflow } from './button-group-overflow.js';
import './button-group-overflow.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdButtonGroupOverflow>('zd-button-group-overflow', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdButtonGroupOverflow> = {
  title: 'Primitives/Button Group Overflow',
  component: 'zd-button-group-overflow',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`
      <zd-button>Book</zd-button>
      <zd-button>Reschedule</zd-button>
      <zd-button>Cancel</zd-button>
      <zd-button>Message</zd-button>
    `),
};

export default meta;
type Story = StoryObj<ZdButtonGroupOverflow>;

export const Default: Story = {};
