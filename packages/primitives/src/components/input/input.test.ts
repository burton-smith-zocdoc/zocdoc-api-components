import { describe, expect, it } from 'vitest';
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

/**
 * Charm's form control reflects `value`, which would put whatever a patient types — an email,
 * a name, a date of birth — into the page's markup, where a screenshot, a bug report or a page
 * cache picks it up (PHI-001).
 */
describe('zd-input value', () => {
  it('stays out of the DOM when set', async () => {
    const input = document.createElement('zd-input') as ZdInput;
    input.label = 'Email address';
    document.body.appendChild(input);

    input.value = 'patient@example.com';
    await input.updateComplete;

    expect(input.hasAttribute('value')).toBe(false);
    expect(input.value).toBe('patient@example.com');
    input.remove();
  });

  it('still reads an initial value attribute', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<zd-input label="Email address" value="seed"></zd-input>'
    );
    const input = document.body.lastElementChild as ZdInput;
    await input.updateComplete;

    expect(input.value).toBe('seed');
    input.remove();
  });
});
