import CoreOption from '@charm-ux/core/components/option/option.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './option.styles.js';

/**
 * A single choice within a combobox or option group.
 *
 * @tag zd-option
 */
export class ZdOption extends CoreOption {
  static override styles = [...super.styles, styles] as typeof CoreOption.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdOption);
