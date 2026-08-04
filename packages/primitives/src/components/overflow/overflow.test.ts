import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

describeA11y('zd-overflow', () => {
  it('passes axe checks with overflow content', async () => {
    const el = document.createElement('zd-overflow');
    el.innerHTML = '<p>Content that may overflow.</p>';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
