import CoreAvatar from '@charm-ux/core/components/avatar/avatar.js';
import { project } from '@charm-ux/core';
import styles from './avatar.styles.js';

/**
 * Displays an image or initials representing a person.
 *
 * @tag zd-avatar
 */
export class ZdAvatar extends CoreAvatar {
  static override styles = [...super.styles, styles] as typeof CoreAvatar.styles;
}

project.scope.registerComponent(ZdAvatar);
