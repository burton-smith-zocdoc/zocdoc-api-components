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

  /**
   * Charm reflects `value` to an attribute, which would put whatever a patient types into the
   * page's markup (PHI-001). Redeclared without `reflect`: a `value` attribute in the markup is
   * still read in, but typing never writes one back out.
   */
  @property()
  public override get value(): string {
    return super.value;
  }

  public override set value(value: string) {
    super.value = value;
  }
}

project.scope.registerComponent(ZdInput);
