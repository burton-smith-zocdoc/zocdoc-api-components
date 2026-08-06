import CoreDialog from '@charm-ux/core/components/dialog/dialog.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './dialog.styles.js';

/**
 * A modal dialog for focused tasks and confirmations, with heading, body, and footer slots.
 *
 * @tag zd-dialog
 */
export class ZdDialog extends CoreDialog {
  static override styles = [...super.styles, styles] as typeof CoreDialog.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdDialog);
