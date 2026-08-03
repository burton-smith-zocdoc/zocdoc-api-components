import CoreBreadcrumbItem from '@charm-ux/core/components/breadcrumb-item/breadcrumb-item.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './breadcrumb-item.styles.js';

/**
 * A single link in a breadcrumb trail.
 *
 * @tag zd-breadcrumb-item
 * @summary One step in a breadcrumb trail.
 */
export class ZdBreadcrumbItem extends CoreBreadcrumbItem {
  static override styles = [...super.styles, styles] as typeof CoreBreadcrumbItem.styles;

  /**
   * Charm's CoreBreadcrumbItem declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdBreadcrumbItem);
