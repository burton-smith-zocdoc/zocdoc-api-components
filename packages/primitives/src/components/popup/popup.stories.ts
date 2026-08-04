import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdPopup } from './popup.js';
import './popup.js';
import '../button/button.js';
import '../card/card.js';

const { args, argTypes, template } = getStorybookHelpers<ZdPopup>('zd-popup', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdPopup> = {
  title: 'Primitives/Popup',
  component: 'zd-popup',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-button slot="anchor">Anchor</zd-button>
        <zd-card>Positioned content</zd-card>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdPopup>;

export const Default: Story = {};
