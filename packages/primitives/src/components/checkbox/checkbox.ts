import CoreCheckbox from '@charm-ux/core/components/checkbox/checkbox.js';
import { project, type CharmElement } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import { ZdIcon } from '../icon/icon.js';
import type { ZdControlSize } from '../control-size.js';
import styles from './checkbox.styles.js';

/**
 * Checkbox for boolean and multi-select choices.
 *
 * @tag zd-checkbox
 * @summary A labelled checkbox with indeterminate support.
 */
export class ZdCheckbox extends CoreCheckbox {
  static override styles = [...super.styles, styles] as typeof CoreCheckbox.styles;

  /**
   * Charm's CoreCheckbox declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }

  /**
   * The control's density. `small` swaps in the theme's `checkbox.small.*`
   * metrics along with the smaller form-control label size.
   */
  @property({ reflect: true })
  public size?: ZdControlSize;
}

project.scope.registerComponent(ZdCheckbox);
