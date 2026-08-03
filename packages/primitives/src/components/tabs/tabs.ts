import CoreTabs from '@charm-ux/core/components/tabs/tabs.js';
import { project } from '@charm-ux/core';
import styles from './tabs.styles.js';

/**
 * Tab container coordinating tabs and their panels.
 *
 * @tag zd-tabs
 * @summary Coordinates a tab list and its panels.
 */
export class ZdTabs extends CoreTabs {
  static override styles = [...super.styles, styles] as typeof CoreTabs.styles;
}

project.scope.registerComponent(ZdTabs);
