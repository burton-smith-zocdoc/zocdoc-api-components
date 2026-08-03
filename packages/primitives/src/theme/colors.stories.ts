import { html, css, LitElement } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';

const colorScales = ['brand', 'accent', 'success', 'warning', 'danger', 'neutral'] as const;
const colorSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;

class ColorSwatch extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .swatch-grid {
      display: grid;
      grid-template-columns: repeat(11, 1fr);
      gap: 4px;
    }
    .swatch-row {
      display: contents;
    }
    .swatch {
      aspect-ratio: 1;
      border-radius: 8px;
      min-width: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    .scale-label {
      grid-column: 1 / -1;
      font-weight: 600;
      padding: 16px 0 8px;
      text-transform: capitalize;
    }
    .swatch-label {
      color: inherit;
    }
  `;

  override render() {
    return html`
      <div class="swatch-grid">
        ${colorScales.map(
          (scale) => html`
            <div class="scale-label">${scale}</div>
            <div class="swatch-row">
              ${colorSteps.map(
                (step) => html`
                  <div
                    class="swatch"
                    style="background-color: var(--zd-color-${scale}-${step}); color: ${parseInt(step) > 400 ? '#fff' : '#000'}"
                  >
                    <span class="swatch-label">${step}</span>
                  </div>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }
}

customElements.define('color-swatch-grid', ColorSwatch);

const meta: Meta = {
  title: 'Theme/Colors',
  parameters: {
    docs: {
      description: {
        component: `
# Color Tokens

The Zocdoc theme includes comprehensive color scales for brand, accent, success, warning, danger, and neutral colors.

## Usage

Colors are available as CSS custom properties:

\`\`\`css
.my-element {
  background-color: var(--zd-color-brand-500);
  color: var(--zd-color-neutral-900);
}
\`\`\`

## Color Scales

Each color has 11 steps from 50 (lightest) to 950 (darkest):

- **Brand** — Primary brand color (blue)
- **Accent** — Secondary accent color (purple)
- **Success** — Positive feedback (green)
- **Warning** — Cautionary feedback (orange)
- **Danger** — Negative feedback (red)
- **Neutral** — Grayscale for text, borders, backgrounds
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const AllColors: Story = {
  render: () => html`<color-swatch-grid></color-swatch-grid>`,
};

export const BrandColors: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      ${colorSteps.map(
        (step) => html`
          <div style="text-align: center;">
            <div
              style="width: 64px; height: 64px; border-radius: 8px; background-color: var(--zd-color-brand-${step}); border: 1px solid rgba(0,0,0,0.1);"
            ></div>
            <div style="font-size: 12px; margin-top: 4px;">${step}</div>
          </div>
        `
      )}
    </div>
  `,
};

export const SemanticColors: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
      <div style="text-align: center;">
        <div
          style="height: 80px; border-radius: 8px; background-color: var(--zd-color-success-500); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;"
        >
          Success
        </div>
      </div>
      <div style="text-align: center;">
        <div
          style="height: 80px; border-radius: 8px; background-color: var(--zd-color-warning-500); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;"
        >
          Warning
        </div>
      </div>
      <div style="text-align: center;">
        <div
          style="height: 80px; border-radius: 8px; background-color: var(--zd-color-danger-500); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;"
        >
          Danger
        </div>
      </div>
      <div style="text-align: center;">
        <div
          style="height: 80px; border-radius: 8px; background-color: var(--zd-color-brand-500); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;"
        >
          Brand
        </div>
      </div>
    </div>
  `,
};
