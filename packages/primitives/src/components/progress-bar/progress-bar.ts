import CoreProgressBar from '@charm-ux/core/components/progress-bar/progress-bar.js';
import { project } from '@charm-ux/core';
import styles from './progress-bar.styles.js';

/**
 * Shows determinate or indeterminate progress, for multi-step flows and uploads.
 *
 * @tag zd-progress-bar
 */
export class ZdProgressBar extends CoreProgressBar {
  static override styles = [...super.styles, styles] as typeof CoreProgressBar.styles;
}

project.scope.registerComponent(ZdProgressBar);
