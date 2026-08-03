import CoreAvatar from '@charm-ux/core/components/avatar/avatar.js';
import { project } from '@charm-ux/core';
import styles from './avatar.styles.js';

/**
 * Avatar component for displaying user or provider images.
 *
 * @tag zd-avatar
 * @summary Displays an image or initials representing a person.
 */
export class ZdAvatar extends CoreAvatar {
  static override styles = [...super.styles, styles] as typeof CoreAvatar.styles;
}

project.scope.registerComponent(ZdAvatar);
