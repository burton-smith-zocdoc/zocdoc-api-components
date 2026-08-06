import CoreDivider from '@charm-ux/core/components/divider/divider.js';
import { project } from '@charm-ux/core';
import styles from './divider.styles.js';

/**
 * A horizontal or vertical rule separating content, with an optional inline label.
 *
 * @tag zd-divider
 */
export class ZdDivider extends CoreDivider {
  static override styles = [...super.styles, styles] as typeof CoreDivider.styles;
}

project.scope.registerComponent(ZdDivider);
