import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';
import type { ZdButton } from './button.js';

const VARIANTS = ['primary', 'secondary', 'inverse', 'ghost', 'destructive', 'link'] as const;

describeA11y('zd-button', () => {
  it('passes axe checks with default variant', async () => {
    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Click me';
    getContainer().appendChild(button);
    await waitForUpdate();

    await expectNoViolations();
  });

  it.each(VARIANTS)('passes axe checks with variant="%s"', async (variant) => {
    const button = document.createElement('zd-button') as ZdButton;
    button.variant = variant;
    button.textContent = 'Click me';
    getContainer().appendChild(button);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Disabled button';
    button.disabled = true;
    getContainer().appendChild(button);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with size="small"', async () => {
    const button = document.createElement('zd-button') as ZdButton;
    button.textContent = 'Small button';
    button.size = 'small';
    getContainer().appendChild(button);
    await waitForUpdate();

    await expectNoViolations();
  });
});
