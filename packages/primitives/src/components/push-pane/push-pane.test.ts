import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

interface ZdPushPane extends HTMLElement {
  open?: boolean;
  heading?: string;
}

describeA11y('zd-push-pane', () => {
  it('passes axe checks when open with heading', async () => {
    const pane = document.createElement('zd-push-pane') as ZdPushPane;
    pane.heading = 'Side panel';
    pane.innerHTML = '<p>Panel content.</p>';
    pane.open = true;
    getContainer().appendChild(pane);

    await expectNoViolations();
  });
});
