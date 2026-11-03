import CoreCheckboxGroup from '@charm-ux/core/components/checkbox-group/checkbox-group.js';
import { project } from '@charm-ux/core';
import styles from './checkbox-group.styles.js';

/**
 * Groups checkboxes for multiple-selection choices with a shared label, help text, and validation.
 *
 * @tag zd-checkbox-group
 */
export class ZdCheckboxGroup extends CoreCheckboxGroup {
  static override styles = [...super.styles, styles] as typeof CoreCheckboxGroup.styles;
}

project.scope.registerComponent(ZdCheckboxGroup);
