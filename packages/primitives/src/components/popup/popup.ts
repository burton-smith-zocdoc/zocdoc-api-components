import CorePopup from '@charm-ux/core/components/popup/popup.js';
import { project } from '@charm-ux/core';
import styles from './popup.styles.js';

/**
 * Low-level positioning primitive for floating content.
 *
 * @tag zd-popup
 * @summary Positions content relative to an anchor element.
 */
export class ZdPopup extends CorePopup {
  static override styles = [...super.styles, styles] as typeof CorePopup.styles;
}

project.scope.registerComponent(ZdPopup);
