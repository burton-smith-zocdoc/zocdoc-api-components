import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';
import type { ZdCheckbox } from './checkbox.js';

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
