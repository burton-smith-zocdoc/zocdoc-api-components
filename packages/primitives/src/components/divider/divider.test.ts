import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-divider', () => {
  it('passes axe checks as separator', async () => {
    const el = document.createElement('zd-divider');
    getContainer().appendChild(el);

    await expectNoViolations();
  });
});
