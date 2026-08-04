import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';
import type { ZdTextArea } from './text-area.js';

describeA11y('zd-text-area', () => {
  it('passes axe checks with label', async () => {
    const textarea = document.createElement('zd-text-area') as ZdTextArea;
    textarea.label = 'Message';
    getContainer().appendChild(textarea);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with placeholder', async () => {
    const textarea = document.createElement('zd-text-area') as ZdTextArea;
    textarea.label = 'Comments';
    textarea.placeholder = 'Enter your comments...';
    getContainer().appendChild(textarea);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when required', async () => {
    const textarea = document.createElement('zd-text-area') as ZdTextArea;
    textarea.label = 'Required feedback';
    textarea.required = true;
    getContainer().appendChild(textarea);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const textarea = document.createElement('zd-text-area') as ZdTextArea;
    textarea.label = 'Disabled field';
    textarea.disabled = true;
    getContainer().appendChild(textarea);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with size="small"', async () => {
    const textarea = document.createElement('zd-text-area') as ZdTextArea;
    textarea.label = 'Small textarea';
    textarea.size = 'small';
    getContainer().appendChild(textarea);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with help text', async () => {
    const textarea = document.createElement('zd-text-area') as ZdTextArea;
    textarea.label = 'Description';
    textarea.helpText = 'Maximum 500 characters';
    getContainer().appendChild(textarea);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with custom rows', async () => {
    const textarea = document.createElement('zd-text-area') as ZdTextArea;
    textarea.label = 'Long text';
    textarea.rows = 10;
    getContainer().appendChild(textarea);
    await waitForUpdate();

    await expectNoViolations();
  });
});
