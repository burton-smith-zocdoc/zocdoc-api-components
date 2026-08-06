import CoreTabPanel from '@charm-ux/core/components/tab-panel/tab-panel.js';
import { project } from '@charm-ux/core';
import styles from './tab-panel.styles.js';

/**
 * The content region shown when its tab is selected.
 *
 * @tag zd-tab-panel
 */
export class ZdTabPanel extends CoreTabPanel {
  static override styles = [...super.styles, styles] as typeof CoreTabPanel.styles;
}

project.scope.registerComponent(ZdTabPanel);
