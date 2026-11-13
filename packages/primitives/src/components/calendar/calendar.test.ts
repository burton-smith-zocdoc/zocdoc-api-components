import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

function mount(attributes: Record<string, string>): void {
  const calendar = document.createElement('zd-calendar');
  for (const [name, value] of Object.entries(attributes)) calendar.setAttribute(name, value);
  getContainer().appendChild(calendar);
}

describeA11y('zd-calendar', () => {
  it('passes axe checks in single mode', async () => {
    mount({ 'focus-date': '2026-03-01' });
    await expectNoViolations();
  });

  it('passes axe checks with a selected date and bounds', async () => {
    mount({ value: '2026-03-10', min: '2026-03-05', max: '2026-03-25' });
    await expectNoViolations();
  });

  it('passes axe checks in range mode with a selected range', async () => {
    mount({ 'selection-mode': 'range', value: '2026-03-10/2026-03-14' });
    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    mount({ 'focus-date': '2026-03-01', disabled: '' });
    await expectNoViolations();
  });
});
