import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdIcon } from './icon.js';
import './icon.js';

const { args, argTypes, template } = getStorybookHelpers<ZdIcon>('zd-icon', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdIcon> = {
  title: 'Primitives/Icon',
  component: 'zd-icon',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdIcon>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <zd-flex align="center" gap="12">
      <zd-icon name="checkmark" size="small"></zd-icon>
      <zd-icon name="checkmark"></zd-icon>
      <zd-icon name="checkmark" size="large"></zd-icon>
    </zd-flex>
  `,
};

const zocdocIconNames = [
  'chevron-left',
  'info-circle',
  'insurance-accepted',
  'insurance-add',
  'location-pin',
  'search',
  'star',
  'stethoscope',
  'video-filled',
];

export const ZocdocIcons: Story = {
  render: () => html`
    <zd-grid gap="16" style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));">
      ${zocdocIconNames.map(
        (name) => html`
          <zd-flex direction="column" align="center" gap="8">
            <zd-icon name=${name}></zd-icon>
            <span style="font-size: 0.75rem; color: #666;">${name}</span>
          </zd-flex>
        `
      )}
    </zd-grid>
  `,
};
