import CoreOptionGroup from '@charm-ux/core/components/option-group/option-group.js';
import { project } from '@charm-ux/core';
import styles from './option-group.styles.js';

/**
 * Labels and groups related options within a combobox.
 *
 * @tag zd-option-group
 */
export class ZdOptionGroup extends CoreOptionGroup {
  static override styles = [...super.styles, styles] as typeof CoreOptionGroup.styles;
}

project.scope.registerComponent(ZdOptionGroup);
