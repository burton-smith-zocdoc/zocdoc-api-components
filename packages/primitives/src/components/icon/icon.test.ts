import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';
import type { ZdIcon } from './icon.js';

const SIZES = ['small', 'default', 'large'] as const;

describeA11y('zd-icon', () => {
  it('passes axe checks with aria-hidden (decorative)', async () => {
    const icon = document.createElement('zd-icon') as ZdIcon;
    icon.name = 'check';
    icon.setAttribute('aria-hidden', 'true');
    getContainer().appendChild(icon);

    await expectNoViolations();
  });

  it('passes axe checks with aria-label (meaningful)', async () => {
    const icon = document.createElement('zd-icon') as ZdIcon;
    icon.name = 'check';
    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-label', 'Completed');
    getContainer().appendChild(icon);

    await expectNoViolations();
  });

  it.each(SIZES)('passes axe checks with size="%s"', async (size) => {
    const icon = document.createElement('zd-icon') as ZdIcon;
    icon.name = 'info';
    icon.size = size;
    icon.setAttribute('aria-hidden', 'true');
    getContainer().appendChild(icon);

    await expectNoViolations();
  });
});
