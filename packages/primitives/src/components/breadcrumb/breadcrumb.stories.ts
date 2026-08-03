import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdBreadcrumb } from './breadcrumb.js';
import './breadcrumb.js';
import '../breadcrumb-item/breadcrumb-item.js';

const { args, argTypes, template } = getStorybookHelpers<ZdBreadcrumb>('zd-breadcrumb', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdBreadcrumb> = {
  title: 'Primitives/Breadcrumb',
  component: 'zd-breadcrumb',
  tags: ['autodocs'],
  args,
  argTypes,
  // The trailing item needs no `current` or `separator` attribute - the
  // breadcrumb sets both on slot change, and overwrites whatever was authored.
  // It also needs no `href`, which is why it renders as a button rather than a
  // link.
  render: (args) => template(args, html`
      <zd-breadcrumb-item href="#">Specialties</zd-breadcrumb-item>
      <zd-breadcrumb-item href="#">Dentists</zd-breadcrumb-item>
      <zd-breadcrumb-item>New York, NY</zd-breadcrumb-item>
    `),
};

export default meta;
type Story = StoryObj<ZdBreadcrumb>;

export const Default: Story = {};
