import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

interface ZdDisclosure extends HTMLElement {
  open?: boolean;
  summary?: string;
}

describeA11y('zd-disclosure', () => {
  it('passes axe checks when collapsed', async () => {
    const el = document.createElement('zd-disclosure') as ZdDisclosure;
    el.summary = 'Show more details';
    el.innerHTML = '<p>Hidden content here.</p>';
    getContainer().appendChild(el);

    await expectNoViolations();
  });

  it('passes axe checks when expanded', async () => {
    const el = document.createElement('zd-disclosure') as ZdDisclosure;
    el.summary = 'Show more details';
    el.innerHTML = '<p>Visible content here.</p>';
    el.open = true;
    getContainer().appendChild(el);

    await expectNoViolations();
  });
});
