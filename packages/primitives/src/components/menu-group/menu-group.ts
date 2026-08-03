import CoreMenuGroup from '@charm-ux/core/components/menu-group/menu-group.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdMenuItem } from '../menu-item/menu-item.js';
import styles from './menu-group.styles.js';

/**
 * Labelled group of menu items.
 *
 * @tag zd-menu-group
 * @summary Groups related menu items under a heading.
 */
export class ZdMenuGroup extends CoreMenuGroup {
  static override styles = [...super.styles, styles] as typeof CoreMenuGroup.styles;

  /**
   * Charm's CoreMenuGroup declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdMenuItem];
  }
}

project.scope.registerComponent(ZdMenuGroup);
