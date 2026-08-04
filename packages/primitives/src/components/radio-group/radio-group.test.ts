import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';

interface ZdRadioGroup extends HTMLElement {
  label?: string;
}

interface ZdRadio extends HTMLElement {
  label?: string;
  value?: string;
}

describeA11y('zd-radio-group', () => {
  it('passes axe checks with label and radios', async () => {
    const group = document.createElement('zd-radio-group') as ZdRadioGroup;
    group.label = 'Choose an option';

    for (const value of ['a', 'b', 'c']) {
      const radio = document.createElement('zd-radio') as ZdRadio;
      radio.label = `Option ${value.toUpperCase()}`;
      radio.value = value;
      group.appendChild(radio);
    }

    getContainer().appendChild(group);
    await waitForUpdate();

    await expectNoViolations();
  });
});
