import CoreMenuItem from '@charm-ux/core/components/menu-item/menu-item.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import { ZdMenu } from '../menu/menu.js';
import { ZdPopup } from '../popup/popup.js';
import styles from './menu-item.styles.js';

/**
 * A single selectable action inside a menu.
 *
 * @tag zd-menu-item
 */
export class ZdMenuItem extends CoreMenuItem {
  static override styles = [...super.styles, styles] as typeof CoreMenuItem.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon, ZdMenu, ZdPopup];
  }
}

project.scope.registerComponent(ZdMenuItem);
