import CoreDivider from '@charm-ux/core/components/divider/divider.js';
import { project } from '@charm-ux/core';
import styles from './divider.styles.js';

/**
 * Horizontal or vertical rule separating content.
 *
 * @tag zd-divider
 * @summary Separates content with an optional inline label.
 */
export class ZdDivider extends CoreDivider {
  static override styles = [...super.styles, styles] as typeof CoreDivider.styles;
}

project.scope.registerComponent(ZdDivider);
