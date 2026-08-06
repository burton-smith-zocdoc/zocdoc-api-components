import CoreTooltip from '@charm-ux/core/components/tooltip/tooltip.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdPopup } from '../popup/popup.js';
import styles from './tooltip.styles.js';

/**
 * Describes or labels its anchor, showing supplementary text on hover and focus.
 *
 * @tag zd-tooltip
 */
export class ZdTooltip extends CoreTooltip {
  static override styles = [...super.styles, styles] as typeof CoreTooltip.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdPopup];
  }
}

project.scope.registerComponent(ZdTooltip);
