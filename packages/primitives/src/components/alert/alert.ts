import { CoreAlert } from '@charm-ux/core/components/alert/alert.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './alert.styles.js';

/**
 * Alert component for displaying feedback messages.
 *
 * @tag zd-alert
 * @summary Displays contextual feedback messages with variant styles.
 */
export class ZdAlert extends CoreAlert {
  static override styles = [...super.styles, styles] as typeof CoreAlert.styles;

  /**
   * Charm's CoreAlert declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdAlert);
