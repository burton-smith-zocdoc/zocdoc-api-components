import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

const OPTIONS =
  '<zd-option value="dermatology">Dermatology</zd-option><zd-option value="dentistry">Dentistry</zd-option><zd-option value="cardiology">Cardiology</zd-option>';

function mount(attributes: Record<string, string>, options = OPTIONS): HTMLElement {
  const combobox = document.createElement('zd-combobox');
  for (const [name, value] of Object.entries(attributes)) combobox.setAttribute(name, value);
  combobox.innerHTML = options;
  getContainer().appendChild(combobox);
  return combobox;
}

describeA11y('zd-combobox', () => {
  it('passes axe checks with label and options', async () => {
    mount({ label: 'Specialty' });
    await expectNoViolations();
  });

  it('passes axe checks when open', async () => {
    mount({ label: 'Specialty', open: '' });
    await expectNoViolations();
  });

  it('passes axe checks with grouped options', async () => {
    mount(
      { label: 'Specialty', open: '' },
      '<zd-option-group label="Medical"><zd-option value="cardiology">Cardiology</zd-option></zd-option-group><zd-option-group label="Dental"><zd-option value="dentistry">Dentistry</zd-option></zd-option-group>'
    );
    await expectNoViolations();
  });

  it('passes axe checks with multiple selection', async () => {
    mount({ label: 'Specialties', multiple: '', value: 'dermatology,cardiology' });
    await expectNoViolations();
  });

  it('passes axe checks when invalid', async () => {
    mount({
      label: 'Specialty',
      required: '',
      invalid: '',
      'error-message': 'Choose a specialty.',
    });
    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    mount({ label: 'Specialty', disabled: '' });
    await expectNoViolations();
  });
});
