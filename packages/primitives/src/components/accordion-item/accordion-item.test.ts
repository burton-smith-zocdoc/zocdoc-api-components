import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdAccordionItem extends HTMLElement {
  heading?: string;
  open?: boolean;
}

describeA11y('zd-accordion-item', () => {
  it('passes axe checks when collapsed', async () => {
    const accordion = document.createElement('zd-accordion');
    const item = document.createElement('zd-accordion-item') as ZdAccordionItem;
    item.heading = 'Click to expand';
    item.innerHTML = '<p>Hidden content.</p>';
    accordion.appendChild(item);
    getContainer().appendChild(accordion);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when expanded', async () => {
    const accordion = document.createElement('zd-accordion');
    const item = document.createElement('zd-accordion-item') as ZdAccordionItem;
    item.heading = 'Expanded section';
    item.innerHTML = '<p>Visible content.</p>';
    item.open = true;
    accordion.appendChild(item);
    getContainer().appendChild(accordion);
    await waitForUpdate();

    await expectNoViolations();
  });
});
