import CoreTabPanel from '@charm-ux/core/components/tab-panel/tab-panel.js';
import { project } from '@charm-ux/core';
import styles from './tab-panel.styles.js';

/**
 * Content region belonging to a tab.
 *
 * @tag zd-tab-panel
 * @summary The panel shown when its tab is selected.
 */
export class ZdTabPanel extends CoreTabPanel {
  static override styles = [...super.styles, styles] as typeof CoreTabPanel.styles;
}

project.scope.registerComponent(ZdTabPanel);
