import CoreSpinner from '@charm-ux/core/components/spinner/spinner.js';
import { project } from '@charm-ux/core';
import styles from './spinner.styles.js';

/**
 * An animated loading indicator.
 *
 * @tag zd-spinner
 */
export class ZdSpinner extends CoreSpinner {
  static override styles = [...super.styles, styles] as typeof CoreSpinner.styles;
}

project.scope.registerComponent(ZdSpinner);
