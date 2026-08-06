import CoreOverflow from '@charm-ux/core/components/overflow/overflow.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdButton } from '../button/button.js';
import { ZdIcon } from '../icon/icon.js';
import { ZdMenu } from '../menu/menu.js';
import { ZdMenuItem } from '../menu-item/menu-item.js';
import styles from './overflow.styles.js';

/**
 * Collapses items that no longer fit into an overflow menu.
 *
 * @tag zd-overflow
 */
export class ZdOverflow extends CoreOverflow {
  static override styles = [...super.styles, styles] as typeof CoreOverflow.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ZdIcon, ZdMenu, ZdMenuItem];
  }
}

project.scope.registerComponent(ZdOverflow);
