import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdBreadcrumbItem } from './breadcrumb-item.js';
import './breadcrumb-item.js';
import '../breadcrumb/breadcrumb.js';

const { args, argTypes, template } = getStorybookHelpers<ZdBreadcrumbItem>('zd-breadcrumb-item', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdBreadcrumbItem> = {
  title: 'Primitives/Breadcrumb Item',
  component: 'zd-breadcrumb-item',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`Dentists`),
};

export default meta;
type Story = StoryObj<ZdBreadcrumbItem>;

export const Default: Story = {};

export const Current: Story = {
  args: { current: 'page' },
  render: (args) => template(args, html`New York, NY`),
};
