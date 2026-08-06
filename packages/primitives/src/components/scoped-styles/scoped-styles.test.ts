import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-scoped-styles', () => {
  it('passes axe checks as style container', async () => {
    const el = document.createElement('zd-scoped-styles');
    el.innerHTML = '<p>Styled content.</p>';
    getContainer().appendChild(el);

    await expectNoViolations();
  });
});
