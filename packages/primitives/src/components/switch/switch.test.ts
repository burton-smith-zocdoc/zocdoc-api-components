import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdSwitch extends HTMLElement {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
}

describeA11y('zd-switch', () => {
  it('passes axe checks with label', async () => {
    const el = document.createElement('zd-switch') as ZdSwitch;
    el.label = 'Enable notifications';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when checked', async () => {
    const el = document.createElement('zd-switch') as ZdSwitch;
    el.label = 'Dark mode';
    el.checked = true;
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const el = document.createElement('zd-switch') as ZdSwitch;
    el.label = 'Disabled toggle';
    el.disabled = true;
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
