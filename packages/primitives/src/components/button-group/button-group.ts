import CoreButtonGroup from '@charm-ux/core/components/button-group/button-group.js';
import { project } from '@charm-ux/core';
import styles from './button-group.styles.js';

/**
 * Groups related buttons together with connected styling.
 *
 * @tag zd-button-group
 */
export class ZdButtonGroup extends CoreButtonGroup {
  static override styles = [...super.styles, styles] as typeof CoreButtonGroup.styles;
}

project.scope.registerComponent(ZdButtonGroup);
