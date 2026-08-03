import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdAccordionItem } from './accordion-item.js';
import './accordion-item.js';
import '../accordion/accordion.js';

const { args, argTypes, template } = getStorybookHelpers<ZdAccordionItem>('zd-accordion-item', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdAccordionItem> = {
  title: 'Primitives/Accordion Item',
  component: 'zd-accordion-item',
  tags: ['autodocs'],
  args,
  argTypes,
  render: (args) => template(args, html`Insurance is verified when you book.`),
};

export default meta;
type Story = StoryObj<ZdAccordionItem>;

export const Default: Story = {};

export const InAccordion: Story = {
  render: () => html`
    <zd-accordion>
      <zd-accordion-item heading="Before your visit">Arrive 10 minutes early.</zd-accordion-item>
      <zd-accordion-item heading="After your visit"
        >Your summary appears in your account.</zd-accordion-item
      >
    </zd-accordion>
  `,
};
