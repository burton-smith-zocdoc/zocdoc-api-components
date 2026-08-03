import CoreTooltip from '@charm-ux/core/components/tooltip/tooltip.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdPopup } from '../popup/popup.js';
import styles from './tooltip.styles.js';

/**
 * Tooltip describing or labelling its anchor.
 *
 * @tag zd-tooltip
 * @summary Shows supplementary text on hover and focus.
 */
export class ZdTooltip extends CoreTooltip {
  static override styles = [...super.styles, styles] as typeof CoreTooltip.styles;

  /**
   * Charm's CoreTooltip declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdPopup];
  }
}

project.scope.registerComponent(ZdTooltip);
