import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

describeA11y('zd-button-group', () => {
  it('passes axe checks with buttons', async () => {
    const group = document.createElement('zd-button-group');
    group.setAttribute('aria-label', 'Actions');
    group.innerHTML = `
      <zd-button>Save</zd-button>
      <zd-button>Cancel</zd-button>
    `;
    getContainer().appendChild(group);
    await waitForUpdate();

    await expectNoViolations();
  });
});
