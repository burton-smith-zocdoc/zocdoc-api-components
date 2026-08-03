import CoreBreadcrumb from '@charm-ux/core/components/breadcrumb/breadcrumb.js';
import { project } from '@charm-ux/core';
import styles from './breadcrumb.styles.js';

/**
 * Breadcrumb trail showing the path to the current page.
 *
 * @tag zd-breadcrumb
 * @summary Shows the hierarchy leading to the current page.
 */
export class ZdBreadcrumb extends CoreBreadcrumb {
  static override styles = [...super.styles, styles] as typeof CoreBreadcrumb.styles;
}

project.scope.registerComponent(ZdBreadcrumb);
