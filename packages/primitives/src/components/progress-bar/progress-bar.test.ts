import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdProgressBar extends HTMLElement {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  label?: string;
}

describeA11y('zd-progress-bar', () => {
  it('passes axe checks with determinate progress', async () => {
    const el = document.createElement('zd-progress-bar') as ZdProgressBar;
    el.value = 50;
    el.max = 100;
    el.label = 'Upload progress';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with indeterminate progress', async () => {
    const el = document.createElement('zd-progress-bar') as ZdProgressBar;
    el.indeterminate = true;
    el.label = 'Loading';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
