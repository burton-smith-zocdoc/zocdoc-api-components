import CoreRadioGroup from '@charm-ux/core/components/radio-group/radio-group.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './radio-group.styles.js';

/**
 * Groups radio buttons for single-selection choices.
 *
 * @tag zd-radio-group
 */
export class ZdRadioGroup extends CoreRadioGroup {
  static override styles = [...super.styles, styles] as typeof CoreRadioGroup.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdRadioGroup);
