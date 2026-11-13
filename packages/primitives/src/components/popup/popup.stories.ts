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

const stage = 'padding: 96px 48px; --zd-popup-z-index: 1;';

export const Open: Story = {
  args: { open: true, placement: 'bottom' },
  decorators: [(story) => html`<div style=${stage}>${story()}</div>`],
};

export const Placements: Story = {
  render: () => html`
    <zd-flex direction="column" gap="96" style=${stage}>
      ${['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'].map(
        (placement) => html`
          <zd-popup open placement=${placement}>
            <zd-button slot="anchor">${placement}</zd-button>
            <zd-card>Placement ${placement}</zd-card>
          </zd-popup>
        `
      )}
    </zd-flex>
  `,
};

export const LogicalPlacements: Story = {
  render: () => html`
    <zd-flex direction="column" gap="96" style=${stage}>
      ${['start', 'start-top', 'start-bottom', 'end', 'end-top', 'end-bottom'].map(
        (placement) => html`
          <zd-popup open placement=${placement}>
            <zd-button slot="anchor">${placement}</zd-button>
            <zd-card>Placement ${placement}</zd-card>
          </zd-popup>
        `
      )}
    </zd-flex>
  `,
};

export const DistanceAndSkidding: Story = {
  render: () => html`
    <zd-flex direction="column" gap="96" style=${stage}>
      <zd-popup open placement="bottom" distance="24">
        <zd-button slot="anchor">Distance 24</zd-button>
        <zd-card>Moved away from the anchor</zd-card>
      </zd-popup>
      <zd-popup open placement="bottom" skidding="40">
        <zd-button slot="anchor">Skidding 40</zd-button>
        <zd-card>Slid along the anchor edge</zd-card>
      </zd-popup>
    </zd-flex>
  `,
};

export const WithArrow: Story = {
  render: () => html`
    <zd-flex direction="column" gap="96" style=${stage}>
      ${['start', 'center', 'end', 'anchor'].map(
        (arrowPlacement) => html`
          <zd-popup open placement="bottom" arrow arrow-placement=${arrowPlacement}>
            <zd-button slot="anchor">Arrow ${arrowPlacement}</zd-button>
            <zd-card>Arrow placed at ${arrowPlacement}</zd-card>
          </zd-popup>
        `
      )}
    </zd-flex>
  `,
};

export const FlipAndShift: Story = {
  render: () => html`
    <div style="padding: 24px 0; --zd-popup-z-index: 1;">
      <zd-popup open placement="top" flip flip-fallback-placements="bottom end" shift>
        <zd-button slot="anchor">Near the top edge</zd-button>
        <zd-card>Flips to the bottom when there is no room above</zd-card>
      </zd-popup>
    </div>
  `,
};

export const FlipFallbackStrategy: Story = {
  render: () => html`
    <div style="padding: 24px 0; --zd-popup-z-index: 1;">
      <zd-popup open placement="top" flip flip-fallback-strategy="initial">
        <zd-button slot="anchor">Initial strategy</zd-button>
        <zd-card>Falls back to the initial placement when nothing fits</zd-card>
      </zd-popup>
    </div>
  `,
};

export const AutoSize: Story = {
  render: () => html`
    <div style=${stage}>
      <zd-popup open placement="bottom" auto-size="vertical" auto-size-padding="16">
        <zd-button slot="anchor">Anchor</zd-button>
        <zd-card style="max-height: var(--popup-auto-size-available-height); overflow: auto;">
          ${Array.from({ length: 12 }, (_, i) => html`<p>Available time ${i + 1}</p>`)}
        </zd-card>
      </zd-popup>
    </div>
  `,
};

export const SyncWidth: Story = {
  render: () => html`
    <div style=${stage}>
      <zd-popup open placement="bottom" sync="width">
        <zd-button slot="anchor" style="min-width: 320px;">Wide anchor</zd-button>
        <zd-card>Matches the anchor's width</zd-card>
      </zd-popup>
    </div>
  `,
};

export const FixedStrategy: Story = {
  render: () => html`
    <div style="overflow: hidden; height: 120px; padding: 24px; --zd-popup-z-index: 1;">
      <zd-popup open placement="bottom" strategy="fixed">
        <zd-button slot="anchor">Inside a clipping container</zd-button>
        <zd-card>Not clipped by the container</zd-card>
      </zd-popup>
    </div>
  `,
};

export const FocusTrap: Story = {
  render: () => html`
    <div style=${stage}>
      <zd-popup open placement="bottom" focus-trap label="Visit options">
        <zd-button slot="anchor">Anchor</zd-button>
        <zd-card>
          <zd-button>First action</zd-button>
          <zd-button>Second action</zd-button>
        </zd-card>
      </zd-popup>
    </div>
  `,
};
