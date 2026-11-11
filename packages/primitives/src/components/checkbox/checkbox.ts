import CoreCheckbox from '@charm-ux/core/components/checkbox/checkbox.js';
import { project, type CharmElement } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import { ZdIcon } from '../icon/icon.js';
import type { ZdControlSize } from '../control-size.js';
import styles from './checkbox.styles.js';

/**
 * A labelled checkbox for boolean and multi-select choices, with indeterminate support.
 *
 * @tag zd-checkbox
 */
export class ZdCheckbox extends CoreCheckbox {
  static override styles = [...super.styles, styles] as typeof CoreCheckbox.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }

  /**
   * The control's density. `small` swaps in the theme's `checkbox.small.*`
   * metrics along with the smaller form-control label size.
   */
  @property({ reflect: true })
  public size?: ZdControlSize;

  /**
   * Charm's `validate()` hands `this.input` to `ElementInternals.setValidity()` as
   * the anchor, which throws before the first render creates it. Setting
   * `error-message` before then (in markup, or as a property) marks the control
   * as touched and validates on the first `willUpdate`, so the checkbox never
   * renders. Defer until the input exists, then validate once it does.
   */
  protected override validate(): void {
    if (this.input) super.validate();
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.validate();
  }
}

project.scope.registerComponent(ZdCheckbox);
