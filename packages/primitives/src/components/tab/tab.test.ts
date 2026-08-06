import { it } from 'vitest';
import { describeA11y, expectNoViolations, getContainer } from '../../utils/test/a11y.js';

// Skip: Charm tabs has a cleanup bug that throws after test completion.
// TODO: Re-enable when Charm fixes handlePanelSlotChange error.
describeA11y.skip('zd-tab', () => {
  it('passes axe checks within tabs context', async () => {
    const tabs = document.createElement('zd-tabs');
    tabs.innerHTML = `
      <zd-tab slot="tab">Tab label</zd-tab>
      <zd-tab-panel>Panel content</zd-tab-panel>
    `;
    getContainer().appendChild(tabs);

    await expectNoViolations();
  });
});
