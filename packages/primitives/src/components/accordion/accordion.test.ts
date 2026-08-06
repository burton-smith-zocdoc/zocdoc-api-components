import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-accordion', () => {
  it('passes axe checks with accordion items', async () => {
    const accordion = document.createElement('zd-accordion');
    accordion.innerHTML = `
      <zd-accordion-item heading="Section 1">
        <p>Content for section 1.</p>
      </zd-accordion-item>
      <zd-accordion-item heading="Section 2">
        <p>Content for section 2.</p>
      </zd-accordion-item>
    `;
    getContainer().appendChild(accordion);

    await expectNoViolations();
  });
});
