import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdSelect extends HTMLElement {
  label?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
}

describeA11y('zd-select', () => {
  it('passes axe checks with label and options', async () => {
    const el = document.createElement('zd-select') as ZdSelect;
    el.label = 'Choose a country';
    el.innerHTML = `
      <option value="">Select...</option>
      <option value="us">United States</option>
      <option value="ca">Canada</option>
    `;
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const el = document.createElement('zd-select') as ZdSelect;
    el.label = 'Disabled select';
    el.disabled = true;
    el.innerHTML = '<option value="">Select...</option>';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when required', async () => {
    const el = document.createElement('zd-select') as ZdSelect;
    el.label = 'Required field';
    el.required = true;
    el.innerHTML = '<option value="">Select...</option>';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
