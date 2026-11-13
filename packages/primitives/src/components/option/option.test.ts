import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-option', () => {
  it('passes axe checks inside a combobox', async () => {
    const combobox = document.createElement('zd-combobox');
    combobox.setAttribute('label', 'Visit type');
    combobox.setAttribute('open', '');
    combobox.innerHTML =
      '<zd-option value="in-person">In person</zd-option><zd-option value="video" selected>Video visit</zd-option><zd-option value="phone" disabled>Phone call</zd-option>';
    getContainer().appendChild(combobox);

    await expectNoViolations();
  });
});
