import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { ZdOptionGroup } from './option-group.js';
import './option-group.js';
import '../combobox/combobox.js';
import '../option/option.js';

const { args, argTypes, template } = getStorybookHelpers<ZdOptionGroup>('zd-option-group', {
  excludeCategories: ['cssParts'],
});

// A group only renders its label inside a combobox listbox, so each story wraps it in one.
const meta: Meta<ZdOptionGroup> = {
  title: 'Primitives/Option Group',
  component: 'zd-option-group',
  args: { ...args, label: 'Medical' },
  argTypes,
  render: (args) => html`
    <zd-combobox label="Specialty">
      ${template(
        args,
        html`
          <zd-option value="cardiology">Cardiology</zd-option>
          <zd-option value="dermatology">Dermatology</zd-option>
        `
      )}
      <zd-option-group label="Dental">
        <zd-option value="dentistry">Dentistry</zd-option>
      </zd-option-group>
    </zd-combobox>
  `,
};

export default meta;
type Story = StoryObj<ZdOptionGroup>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
