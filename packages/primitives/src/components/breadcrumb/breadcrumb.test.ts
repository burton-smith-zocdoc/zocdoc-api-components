import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-breadcrumb', () => {
  it('passes axe checks with breadcrumb items', async () => {
    const breadcrumb = document.createElement('zd-breadcrumb');
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    breadcrumb.innerHTML = `
      <zd-breadcrumb-item href="/">Home</zd-breadcrumb-item>
      <zd-breadcrumb-item href="/products">Products</zd-breadcrumb-item>
      <zd-breadcrumb-item current>Current Page</zd-breadcrumb-item>
    `;
    getContainer().appendChild(breadcrumb);

    await expectNoViolations();
  });
});
