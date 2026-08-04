import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';
import type { ZdRadio } from './radio.js';

describeA11y('zd-radio', () => {
  it('passes axe checks with label', async () => {
    const radio = document.createElement('zd-radio') as ZdRadio;
    radio.label = 'Option A';
    radio.name = 'options';
    radio.value = 'a';
    getContainer().appendChild(radio);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when checked', async () => {
    const radio = document.createElement('zd-radio') as ZdRadio;
    radio.label = 'Selected option';
    radio.name = 'selected';
    radio.value = 'selected';
    radio.checked = true;
    getContainer().appendChild(radio);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const radio = document.createElement('zd-radio') as ZdRadio;
    radio.label = 'Disabled option';
    radio.name = 'disabled';
    radio.value = 'disabled';
    radio.disabled = true;
    getContainer().appendChild(radio);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with size="small"', async () => {
    const radio = document.createElement('zd-radio') as ZdRadio;
    radio.label = 'Small radio';
    radio.name = 'small';
    radio.value = 'small';
    radio.size = 'small';
    getContainer().appendChild(radio);
    await waitForUpdate();

    await expectNoViolations();
  });

  it('passes axe checks with multiple radios in group', async () => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = 'Choose an option';
    fieldset.appendChild(legend);

    for (const value of ['a', 'b', 'c']) {
      const radio = document.createElement('zd-radio') as ZdRadio;
      radio.label = `Option ${value.toUpperCase()}`;
      radio.name = 'group';
      radio.value = value;
      fieldset.appendChild(radio);
    }

    getContainer().appendChild(fieldset);
    await waitForUpdate();

    await expectNoViolations();
  });
});
