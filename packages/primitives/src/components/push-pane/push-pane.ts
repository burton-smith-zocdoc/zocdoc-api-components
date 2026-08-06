import CorePushPane from '@charm-ux/core/components/push-pane/push-pane.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './push-pane.styles.js';

/**
 * A dismissible pane anchored to an edge of the viewport, which pushes page content aside.
 *
 * @tag zd-push-pane
 */
export class ZdPushPane extends CorePushPane {
  static override styles = [...super.styles, styles] as typeof CorePushPane.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdPushPane);
