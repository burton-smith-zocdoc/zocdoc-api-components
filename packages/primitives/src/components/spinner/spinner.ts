import CoreSpinner from '@charm-ux/core/components/spinner/spinner.js';
import { project } from '@charm-ux/core';
import styles from './spinner.styles.js';

/**
 * Spinner component for loading states.
 *
 * @tag zd-spinner
 * @summary Animated loading indicator.
 */
export class ZdSpinner extends CoreSpinner {
  static override styles = [...super.styles, styles] as typeof CoreSpinner.styles;
}

project.scope.registerComponent(ZdSpinner);
