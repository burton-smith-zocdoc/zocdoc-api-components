import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdSpinner } from './spinner.js';
import './spinner.js';
import '../card/card.js';

const { args, argTypes, template } = getStorybookHelpers<ZdSpinner>('zd-spinner', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdSpinner> = {
  title: 'Primitives/Spinner',
  component: 'zd-spinner',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdSpinner>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => html`
    <zd-card style="padding: 2rem; text-align: center;">
      <zd-spinner></zd-spinner>
      <p>Loading providers...</p>
    </zd-card>
  `,
};
