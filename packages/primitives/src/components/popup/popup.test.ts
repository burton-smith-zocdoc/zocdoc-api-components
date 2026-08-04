import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdPopup extends HTMLElement {
  open?: boolean;
}

describeA11y('zd-popup', () => {
  it('passes axe checks with trigger and content', async () => {
    const popup = document.createElement('zd-popup') as ZdPopup;
    popup.innerHTML = `
      <button slot="trigger">Toggle popup</button>
      <div>Popup content here.</div>
    `;
    getContainer().appendChild(popup);
    await waitForUpdate();

    await expectNoViolations();
  });
});
