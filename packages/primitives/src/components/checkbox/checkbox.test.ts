import { afterEach, describe, expect, it } from 'vitest';
import {
  describeA11y,
  expectNoViolations,
  getContainer,
  waitForUpdate,
} from '../../utils/test/a11y.js';
import type { ZdCheckbox } from './checkbox.js';

// Charm validates against its inner input, which doesn't exist until the first
// render. An error message set before then used to throw from willUpdate and
// leave the checkbox unrendered.
describe('zd-checkbox error message before first render', () => {
  afterEach(() => document.body.querySelectorAll('zd-checkbox').forEach((el) => el.remove()));

  it('renders when error-message is in the markup', async () => {
    const host = document.createElement('div');
    host.innerHTML = '<zd-checkbox error-message="Confirm to continue.">I agree</zd-checkbox>';
    document.body.append(host);
    await waitForUpdate();

    expect(host.querySelector('zd-checkbox')?.shadowRoot?.querySelector('input')).not.toBeNull();
    host.remove();
  });

  it('renders and reports invalid when errorMessage is set before connecting', async () => {
    const checkbox = document.createElement('zd-checkbox') as ZdCheckbox;
    checkbox.textContent = 'I agree';
    checkbox.errorMessage = 'Confirm to continue.';
    document.body.append(checkbox);
    await waitForUpdate();

    expect(checkbox.shadowRoot?.querySelector('input')).not.toBeNull();
    expect(checkbox.checkValidity()).toBe(false);
  });
});

describeA11y('zd-checkbox', () => {
  it('passes axe checks with label', async () => {
    const checkbox = document.createElement('zd-checkbox') as ZdCheckbox;
    checkbox.label = 'Accept terms and conditions';
    getContainer().appendChild(checkbox);

    await expectNoViolations();
  });

  it('passes axe checks when checked', async () => {
    const checkbox = document.createElement('zd-checkbox') as ZdCheckbox;
    checkbox.label = 'Subscribe to newsletter';
    checkbox.checked = true;
    getContainer().appendChild(checkbox);

    await expectNoViolations();
  });

  it('passes axe checks when indeterminate', async () => {
    const checkbox = document.createElement('zd-checkbox') as ZdCheckbox;
    checkbox.label = 'Select all';
    checkbox.indeterminate = true;
    getContainer().appendChild(checkbox);

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const checkbox = document.createElement('zd-checkbox') as ZdCheckbox;
    checkbox.label = 'Disabled option';
    checkbox.disabled = true;
    getContainer().appendChild(checkbox);

    await expectNoViolations();
  });

  it('passes axe checks with size="small"', async () => {
    const checkbox = document.createElement('zd-checkbox') as ZdCheckbox;
    checkbox.label = 'Small checkbox';
    checkbox.size = 'small';
    getContainer().appendChild(checkbox);

    await expectNoViolations();
  });
});
