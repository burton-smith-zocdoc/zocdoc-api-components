import CoreDisclosure from '@charm-ux/core/components/disclosure/disclosure.js';
import { project } from '@charm-ux/core';
import styles from './disclosure.styles.js';

/**
 * Toggles a region of content from a slotted trigger.
 *
 * @tag zd-disclosure
 */
export class ZdDisclosure extends CoreDisclosure {
  static override styles = [...super.styles, styles] as typeof CoreDisclosure.styles;
}

project.scope.registerComponent(ZdDisclosure);
