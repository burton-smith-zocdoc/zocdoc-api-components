import CoreCombobox from '@charm-ux/core/components/combobox/combobox.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import { ZdOption } from '../option/option.js';
import { ZdOptionGroup } from '../option-group/option-group.js';
import { ZdPopup } from '../popup/popup.js';
import { ZdSpinner } from '../spinner/spinner.js';
import styles from './combobox.styles.js';

/**
 * A text input paired with a listbox for filtering and selecting from a set of options.
 *
 * @tag zd-combobox
 */
export class ZdCombobox extends CoreCombobox {
  static override styles = [...super.styles, styles] as typeof CoreCombobox.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon, ZdOption, ZdOptionGroup, ZdPopup, ZdSpinner];
  }
}

project.scope.registerComponent(ZdCombobox);
