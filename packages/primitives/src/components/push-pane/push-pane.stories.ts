import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdPushPane } from './push-pane.js';
import './push-pane.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdPushPane>('zd-push-pane', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdPushPane> = {
  title: 'Primitives/Push Pane',
  component: 'zd-push-pane',
  args,
  argTypes,
  render: (args) =>
    template(args, html`Filter results by insurance, visit reason, and availability.`),
};

export default meta;
type Story = StoryObj<ZdPushPane>;

export const Default: Story = {};

export const Open: Story = {
  args: { open: true, heading: 'Filters' },
};

export const Positions: Story = {
  render: () => html`
    <zd-flex direction="column" gap="16">
      ${['start', 'end', 'bottom'].map(
        (position) => html`
          <div style="position: relative; min-height: 200px; border: 1px solid #ccc;">
            <zd-push-pane open position=${position} heading="Position ${position}">
              Filter results by insurance and availability.
            </zd-push-pane>
          </div>
        `
      )}
    </zd-flex>
  `,
};

export const NoHeader: Story = {
  args: { open: true, noHeader: true },
};

export const HideCloseButton: Story = {
  args: { open: true, heading: 'Filters', hideCloseButton: true },
};

export const WithFooterAndActions: Story = {
  render: () => html`
    <zd-push-pane open heading="Filters">
      <zd-button slot="actions" variant="ghost" size="small">Reset</zd-button>
      Filter results by insurance and availability.
      <zd-button slot="footer">Apply filters</zd-button>
    </zd-push-pane>
  `,
};
