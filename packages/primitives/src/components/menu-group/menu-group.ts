import CoreMenuGroup from '@charm-ux/core/components/menu-group/menu-group.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdMenuItem } from '../menu-item/menu-item.js';
import styles from './menu-group.styles.js';

/**
 * Groups related menu items under a heading.
 *
 * @tag zd-menu-group
 */
export class ZdMenuGroup extends CoreMenuGroup {
  static override styles = [...super.styles, styles] as typeof CoreMenuGroup.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdMenuItem];
  }
}

project.scope.registerComponent(ZdMenuGroup);
