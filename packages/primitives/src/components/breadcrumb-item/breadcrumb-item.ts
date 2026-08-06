import CoreBreadcrumbItem from '@charm-ux/core/components/breadcrumb-item/breadcrumb-item.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './breadcrumb-item.styles.js';

/**
 * A single link in a breadcrumb trail.
 *
 * @tag zd-breadcrumb-item
 */
export class ZdBreadcrumbItem extends CoreBreadcrumbItem {
  static override styles = [...super.styles, styles] as typeof CoreBreadcrumbItem.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdBreadcrumbItem);
