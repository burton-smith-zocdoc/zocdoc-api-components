import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdDisclosure } from './disclosure.js';
import './disclosure.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdDisclosure>('zd-disclosure', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdDisclosure> = {
  title: 'Primitives/Disclosure',
  component: 'zd-disclosure',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-button slot="trigger" variant="link">More about this provider</zd-button>
        <p>Board certified, accepting new patients.</p>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdDisclosure>;

export const Default: Story = {};
