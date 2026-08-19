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
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <zd-icon name="checkmark" size="small"></zd-icon>
      <zd-icon name="checkmark"></zd-icon>
      <zd-icon name="checkmark" size="large"></zd-icon>
    </div>
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
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem;">
      ${zocdocIconNames.map(
        (name) => html`
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <zd-icon name=${name}></zd-icon>
            <span style="font-size: 0.75rem; color: #666;">${name}</span>
          </div>
        `
      )}
    </div>
  `,
};
