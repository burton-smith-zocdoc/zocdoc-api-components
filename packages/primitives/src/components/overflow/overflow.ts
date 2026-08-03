import CoreOverflow from '@charm-ux/core/components/overflow/overflow.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdButton } from '../button/button.js';
import { ZdIcon } from '../icon/icon.js';
import { ZdMenu } from '../menu/menu.js';
import { ZdMenuItem } from '../menu-item/menu-item.js';
import styles from './overflow.styles.js';

/**
 * Moves items that no longer fit into an overflow menu.
 *
 * @tag zd-overflow
 * @summary Collapses items that overflow into a menu.
 */
export class ZdOverflow extends CoreOverflow {
  static override styles = [...super.styles, styles] as typeof CoreOverflow.styles;

  /**
   * Charm's CoreOverflow declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ZdIcon, ZdMenu, ZdMenuItem];
  }
}

project.scope.registerComponent(ZdOverflow);
