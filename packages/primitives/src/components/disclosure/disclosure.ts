import CoreDisclosure from '@charm-ux/core/components/disclosure/disclosure.js';
import { project } from '@charm-ux/core';
import styles from './disclosure.styles.js';

/**
 * Show/hide region driven by its own trigger.
 *
 * @tag zd-disclosure
 * @summary Toggles a region of content from a slotted trigger.
 */
export class ZdDisclosure extends CoreDisclosure {
  static override styles = [...super.styles, styles] as typeof CoreDisclosure.styles;
}

project.scope.registerComponent(ZdDisclosure);
