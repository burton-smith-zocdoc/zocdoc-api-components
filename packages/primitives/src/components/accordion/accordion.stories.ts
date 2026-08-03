import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdAccordion } from './accordion.js';
import './accordion.js';
import '../accordion-item/accordion-item.js';

const { args, argTypes, template } = getStorybookHelpers<ZdAccordion>('zd-accordion', { excludeCategories: ['cssParts'] });

const meta: Meta<ZdAccordion> = {
  title: 'Primitives/Accordion',
  component: 'zd-accordion',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`
      <zd-accordion-item heading="What should I bring to my visit?">
        Bring your photo ID and your insurance card.
      </zd-accordion-item>
      <zd-accordion-item heading="How do I reschedule?">
        Open the appointment from your account and choose a new time.
      </zd-accordion-item>
    `),
};

export default meta;
type Story = StoryObj<ZdAccordion>;

export const Default: Story = {};

export const OpenSingle: Story = {
  args: { openSingle: true },
  render: (args) =>
    template(
      args,
      html`
        <zd-accordion-item heading="First">Only one panel stays open.</zd-accordion-item>
        <zd-accordion-item heading="Second">Opening this closes the first.</zd-accordion-item>
      `,
    ),
};
