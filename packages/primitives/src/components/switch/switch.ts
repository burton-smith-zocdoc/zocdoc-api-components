import CoreSwitch from '@charm-ux/core/components/switch/switch.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './switch.styles.js';

/**
 * A labelled on/off toggle for a single setting.
 *
 * @tag zd-switch
 */
export class ZdSwitch extends CoreSwitch {
  static override styles = [...super.styles, styles] as typeof CoreSwitch.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdSwitch);
