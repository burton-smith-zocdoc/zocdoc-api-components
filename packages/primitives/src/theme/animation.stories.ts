import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Theme/Animation',
  parameters: {
    docs: {
      description: {
        component: `
# Animation Tokens

The Zocdoc theme provides duration and timing function tokens for consistent animations.

## Duration

| Token  | Value |
|--------|-------|
| xfast  | 0.1s  |
| fast   | 0.3s  |
| normal | 0.5s  |
| slow   | 1s    |
| xslow  | 2s    |

## Timing Functions

| Token     | Description            |
|-----------|------------------------|
| ease      | Default ease           |
| easeIn    | Starts slow            |
| easeOut   | Ends slow              |
| easeInOut | Starts and ends slow   |

## Z-Index Scale

| Token    | Value |
|----------|-------|
| base     | 0     |
| dropdown | 100   |
| sticky   | 200   |
| modal    | 300   |
| popover  | 400   |
| tooltip  | 500   |
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Durations: Story = {
  render: () => html`
    <style>
      .duration-demo {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .duration-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .duration-label {
        width: 80px;
        font-size: 14px;
        font-weight: 500;
      }
      .duration-value {
        width: 60px;
        font-size: 12px;
        color: var(--zd-color-neutral-500);
      }
      .duration-bar {
        flex: 1;
        height: 8px;
        background: var(--zd-color-neutral-200);
        border-radius: 4px;
        overflow: hidden;
      }
      .duration-fill {
        height: 100%;
        background: var(--zd-color-brand-500);
        width: 0;
        border-radius: 4px;
      }
      .duration-row:hover .duration-fill {
        width: 100%;
      }
      .xfast .duration-fill {
        transition: width var(--zd-duration-xfast) ease;
      }
      .fast .duration-fill {
        transition: width var(--zd-duration-fast) ease;
      }
      .normal .duration-fill {
        transition: width var(--zd-duration-normal) ease;
      }
      .slow .duration-fill {
        transition: width var(--zd-duration-slow) ease;
      }
      .xslow .duration-fill {
        transition: width var(--zd-duration-xslow) ease;
      }
    </style>
    <p style="font-size: 14px; color: var(--zd-color-neutral-600); margin-bottom: 16px;">
      Hover over each row to see the animation duration
    </p>
    <div class="duration-demo">
      <div class="duration-row xfast">
        <div class="duration-label">xfast</div>
        <div class="duration-value">0.1s</div>
        <div class="duration-bar"><div class="duration-fill"></div></div>
      </div>
      <div class="duration-row fast">
        <div class="duration-label">fast</div>
        <div class="duration-value">0.3s</div>
        <div class="duration-bar"><div class="duration-fill"></div></div>
      </div>
      <div class="duration-row normal">
        <div class="duration-label">normal</div>
        <div class="duration-value">0.5s</div>
        <div class="duration-bar"><div class="duration-fill"></div></div>
      </div>
      <div class="duration-row slow">
        <div class="duration-label">slow</div>
        <div class="duration-value">1s</div>
        <div class="duration-bar"><div class="duration-fill"></div></div>
      </div>
      <div class="duration-row xslow">
        <div class="duration-label">xslow</div>
        <div class="duration-value">2s</div>
        <div class="duration-bar"><div class="duration-fill"></div></div>
      </div>
    </div>
  `,
};

export const TimingFunctions: Story = {
  render: () => html`
    <style>
      .timing-demo {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .timing-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .timing-label {
        width: 100px;
        font-size: 14px;
        font-weight: 500;
      }
      .timing-track {
        flex: 1;
        height: 48px;
        background: var(--zd-color-neutral-100);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
      }
      .timing-ball {
        width: 32px;
        height: 32px;
        background: var(--zd-color-brand-500);
        border-radius: 50%;
        position: absolute;
        top: 8px;
        left: 8px;
      }
      .timing-row:hover .timing-ball {
        left: calc(100% - 40px);
      }
      .ease .timing-ball {
        transition: left 1s var(--zd-timingFunction-ease);
      }
      .ease-in .timing-ball {
        transition: left 1s var(--zd-timingFunction-easeIn);
      }
      .ease-out .timing-ball {
        transition: left 1s var(--zd-timingFunction-easeOut);
      }
      .ease-in-out .timing-ball {
        transition: left 1s var(--zd-timingFunction-easeInOut);
      }
    </style>
    <p style="font-size: 14px; color: var(--zd-color-neutral-600); margin-bottom: 16px;">
      Hover over each row to see the timing function
    </p>
    <div class="timing-demo">
      <div class="timing-row ease">
        <div class="timing-label">ease</div>
        <div class="timing-track"><div class="timing-ball"></div></div>
      </div>
      <div class="timing-row ease-in">
        <div class="timing-label">easeIn</div>
        <div class="timing-track"><div class="timing-ball"></div></div>
      </div>
      <div class="timing-row ease-out">
        <div class="timing-label">easeOut</div>
        <div class="timing-track"><div class="timing-ball"></div></div>
      </div>
      <div class="timing-row ease-in-out">
        <div class="timing-label">easeInOut</div>
        <div class="timing-track"><div class="timing-ball"></div></div>
      </div>
    </div>
  `,
};

export const ZIndexLayers: Story = {
  render: () => html`
    <div
      style="position: relative; height: 400px; background: var(--zd-color-neutral-100); border-radius: 12px; padding: 24px;"
    >
      <div
        style="position: absolute; top: 40px; left: 40px; width: 200px; height: 120px; background: var(--zd-color-neutral-200); border-radius: 8px; z-index: var(--zd-zIndex-base); display: flex; align-items: center; justify-content: center; font-weight: 500;"
      >
        base (0)
      </div>
      <div
        style="position: absolute; top: 80px; left: 80px; width: 200px; height: 120px; background: var(--zd-color-brand-100); border-radius: 8px; z-index: var(--zd-zIndex-dropdown); display: flex; align-items: center; justify-content: center; font-weight: 500; box-shadow: var(--zd-shadow-md);"
      >
        dropdown (100)
      </div>
      <div
        style="position: absolute; top: 120px; left: 120px; width: 200px; height: 120px; background: var(--zd-color-success-100); border-radius: 8px; z-index: var(--zd-zIndex-sticky); display: flex; align-items: center; justify-content: center; font-weight: 500; box-shadow: var(--zd-shadow-md);"
      >
        sticky (200)
      </div>
      <div
        style="position: absolute; top: 160px; left: 160px; width: 200px; height: 120px; background: var(--zd-color-warning-100); border-radius: 8px; z-index: var(--zd-zIndex-modal); display: flex; align-items: center; justify-content: center; font-weight: 500; box-shadow: var(--zd-shadow-lg);"
      >
        modal (300)
      </div>
      <div
        style="position: absolute; top: 200px; left: 200px; width: 200px; height: 120px; background: var(--zd-color-accent-100); border-radius: 8px; z-index: var(--zd-zIndex-popover); display: flex; align-items: center; justify-content: center; font-weight: 500; box-shadow: var(--zd-shadow-lg);"
      >
        popover (400)
      </div>
      <div
        style="position: absolute; top: 240px; left: 240px; width: 200px; height: 120px; background: var(--zd-color-danger-100); border-radius: 8px; z-index: var(--zd-zIndex-tooltip); display: flex; align-items: center; justify-content: center; font-weight: 500; box-shadow: var(--zd-shadow-xl);"
      >
        tooltip (500)
      </div>
    </div>
  `,
};
