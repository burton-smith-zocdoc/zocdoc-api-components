import CoreScopedStyles from '@charm-ux/core/components/scoped-styles/scoped-styles.js';
import { project } from '@charm-ux/core';
import styles from './scoped-styles.styles.js';

/**
 * Scopes a stylesheet to its subtree.
 *
 * @tag zd-scoped-styles
 * @summary Applies slotted stylesheets only to its own content.
 */
export class ZdScopedStyles extends CoreScopedStyles {
  static override styles = [...super.styles, styles] as typeof CoreScopedStyles.styles;
}

project.scope.registerComponent(ZdScopedStyles);
