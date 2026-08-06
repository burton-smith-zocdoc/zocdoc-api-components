import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';
import type { ZdInput } from './input.js';

describeA11y('zd-input', () => {
  it('passes axe checks with label', async () => {
    const input = document.createElement('zd-input') as ZdInput;
    input.label = 'Email address';
    getContainer().appendChild(input);

    await expectNoViolations();
  });

  it('passes axe checks with placeholder', async () => {
    const input = document.createElement('zd-input') as ZdInput;
    input.label = 'Search';
    input.placeholder = 'Type to search...';
    getContainer().appendChild(input);

    await expectNoViolations();
  });

  it('passes axe checks when required', async () => {
    const input = document.createElement('zd-input') as ZdInput;
    input.label = 'Required field';
    input.required = true;
    getContainer().appendChild(input);

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const input = document.createElement('zd-input') as ZdInput;
    input.label = 'Disabled field';
    input.disabled = true;
    getContainer().appendChild(input);

    await expectNoViolations();
  });

  it('passes axe checks with size="small"', async () => {
    const input = document.createElement('zd-input') as ZdInput;
    input.label = 'Small input';
    input.size = 'small';
    getContainer().appendChild(input);

    await expectNoViolations();
  });

  it('passes axe checks with help text', async () => {
    const input = document.createElement('zd-input') as ZdInput;
    input.label = 'Password';
    input.helpText = 'Must be at least 8 characters';
    getContainer().appendChild(input);

    await expectNoViolations();
  });
});
