import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

const OPTIONS =
  '<zd-checkbox value="morning" label="Morning"></zd-checkbox><zd-checkbox value="afternoon" label="Afternoon"></zd-checkbox><zd-checkbox value="evening" label="Evening"></zd-checkbox>';

function mount(attributes: Record<string, string>): void {
  const group = document.createElement('zd-checkbox-group');
  for (const [name, value] of Object.entries(attributes)) group.setAttribute(name, value);
  group.innerHTML = OPTIONS;
  getContainer().appendChild(group);
}

describeA11y('zd-checkbox-group', () => {
  it('passes axe checks with label and checkboxes', async () => {
    mount({ label: 'Preferred times' });
    await expectNoViolations();
  });

  it('passes axe checks with help text and horizontal layout', async () => {
    mount({
      label: 'Preferred times',
      'help-text': 'Choose all that apply.',
      layout: 'horizontal',
    });
    await expectNoViolations();
  });

  it('passes axe checks when required and invalid', async () => {
    mount({
      label: 'Preferred times',
      required: '',
      invalid: '',
      'error-message': 'Choose at least one time.',
    });
    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    mount({ label: 'Preferred times', disabled: '' });
    await expectNoViolations();
  });
});
