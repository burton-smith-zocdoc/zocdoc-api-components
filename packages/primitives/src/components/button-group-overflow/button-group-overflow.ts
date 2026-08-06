import CoreButtonGroupOverflow from '@charm-ux/core/components/button-group-overflow/button-group-overflow.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdButton } from '../button/button.js';
import { ZdIcon } from '../icon/icon.js';
import { ZdMenu } from '../menu/menu.js';
import { ZdMenuItem } from '../menu-item/menu-item.js';
import { ZdDivider } from '../divider/divider.js';
import styles from './button-group-overflow.styles.js';

/**
 * A button group that moves buttons into a menu when space runs out.
 *
 * @tag zd-button-group-overflow
 */
export class ZdButtonGroupOverflow extends CoreButtonGroupOverflow {
  static override styles = [...super.styles, styles] as typeof CoreButtonGroupOverflow.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ZdIcon, ZdMenu, ZdMenuItem, ZdDivider];
  }
}

project.scope.registerComponent(ZdButtonGroupOverflow);
