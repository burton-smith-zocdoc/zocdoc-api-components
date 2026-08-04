import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdDialog extends HTMLElement {
  open?: boolean;
  heading?: string;
}

describeA11y('zd-dialog', () => {
  it('passes axe checks when open with heading', async () => {
    const el = document.createElement('zd-dialog') as ZdDialog;
    el.heading = 'Confirm action';
    el.innerHTML = '<p>Are you sure you want to proceed?</p>';
    getContainer().appendChild(el);
    await waitForUpdate();

    el.open = true;
    await waitForUpdate();
    await waitForUpdate();

    await expectNoViolations();
  });
});
