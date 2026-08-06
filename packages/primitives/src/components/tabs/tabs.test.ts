import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

// Skip: Charm tabs has a cleanup bug that throws after test completion.
// TODO: Re-enable when Charm fixes handlePanelSlotChange error.
describeA11y.skip('zd-tabs', () => {
  it('passes axe checks with tabs and panels', async () => {
    const tabs = document.createElement('zd-tabs');
    tabs.innerHTML = `
      <zd-tab slot="tab">Tab 1</zd-tab>
      <zd-tab slot="tab">Tab 2</zd-tab>
      <zd-tab-panel>Content for tab 1</zd-tab-panel>
      <zd-tab-panel>Content for tab 2</zd-tab-panel>
    `;
    getContainer().appendChild(tabs);

    await expectNoViolations();
  });
});
