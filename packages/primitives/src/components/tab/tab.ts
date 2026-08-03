import CoreTab from '@charm-ux/core/components/tab/tab.js';
import { project } from '@charm-ux/core';
import styles from './tab.styles.js';

/**
 * A single tab in a tab list.
 *
 * @tag zd-tab
 * @summary One selectable tab.
 */
export class ZdTab extends CoreTab {
  static override styles = [...super.styles, styles] as typeof CoreTab.styles;
}

project.scope.registerComponent(ZdTab);
