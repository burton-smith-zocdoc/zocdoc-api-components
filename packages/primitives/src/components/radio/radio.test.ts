import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';
import type { ZdRadioGroup } from '../radio-group/radio-group.js';
import type { ZdRadio } from './radio.js';

/**
 * Radios are only tested inside a group. `zd-radio` puts `role="radio"` on its host,
 * and ARIA requires that role to have a `radiogroup` ancestor — a lone radio fails
 * axe's `aria-required-parent` no matter how it is labelled. The group also owns
 * `name` and `value`; the radio itself has neither.
 */
function createGroup(label: string, name: string): ZdRadioGroup {
  const group = document.createElement('zd-radio-group') as ZdRadioGroup;
  group.label = label;
  group.name = name;
  return group;
}

function createRadio(label: string, value: string): ZdRadio {
  const radio = document.createElement('zd-radio') as ZdRadio;
  radio.label = label;
  radio.value = value;
  return radio;
}

describeA11y('zd-radio', () => {
  it('passes axe checks with label', async () => {
    const group = createGroup('Choose an option', 'options');
    group.appendChild(createRadio('Option A', 'a'));
    getContainer().appendChild(group);

    await expectNoViolations();
  });

  it('passes axe checks when checked', async () => {
    const group = createGroup('Choose an option', 'selected');
    const radio = createRadio('Selected option', 'selected');
    radio.checked = true;
    group.appendChild(radio);
    getContainer().appendChild(group);

    await expectNoViolations();
  });

  it('passes axe checks when disabled', async () => {
    const group = createGroup('Choose an option', 'disabled');
    const radio = createRadio('Disabled option', 'disabled');
    radio.disabled = true;
    group.appendChild(radio);
    getContainer().appendChild(group);

    await expectNoViolations();
  });

  it('passes axe checks with size="small"', async () => {
    const group = createGroup('Choose an option', 'small');
    const radio = createRadio('Small radio', 'small');
    radio.size = 'small';
    group.appendChild(radio);
    getContainer().appendChild(group);

    await expectNoViolations();
  });

  it('passes axe checks with multiple radios in group', async () => {
    const group = createGroup('Choose an option', 'group');
    for (const value of ['a', 'b', 'c']) {
      group.appendChild(createRadio(`Option ${value.toUpperCase()}`, value));
    }
    getContainer().appendChild(group);

    await expectNoViolations();
  });
});
