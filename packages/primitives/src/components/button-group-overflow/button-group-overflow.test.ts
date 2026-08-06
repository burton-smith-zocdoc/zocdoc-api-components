import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

describeA11y('zd-button-group-overflow', () => {
  it('passes axe checks within button group', async () => {
    const group = document.createElement('zd-button-group');
    group.setAttribute('aria-label', 'Actions');
    group.innerHTML = `
      <zd-button>Action 1</zd-button>
      <zd-button-group-overflow>
        <zd-button>Overflow 1</zd-button>
        <zd-button>Overflow 2</zd-button>
      </zd-button-group-overflow>
    `;
    getContainer().appendChild(group);

    await expectNoViolations();
  });
});
