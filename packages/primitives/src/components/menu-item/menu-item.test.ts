import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

interface ZdMenuItem extends HTMLElement {
  disabled?: boolean;
}

describeA11y('zd-menu-item', () => {
  it('passes axe checks within menu context', async () => {
    const menu = document.createElement('zd-menu');
    menu.innerHTML = `
      <button slot="trigger">Menu</button>
      <zd-menu-item>Menu item</zd-menu-item>
    `;
    getContainer().appendChild(menu);

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const menu = document.createElement('zd-menu');
    const item = document.createElement('zd-menu-item') as ZdMenuItem;
    item.textContent = 'Disabled item';
    item.disabled = true;
    menu.innerHTML = '<button slot="trigger">Menu</button>';
    menu.appendChild(item);
    getContainer().appendChild(menu);

    await expectNoViolations();
  });
});
