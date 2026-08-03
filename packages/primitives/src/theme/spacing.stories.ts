import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';

const spacingScale = ['none', '3xs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const spacingValues = ['0', '1px', '2px', '4px', '8px', '12px', '16px', '24px', '32px', '48px'] as const;

const meta: Meta = {
  title: 'Theme/Spacing',
  parameters: {
    docs: {
      description: {
        component: `
# Spacing Tokens

The Zocdoc theme provides a consistent spacing scale for margins, padding, and gaps.

## Scale

| Token | Value |
|-------|-------|
| none  | 0     |
| 3xs   | 1px   |
| xxs   | 2px   |
| xs    | 4px   |
| sm    | 8px   |
| md    | 12px  |
| lg    | 16px  |
| xl    | 24px  |
| 2xl   | 32px  |
| 3xl   | 48px  |

## Usage

\`\`\`css
.my-element {
  padding: var(--zd-spacing-md);
  margin-bottom: var(--zd-spacing-lg);
  gap: var(--zd-spacing-sm);
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const SpacingScale: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${spacingScale.map(
        (size, index) => html`
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 60px; font-size: 14px; font-weight: 500;">${size}</div>
            <div style="width: 60px; font-size: 12px; color: var(--zd-color-neutral-500);">${spacingValues[index]}</div>
            <div
              style="width: var(--zd-spacing-${size}); height: 24px; background-color: var(--zd-color-brand-500); border-radius: 4px;"
            ></div>
          </div>
        `
      )}
    </div>
  `,
};

export const PaddingExample: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">Padding SM (8px)</div>
        <div style="padding: var(--zd-spacing-sm); background: var(--zd-color-neutral-100); border: 1px dashed var(--zd-color-neutral-300);">
          <div style="background: var(--zd-color-brand-100); padding: 8px;">Content</div>
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">Padding MD (12px)</div>
        <div style="padding: var(--zd-spacing-md); background: var(--zd-color-neutral-100); border: 1px dashed var(--zd-color-neutral-300);">
          <div style="background: var(--zd-color-brand-100); padding: 8px;">Content</div>
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">Padding LG (16px)</div>
        <div style="padding: var(--zd-spacing-lg); background: var(--zd-color-neutral-100); border: 1px dashed var(--zd-color-neutral-300);">
          <div style="background: var(--zd-color-brand-100); padding: 8px;">Content</div>
        </div>
      </div>
    </div>
  `,
};

export const GapExample: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">Gap XS (4px)</div>
        <div style="display: flex; gap: var(--zd-spacing-xs);">
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">Gap SM (8px)</div>
        <div style="display: flex; gap: var(--zd-spacing-sm);">
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">Gap MD (12px)</div>
        <div style="display: flex; gap: var(--zd-spacing-md);">
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">Gap LG (16px)</div>
        <div style="display: flex; gap: var(--zd-spacing-lg);">
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
          <div style="width: 48px; height: 48px; background: var(--zd-color-brand-500); border-radius: 8px;"></div>
        </div>
      </div>
    </div>
  `,
};
