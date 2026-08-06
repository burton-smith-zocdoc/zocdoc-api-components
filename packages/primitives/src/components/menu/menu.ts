import CoreMenu from '@charm-ux/core/components/menu/menu.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdPopup } from '../popup/popup.js';
import styles from './menu.styles.js';

/**
 * A popup menu of actions anchored to a trigger.
 *
 * @tag zd-menu
 */
export class ZdMenu extends CoreMenu {
  static override styles = [...super.styles, styles] as typeof CoreMenu.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdPopup];
  }
}

project.scope.registerComponent(ZdMenu);
