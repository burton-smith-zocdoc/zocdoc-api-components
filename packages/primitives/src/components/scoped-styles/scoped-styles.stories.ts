import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdScopedStyles } from './scoped-styles.js';
import './scoped-styles.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdScopedStyles>('zd-scoped-styles', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdScopedStyles> = {
  title: 'Primitives/Scoped Styles',
  component: 'zd-scoped-styles',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-button variant="primary">Book appointment</zd-button>
        <zd-button variant="secondary">See more times</zd-button>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdScopedStyles>;

export const Default: Story = {};

export const WithCss: Story = {
  render: () => html`
    <zd-scoped-styles
      .css=${`
        --zd-button-primary-bg-color: teal;
        --zd-button-primary-fg-color: white;
      `}
    >
      <zd-button variant="primary">Scoped button</zd-button>
    </zd-scoped-styles>
    <zd-button variant="primary">Unscoped button</zd-button>
  `,
};
