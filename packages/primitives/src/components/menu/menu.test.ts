import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

interface ZdMenu extends HTMLElement {
  open?: boolean;
}

describeA11y('zd-menu', () => {
  it('passes axe checks with trigger and items', async () => {
    const menu = document.createElement('zd-menu') as ZdMenu;
    menu.innerHTML = `
      <button slot="trigger">Open menu</button>
      <zd-menu-item>Action 1</zd-menu-item>
      <zd-menu-item>Action 2</zd-menu-item>
      <zd-menu-item>Action 3</zd-menu-item>
    `;
    getContainer().appendChild(menu);

    await expectNoViolations();
  });
});
