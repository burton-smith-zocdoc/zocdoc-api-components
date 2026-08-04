import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

describeA11y('zd-card', () => {
  it('passes axe checks with content', async () => {
    const el = document.createElement('zd-card');
    el.innerHTML = '<p>Card content goes here.</p>';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
