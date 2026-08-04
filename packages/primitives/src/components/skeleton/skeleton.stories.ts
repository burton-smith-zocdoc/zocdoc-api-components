import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdSkeleton } from './skeleton.js';
import './skeleton.js';
import '../card/card.js';

const { args, argTypes, template } = getStorybookHelpers<ZdSkeleton>('zd-skeleton', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdSkeleton> = {
  title: 'Primitives/Skeleton',
  component: 'zd-skeleton',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdSkeleton>;

export const Default: Story = {};

export const Text: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <zd-skeleton style="width: 100%; height: 1rem;"></zd-skeleton>
      <zd-skeleton style="width: 80%; height: 1rem;"></zd-skeleton>
      <zd-skeleton style="width: 60%; height: 1rem;"></zd-skeleton>
    </div>
  `,
};

export const Circle: Story = {
  args: { shape: 'circle' },
  render: (args) => html`
    <zd-skeleton shape=${args.shape} style="width: 48px; height: 48px;"></zd-skeleton>
  `,
};

export const ProviderCard: Story = {
  render: () => html`
    <zd-card style="max-width: 400px;">
      <div style="display: flex; gap: 1rem;">
        <zd-skeleton shape="circle" style="width: 64px; height: 64px;"></zd-skeleton>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
          <zd-skeleton style="width: 60%; height: 1.25rem;"></zd-skeleton>
          <zd-skeleton style="width: 40%; height: 1rem;"></zd-skeleton>
          <zd-skeleton style="width: 80%; height: 1rem;"></zd-skeleton>
        </div>
      </div>
    </zd-card>
  `,
};
