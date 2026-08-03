import CoreSwitch from '@charm-ux/core/components/switch/switch.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './switch.styles.js';

/**
 * Switch for toggling a setting on or off.
 *
 * @tag zd-switch
 * @summary A labelled on/off toggle.
 */
export class ZdSwitch extends CoreSwitch {
  static override styles = [...super.styles, styles] as typeof CoreSwitch.styles;

  /**
   * Charm's CoreSwitch declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdSwitch);
