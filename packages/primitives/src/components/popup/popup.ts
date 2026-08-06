import CorePopup from '@charm-ux/core/components/popup/popup.js';
import { project } from '@charm-ux/core';
import styles from './popup.styles.js';

/**
 * Low-level positioning primitive: places floating content relative to an anchor element.
 *
 * @tag zd-popup
 */
export class ZdPopup extends CorePopup {
  static override styles = [...super.styles, styles] as typeof CorePopup.styles;
}

project.scope.registerComponent(ZdPopup);
