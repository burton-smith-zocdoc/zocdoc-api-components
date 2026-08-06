import CoreScopedStyles from '@charm-ux/core/components/scoped-styles/scoped-styles.js';
import { project } from '@charm-ux/core';
import styles from './scoped-styles.styles.js';

/**
 * Applies slotted stylesheets only to its own subtree.
 *
 * @tag zd-scoped-styles
 */
export class ZdScopedStyles extends CoreScopedStyles {
  static override styles = [...super.styles, styles] as typeof CoreScopedStyles.styles;
}

project.scope.registerComponent(ZdScopedStyles);
