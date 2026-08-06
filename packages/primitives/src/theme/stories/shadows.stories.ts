import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Theme/Shadows',
  parameters: {
    docs: {
      description: {
        component: `
# Shadow Tokens

The Zocdoc theme provides a range of shadow tokens for creating depth and elevation in the UI.

## Scale

| Token   | Description                    |
|---------|--------------------------------|
| none    | No shadow                      |
| inner   | Inset shadow for pressed states|
| outline | Focus ring outline             |
| xs      | Subtle elevation               |
| sm      | Low elevation                  |
| md      | Medium elevation               |
| lg      | High elevation                 |
| xl      | Highest elevation              |

## Usage

\`\`\`css
.card {
  box-shadow: var(--zd-shadow-md);
}

.button:focus {
  box-shadow: var(--zd-shadow-outline);
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const ShadowScale: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; padding: 24px;">
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: white; border-radius: 8px; box-shadow: var(--zd-shadow-none); display: flex; align-items: center; justify-content: center;"
        >
          None
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">
          none
        </div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: white; border-radius: 8px; box-shadow: var(--zd-shadow-xs); display: flex; align-items: center; justify-content: center;"
        >
          XS
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">xs</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: white; border-radius: 8px; box-shadow: var(--zd-shadow-sm); display: flex; align-items: center; justify-content: center;"
        >
          SM
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">sm</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: white; border-radius: 8px; box-shadow: var(--zd-shadow-md); display: flex; align-items: center; justify-content: center;"
        >
          MD
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">md</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: white; border-radius: 8px; box-shadow: var(--zd-shadow-lg); display: flex; align-items: center; justify-content: center;"
        >
          LG
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">lg</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: white; border-radius: 8px; box-shadow: var(--zd-shadow-xl); display: flex; align-items: center; justify-content: center;"
        >
          XL
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">xl</div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: var(--zd-color-neutral-100); border-radius: 8px; box-shadow: var(--zd-shadow-inner); display: flex; align-items: center; justify-content: center;"
        >
          Inner
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">
          inner
        </div>
      </div>
      <div style="text-align: center;">
        <div
          style="width: 100%; height: 80px; background: white; border-radius: 8px; box-shadow: var(--zd-shadow-outline); display: flex; align-items: center; justify-content: center;"
        >
          Outline
        </div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-top: 8px;">
          outline (focus)
        </div>
      </div>
    </div>
  `,
};

export const ElevationLevels: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 48px; padding: 24px;">
      <div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 16px;">
          Cards at different elevations
        </div>
        <div style="display: flex; gap: 24px; align-items: flex-end;">
          <div
            style="padding: 24px; background: white; border-radius: 12px; box-shadow: var(--zd-shadow-xs);"
          >
            <div style="font-weight: 500;">Flat Card</div>
            <div style="font-size: 14px; color: var(--zd-color-neutral-500);">shadow-xs</div>
          </div>
          <div
            style="padding: 24px; background: white; border-radius: 12px; box-shadow: var(--zd-shadow-md);"
          >
            <div style="font-weight: 500;">Raised Card</div>
            <div style="font-size: 14px; color: var(--zd-color-neutral-500);">shadow-md</div>
          </div>
          <div
            style="padding: 24px; background: white; border-radius: 12px; box-shadow: var(--zd-shadow-xl);"
          >
            <div style="font-weight: 500;">Floating Card</div>
            <div style="font-size: 14px; color: var(--zd-color-neutral-500);">shadow-xl</div>
          </div>
        </div>
      </div>
    </div>
  `,
};
