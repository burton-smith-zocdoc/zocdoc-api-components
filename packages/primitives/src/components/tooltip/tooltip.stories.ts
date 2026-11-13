import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdTooltip } from './tooltip.js';
import './tooltip.js';
import '../button/button.js';

const { args, argTypes, template } = getStorybookHelpers<ZdTooltip>('zd-tooltip', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdTooltip> = {
  title: 'Primitives/Tooltip',
  component: 'zd-tooltip',
  args,
  argTypes,
  render: (args) =>
    template(
      args,
      html`
        <zd-button>Insurance</zd-button>
        <span slot="content">We check your plan before you book.</span>
      `
    ),
};

export default meta;
type Story = StoryObj<ZdTooltip>;

export const Default: Story = {};

const stage = 'padding: 64px 48px;';

export const Open: Story = {
  args: { open: true },
  decorators: [(story) => html`<div style=${stage}>${story()}</div>`],
};

export const Placements: Story = {
  render: () => html`
    <zd-flex direction="column" gap="64" style=${stage}>
      ${['top', 'bottom', 'start', 'end'].map(
        (placement) => html`
          <zd-tooltip open placement=${placement}>
            <zd-button>${placement}</zd-button>
            <span slot="content">Placement ${placement}</span>
          </zd-tooltip>
        `
      )}
    </zd-flex>
  `,
};

export const WithArrow: Story = {
  render: () => html`
    <div style=${stage}>
      <zd-tooltip open arrow>
        <zd-button>Insurance</zd-button>
        <span slot="content">We check your plan before you book.</span>
      </zd-tooltip>
    </div>
  `,
};

export const DistanceAndSkidding: Story = {
  render: () => html`
    <zd-flex direction="column" gap="64" style=${stage}>
      <zd-tooltip open distance="20">
        <zd-button>Distance 20</zd-button>
        <span slot="content">Further from the anchor</span>
      </zd-tooltip>
      <zd-tooltip open skidding="30">
        <zd-button>Skidding 30</zd-button>
        <span slot="content">Slid along the anchor edge</span>
      </zd-tooltip>
    </zd-flex>
  `,
};

export const Triggers: Story = {
  render: () => html`
    <zd-flex gap="16" style=${stage}>
      <zd-tooltip trigger="hover">
        <zd-button>Hover only</zd-button>
        <span slot="content">Shown on hover</span>
      </zd-tooltip>
      <zd-tooltip trigger="focus">
        <zd-button>Focus only</zd-button>
        <span slot="content">Shown on focus</span>
      </zd-tooltip>
      <zd-tooltip trigger="click">
        <zd-button>Click</zd-button>
        <span slot="content">Shown on click</span>
      </zd-tooltip>
      <zd-tooltip trigger="manual">
        <zd-button>Manual</zd-button>
        <span slot="content">Only opens when you set open</span>
      </zd-tooltip>
    </zd-flex>
  `,
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const FixedPlacement: Story = {
  render: () => html`
    <div style="overflow: hidden; height: 96px; padding: 16px;">
      <zd-tooltip open fixed-placement placement="bottom">
        <zd-button>Inside a clipping container</zd-button>
        <span slot="content">Not clipped by the container</span>
      </zd-tooltip>
    </div>
  `,
};
