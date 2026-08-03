import CoreButtonGroupOverflow from '@charm-ux/core/components/button-group-overflow/button-group-overflow.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdButton } from '../button/button.js';
import { ZdIcon } from '../icon/icon.js';
import { ZdMenu } from '../menu/menu.js';
import { ZdMenuItem } from '../menu-item/menu-item.js';
import { ZdDivider } from '../divider/divider.js';
import styles from './button-group-overflow.styles.js';

/**
 * Button group that collapses buttons into a menu when space runs out.
 *
 * @tag zd-button-group-overflow
 * @summary A button group that moves overflowing buttons into a menu.
 */
export class ZdButtonGroupOverflow extends CoreButtonGroupOverflow {
  static override styles = [...super.styles, styles] as typeof CoreButtonGroupOverflow.styles;

  /**
   * Charm's CoreButtonGroupOverflow declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdButton, ZdIcon, ZdMenu, ZdMenuItem, ZdDivider];
  }
}

project.scope.registerComponent(ZdButtonGroupOverflow);
