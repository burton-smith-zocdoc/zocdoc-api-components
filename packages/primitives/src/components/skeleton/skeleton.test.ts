import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

describeA11y('zd-skeleton', () => {
  it('passes axe checks as loading placeholder', async () => {
    const el = document.createElement('zd-skeleton');
    el.setAttribute('aria-hidden', 'true');
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
