import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

interface ZdAvatar extends HTMLElement {
  initials?: string;
  src?: string;
  alt?: string;
}

describeA11y('zd-avatar', () => {
  it('passes axe checks with initials', async () => {
    const el = document.createElement('zd-avatar') as ZdAvatar;
    el.initials = 'JD';
    el.setAttribute('aria-label', 'John Doe');
    getContainer().appendChild(el);

    await expectNoViolations();
  });

  it('passes axe checks with image and alt', async () => {
    const el = document.createElement('zd-avatar') as ZdAvatar;
    el.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    el.alt = 'Profile picture';
    getContainer().appendChild(el);

    await expectNoViolations();
  });
});
