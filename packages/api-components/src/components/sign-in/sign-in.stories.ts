import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createMockPatientAuth } from '../../client/patient-auth.js';
import type { ZdSignIn } from './sign-in.js';
import './index.js';

/**
 * Experimental, and backed by the mock: "Continue with Zocdoc" signs in at once, in memory,
 * with no network call (PHI-003). Each render builds a fresh mock, so changing a control starts
 * signed out again. The real flow would leave this page for Zocdoc's own login screen.
 */
const meta: Meta<ZdSignIn> = {
  title: 'API Components/Sign In',
  component: 'zd-sign-in',
  args: { hideEmail: false },
  render: (args) => html`
    <zd-sign-in ?hide-email=${args.hideEmail} .auth=${createMockPatientAuth()}></zd-sign-in>
  `,
};

export default meta;
type Story = StoryObj<ZdSignIn>;

/** The email is optional and only pre-fills Zocdoc's page. Try `patient@example.com`. */
export const Default: Story = {};

/** No email field: the button alone. */
export const WithoutEmail: Story = { args: { hideEmail: true } };

/** The mock with `fail: true`. The alert's wording is fixed; "Try again" goes back to the form. */
export const SignInFails: Story = {
  render: (args) => html`
    <zd-sign-in
      ?hide-email=${args.hideEmail}
      .auth=${createMockPatientAuth({ fail: true })}
    ></zd-sign-in>
  `,
};

/**
 * The modal look, built by the host: the component is inline, so wrap it in a dialog. The
 * empty `heading` slot drops the component's own heading in favour of the dialog's.
 */
export const InADialog: Story = {
  render: (args) => html`
    <zd-dialog heading="Sign in to manage your appointments" open>
      <zd-sign-in ?hide-email=${args.hideEmail} .auth=${createMockPatientAuth()}>
        <span slot="heading"></span>
      </zd-sign-in>
    </zd-dialog>
  `,
};
