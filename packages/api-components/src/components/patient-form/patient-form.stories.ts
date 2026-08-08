import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { SCENARIOS } from '../../client/mock/fixtures.js';
import type { ZdPatientForm } from './patient-form.js';
import './index.js';

/**
 * No mock transport here, and no `configureZocdoc` either: this component validates and
 * emits, and never performs a request. If these stories start needing a token, something
 * has grown a network call that does not belong in it.
 *
 * Every value below is a synthetic placeholder from a reserved range — `example.test` is a
 * reserved TLD and `555` the reserved fictional exchange (PHI-002). Nothing here resembles
 * a real patient, and nothing about the Actions panel logging `patient-submit` is safe to
 * copy into a production page: that payload is PHI (PHI-001).
 */
const PLACEHOLDER = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-01',
  sex_at_birth: 'female',
  phone_number: '5551234567',
  email_address: 'test@example.test',
  address1: '1 Test St',
  city: 'Brooklyn',
  state: 'NY',
  zip_code: SCENARIOS.zipWithResults,
};

const { args, argTypes, template } = getStorybookHelpers<ZdPatientForm>('zd-patient-form', {
  excludeCategories: ['cssParts'],
});

const meta: Meta<ZdPatientForm> = {
  title: 'API Components/Patient Form',
  component: 'zd-patient-form',
  args,
  argTypes,
  render: (args) => template(args),
};

export default meta;
type Story = StoryObj<ZdPatientForm>;

/**
 * Fill it in and press Continue, or press Enter in any field — Charm's input calls
 * `form.requestSubmit()`, so the keyboard path needs no extra handler. The valid payload
 * leaves as `patient-submit`; nothing leaves until every field passes.
 */
export const Default: Story = {};

/**
 * Prefilled from the host page. A page that already knows who the patient is sets `values`
 * rather than making them type it again. The property is deliberately not an attribute, so
 * it is set as a property — `.values`, not `values=`.
 */
export const Prefilled: Story = {
  render: () => html`<zd-patient-form .values=${{ ...PLACEHOLDER }}></zd-patient-form>`,
};

/**
 * Everything but the phone number, which is in the wrong shape. Press Continue: the error
 * appears on the phone field itself rather than in a summary somewhere else, focus moves
 * there, and no event fires.
 */
export const InvalidPhoneNumber: Story = {
  render: () => html`
    <zd-patient-form .values=${{ ...PLACEHOLDER, phone_number: '555-123-4567' }}></zd-patient-form>
  `,
};

/**
 * The form is a grid, so it follows the width it is given rather than setting one. Narrow
 * enough and the two columns become one — worth checking here rather than discovering it in
 * a host page's sidebar.
 */
export const Narrow: Story = {
  render: () => html`
    <div style="max-inline-size: 22rem;">
      <zd-patient-form .values=${{ ...PLACEHOLDER }}></zd-patient-form>
    </div>
  `,
};
