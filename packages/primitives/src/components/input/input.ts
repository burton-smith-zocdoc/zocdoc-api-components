import CoreInput from '@charm-ux/core/components/input/input.js';
import { project, type CharmElement } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import { ZdIcon } from '../icon/icon.js';
import type { ZdControlSize } from '../control-size.js';
import styles from './input.styles.js';

/**
 * Input component for text entry.
 *
 * @tag zd-input
 * @summary Text input field with label and validation support.
 */
export class ZdInput extends CoreInput {
  static override styles = [...super.styles, styles] as typeof CoreInput.styles;

  /**
   * Charm's CoreInput declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
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
