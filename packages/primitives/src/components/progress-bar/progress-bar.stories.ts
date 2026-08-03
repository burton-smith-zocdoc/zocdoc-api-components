import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdProgressBar } from './progress-bar.js';
import './progress-bar.js';

const { args, argTypes, template } = getStorybookHelpers<ZdProgressBar>('zd-progress-bar', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdProgressBar> = {
  title: 'Primitives/Progress Bar',
  component: 'zd-progress-bar',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdProgressBar>;

export const Default: Story = {};

export const Determinate: Story = {
  args: { value: 40, max: 100, label: 'Step 2 of 5' },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Checking availability' },
};
