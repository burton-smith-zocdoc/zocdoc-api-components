import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-spinner', () => {
  it('passes axe checks with aria-label', async () => {
    const el = document.createElement('zd-spinner');
    el.setAttribute('aria-label', 'Loading content');
    getContainer().appendChild(el);

    await expectNoViolations();
  });
});
