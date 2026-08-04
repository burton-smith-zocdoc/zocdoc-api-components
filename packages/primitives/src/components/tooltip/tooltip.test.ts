import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdTooltip extends HTMLElement {
  content?: string;
}

describeA11y('zd-tooltip', () => {
  it('passes axe checks with trigger and content', async () => {
    const el = document.createElement('zd-tooltip') as ZdTooltip;
    el.content = 'Helpful information';
    el.innerHTML = '<button>Hover me</button>';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
