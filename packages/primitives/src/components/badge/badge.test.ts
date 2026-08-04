import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer, waitForUpdate } from '../../test/a11y.js';
import type { ZdBadge } from './badge.js';

const VARIANTS = [
  'neutral',
  'inverse',
  'info',
  'success',
  'warning',
  'danger',
  'caution',
  'brand',
] as const;

describeA11y('zd-badge', () => {
  it('passes axe checks with default variant', async () => {
    const badge = document.createElement('zd-badge') as ZdBadge;
    badge.textContent = 'New';
    getContainer().appendChild(badge);
    await waitForUpdate();

    await expectNoViolations();
  });

  it.each(VARIANTS)('passes axe checks with variant="%s"', async (variant) => {
    const badge = document.createElement('zd-badge') as ZdBadge;
    badge.variant = variant;
    badge.textContent = 'Status';
    getContainer().appendChild(badge);
    await waitForUpdate();

    await expectNoViolations();
  });
});
