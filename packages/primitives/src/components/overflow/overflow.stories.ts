import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdOverflow } from './overflow.js';
import './overflow.js';
import '../badge/badge.js';

const { args, argTypes, template } = getStorybookHelpers<ZdOverflow>('zd-overflow', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdOverflow> = {
  title: 'Primitives/Overflow',
  component: 'zd-overflow',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-badge>Dentist</zd-badge>
        <zd-badge>Accepts new patients</zd-badge>
        <zd-badge>Highly rated</zd-badge>
        <zd-badge>Video visits</zd-badge>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdOverflow>;

export const Default: Story = {};
