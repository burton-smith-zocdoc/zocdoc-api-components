import CoreInput from '@charm-ux/core/components/input/input.js';
import { project, type CharmElement } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import { ZdIcon } from '../icon/icon.js';
import type { ZdControlSize } from '../control-size.js';
import styles from './input.styles.js';

/**
 * A text input field with label and validation support.
 *
 * @tag zd-input
 */
export class ZdInput extends CoreInput {
  static override styles = [...super.styles, styles] as typeof CoreInput.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }

  /**
   * The control's density. `small` swaps in the theme's `formControl.small.*`
   * metrics.
   */
  @property({ reflect: true })
  public size?: ZdControlSize;
}

project.scope.registerComponent(ZdInput);
