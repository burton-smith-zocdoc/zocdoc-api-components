import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-menu-group', () => {
  it('passes axe checks with label and items', async () => {
    const menu = document.createElement('zd-menu');
    menu.innerHTML = `
      <button slot="trigger">Menu</button>
      <zd-menu-group label="Actions">
        <zd-menu-item>Action 1</zd-menu-item>
        <zd-menu-item>Action 2</zd-menu-item>
      </zd-menu-group>
    `;
    getContainer().appendChild(menu);

    await expectNoViolations();
  });
});
