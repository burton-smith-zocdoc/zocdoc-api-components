import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Theme/Borders',
  parameters: {
    docs: {
      description: {
        component: `
# Border Tokens

The Zocdoc theme provides tokens for border radius and border width.

## Border Radius

| Token | Value   |
|-------|---------|
| none  | 0       |
| sm    | 4px     |
| md    | 8px     |
| lg    | 12px    |
| xl    | 16px    |
| pill  | 160px   |
| full  | 9999px  |

## Border Width

| Token  | Value |
|--------|-------|
| none   | 0     |
| thin   | 1px   |
| medium | 2px   |
| thick  | 4px   |
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const BorderRadius: Story = {
  render: () => html`
    <div style="display: flex; gap: 24px; flex-wrap: wrap; padding: 16px;">
      <div style="text-align: center;">
        <div
          style="width: 80px; height: 80px; background: var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-none);"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">none</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 80px; height: 80px; background: var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-sm);"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">sm (4px)</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 80px; height: 80px; background: var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-md);"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">md (8px)</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 80px; height: 80px; background: var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-lg);"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">lg (12px)</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 80px; height: 80px; background: var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-xl);"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">xl (16px)</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 160px; height: 48px; background: var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-pill);"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">pill</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 80px; height: 80px; background: var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-full);"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">full (circle)</div>
      </div>
    </div>
  `,
};

export const BorderWidth: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; padding: 16px;">
      <div style="text-align: center;">
        <div
          style="width: 100px; height: 100px; background: var(--zd-color-neutral-50); border: var(--zd-borderWidth-none) solid var(--zd-color-brand-500); border-radius: 8px;"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">none (0)</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100px; height: 100px; background: var(--zd-color-neutral-50); border: var(--zd-borderWidth-thin) solid var(--zd-color-brand-500); border-radius: 8px;"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">thin (1px)</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100px; height: 100px; background: var(--zd-color-neutral-50); border: var(--zd-borderWidth-medium) solid var(--zd-color-brand-500); border-radius: 8px;"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">medium (2px)</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100px; height: 100px; background: var(--zd-color-neutral-50); border: var(--zd-borderWidth-thick) solid var(--zd-color-brand-500); border-radius: 8px;"
        ></div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">thick (4px)</div>
      </div>
    </div>
  `,
};

export const CombinedExample: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 16px;">
      <div
        style="padding: 24px; background: white; border: var(--zd-borderWidth-thin) solid var(--zd-color-neutral-200); border-radius: var(--zd-borderRadius-md);"
      >
        <div style="font-weight: 500;">Subtle Card</div>
        <div style="font-size: 14px; color: var(--zd-color-neutral-500);">thin border, md radius</div>
      </div>
      <div
        style="padding: 24px; background: white; border: var(--zd-borderWidth-medium) solid var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-lg);"
      >
        <div style="font-weight: 500;">Accent Card</div>
        <div style="font-size: 14px; color: var(--zd-color-neutral-500);">medium border, lg radius</div>
      </div>
      <div
        style="padding: 24px; background: var(--zd-color-brand-50); border: var(--zd-borderWidth-thick) solid var(--zd-color-brand-500); border-radius: var(--zd-borderRadius-xl);"
      >
        <div style="font-weight: 500;">Highlighted Card</div>
        <div style="font-size: 14px; color: var(--zd-color-neutral-500);">thick border, xl radius</div>
      </div>
    </div>
  `,
};
