import CoreDialog from '@charm-ux/core/components/dialog/dialog.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './dialog.styles.js';

/**
 * Modal dialog for focused tasks and confirmations.
 *
 * @tag zd-dialog
 * @summary A modal dialog with heading, body, and footer slots.
 */
export class ZdDialog extends CoreDialog {
  static override styles = [...super.styles, styles] as typeof CoreDialog.styles;

  /**
   * Charm's CoreDialog declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdDialog);
