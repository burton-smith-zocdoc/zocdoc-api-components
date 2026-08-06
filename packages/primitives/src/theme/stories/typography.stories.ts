import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Theme/Typography',
  parameters: {
    docs: {
      description: {
        component: `
# Typography Tokens

The Zocdoc theme provides a comprehensive typography system including font families, sizes, weights, line heights, and letter spacing.

## Font Families

- **Base** — Primary font for body text (Inter)
- **Accent** — Font for headings and emphasis (Inter)
- **Mono** — Monospace font for code

## Font Sizes

Sizes range from \`xxs\` (0.75rem) to \`2xl\` (3rem).

## Font Weights

- **normal** (400) — Body text
- **medium** (500) — Subtle emphasis
- **semibold** (600) — Headings, buttons
- **bold** (700) — Strong emphasis
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const FontSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="font-size: var(--zd-typography-fontSize-xxs);">
        Font Size XXS (0.75rem) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-size: var(--zd-typography-fontSize-xs);">
        Font Size XS (0.875rem) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-size: var(--zd-typography-fontSize-sm);">
        Font Size SM (1rem) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-size: var(--zd-typography-fontSize-md);">
        Font Size MD (1.25rem) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-size: var(--zd-typography-fontSize-lg);">
        Font Size LG (1.5rem) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-size: var(--zd-typography-fontSize-xl);">
        Font Size XL (2rem) — The quick brown fox
      </div>
      <div style="font-size: var(--zd-typography-fontSize-2xl);">Font Size 2XL (3rem)</div>
    </div>
  `,
};

export const FontWeights: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 12px; font-size: var(--zd-typography-fontSize-md);"
    >
      <div style="font-weight: var(--zd-typography-fontWeight-normal);">
        Normal (400) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-weight: var(--zd-typography-fontWeight-medium);">
        Medium (500) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-weight: var(--zd-typography-fontWeight-semibold);">
        Semibold (600) — The quick brown fox jumps over the lazy dog
      </div>
      <div style="font-weight: var(--zd-typography-fontWeight-bold);">
        Bold (700) — The quick brown fox jumps over the lazy dog
      </div>
    </div>
  `,
};

export const FontFamilies: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 4px;">
          Base
        </div>
        <div
          style="font-family: var(--zd-typography-fontFamily-base); font-size: var(--zd-typography-fontSize-md);"
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 4px;">
          Accent
        </div>
        <div
          style="font-family: var(--zd-typography-fontFamily-accent); font-size: var(--zd-typography-fontSize-md); font-weight: var(--zd-typography-fontWeight-semibold);"
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 4px;">
          Mono
        </div>
        <div
          style="font-family: var(--zd-typography-fontFamily-mono); font-size: var(--zd-typography-fontSize-md);"
        >
          const greeting = "Hello, World!"; // 0123456789
        </div>
      </div>
    </div>
  `,
};

export const LineHeights: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">
          Line Height XS (1)
        </div>
        <div
          style="line-height: var(--zd-typography-lineHeight-xs); background: var(--zd-color-neutral-100); padding: 8px;"
        >
          Tight line height for headings and single-line text elements.
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">
          Line Height SM (1.25)
        </div>
        <div
          style="line-height: var(--zd-typography-lineHeight-sm); background: var(--zd-color-neutral-100); padding: 8px;"
        >
          Slightly tighter line height useful for headings and compact UI elements.
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">
          Line Height MD (1.5)
        </div>
        <div
          style="line-height: var(--zd-typography-lineHeight-md); background: var(--zd-color-neutral-100); padding: 8px;"
        >
          Default line height for body text. Provides comfortable reading experience for paragraphs.
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 8px;">
          Line Height LG (2)
        </div>
        <div
          style="line-height: var(--zd-typography-lineHeight-lg); background: var(--zd-color-neutral-100); padding: 8px;"
        >
          Loose line height for increased readability in specific contexts.
        </div>
      </div>
    </div>
  `,
};

export const LetterSpacing: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 16px; font-size: var(--zd-typography-fontSize-lg);"
    >
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 4px;">
          Tight (-0.025em)
        </div>
        <div style="letter-spacing: var(--zd-typography-letterSpacing-tight);">
          The quick brown fox jumps over the lazy dog
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 4px;">
          Normal (0)
        </div>
        <div style="letter-spacing: var(--zd-typography-letterSpacing-normal);">
          The quick brown fox jumps over the lazy dog
        </div>
      </div>
      <div>
        <div style="font-size: 12px; color: var(--zd-color-neutral-500); margin-bottom: 4px;">
          Wide (0.025em)
        </div>
        <div style="letter-spacing: var(--zd-typography-letterSpacing-wide);">
          The quick brown fox jumps over the lazy dog
        </div>
      </div>
    </div>
  `,
};
