import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdAlert extends HTMLElement {
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

const VARIANTS = ['info', 'success', 'warning', 'danger'] as const;

describeA11y('zd-alert', () => {
  it('passes axe checks with default variant', async () => {
    const el = document.createElement('zd-alert') as ZdAlert;
    el.textContent = 'This is an alert message.';
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });

  it.each(VARIANTS)('passes axe checks with variant="%s"', async (variant) => {
    const el = document.createElement('zd-alert') as ZdAlert;
    el.variant = variant;
    el.textContent = `This is a ${variant} alert.`;
    getContainer().appendChild(el);
    await waitForUpdate();

    await expectNoViolations();
  });
});
