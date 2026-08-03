import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdButtonGroup } from './button-group.js';
import './button-group.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdButtonGroup>('zd-button-group', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdButtonGroup> = {
  title: 'Primitives/ButtonGroup',
  component: 'zd-button-group',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`
    <zd-button>One</zd-button>
    <zd-button>Two</zd-button>
    <zd-button>Three</zd-button>
  `),
};

export default meta;
type Story = StoryObj<ZdButtonGroup>;

export const Default: Story = {};

export const Multiple: Story = {
  render: () => html`
    <zd-button-group>
      <zd-button>Left</zd-button>
      <zd-button>Center</zd-button>
      <zd-button>Right</zd-button>
    </zd-button-group>
  `,
};
