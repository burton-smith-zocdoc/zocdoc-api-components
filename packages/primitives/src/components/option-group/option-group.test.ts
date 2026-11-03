import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-option-group', () => {
  it('passes axe checks inside a combobox', async () => {
    const combobox = document.createElement('zd-combobox');
    combobox.setAttribute('label', 'Specialty');
    combobox.setAttribute('open', '');
    combobox.innerHTML =
      '<zd-option-group label="Medical"><zd-option value="cardiology">Cardiology</zd-option></zd-option-group><zd-option-group label="Dental" disabled><zd-option value="dentistry">Dentistry</zd-option></zd-option-group>';
    getContainer().appendChild(combobox);

    await expectNoViolations();
  });
});
