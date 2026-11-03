import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

function mount(attributes: Record<string, string>): void {
  const picker = document.createElement('zd-date-range-picker');
  for (const [name, value] of Object.entries(attributes)) picker.setAttribute(name, value);
  getContainer().appendChild(picker);
}

describeA11y('zd-date-range-picker', () => {
  it('passes axe checks with label', async () => {
    mount({ label: 'Availability window' });
    await expectNoViolations();
  });

  it('passes axe checks with a value and help text', async () => {
    mount({
      label: 'Availability window',
      value: '2026-03-10/2026-03-14',
      'help-text': 'Choose a date within the next month.',
    });
    await expectNoViolations();
  });

  it('passes axe checks when open', async () => {
    mount({ label: 'Availability window', 'focus-date': '2026-03-01', open: '' });
    await expectNoViolations();
  });

  it('passes axe checks when invalid', async () => {
    mount({
      label: 'Availability window',
      required: '',
      invalid: '',
      'error-message': 'Enter a date.',
    });
    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    mount({ label: 'Availability window', disabled: '' });
    await expectNoViolations();
  });
});
