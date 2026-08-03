import CorePushPane from '@charm-ux/core/components/push-pane/push-pane.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './push-pane.styles.js';

/**
 * Side pane that pushes page content aside.
 *
 * @tag zd-push-pane
 * @summary A dismissible pane anchored to an edge of the viewport.
 */
export class ZdPushPane extends CorePushPane {
  static override styles = [...super.styles, styles] as typeof CorePushPane.styles;

  /**
   * Charm's CorePushPane declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdPushPane);
