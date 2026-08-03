import CoreMenuItem from '@charm-ux/core/components/menu-item/menu-item.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import { ZdMenu } from '../menu/menu.js';
import { ZdPopup } from '../popup/popup.js';
import styles from './menu-item.styles.js';

/**
 * A single action inside a menu.
 *
 * @tag zd-menu-item
 * @summary One selectable action in a menu.
 */
export class ZdMenuItem extends CoreMenuItem {
  static override styles = [...super.styles, styles] as typeof CoreMenuItem.styles;

  /**
   * Charm's CoreMenuItem declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon, ZdMenu, ZdPopup];
  }
}

project.scope.registerComponent(ZdMenuItem);
