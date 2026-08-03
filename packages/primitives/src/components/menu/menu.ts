import CoreMenu from '@charm-ux/core/components/menu/menu.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdPopup } from '../popup/popup.js';
import styles from './menu.styles.js';

/**
 * Menu surface for a list of actions.
 *
 * @tag zd-menu
 * @summary A popup menu of actions anchored to a trigger.
 */
export class ZdMenu extends CoreMenu {
  static override styles = [...super.styles, styles] as typeof CoreMenu.styles;

  /**
   * Charm's CoreMenu declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdPopup];
  }
}

project.scope.registerComponent(ZdMenu);
