import CoreTextArea from '@charm-ux/core/components/text-area/text-area.js';
import { project, type CharmElement } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import { ZdIcon } from '../icon/icon.js';
import type { ZdControlSize } from '../control-size.js';
import styles from './text-area.styles.js';

/**
 * A multi-line text field with label and validation support.
 *
 * @tag zd-text-area
 */
export class ZdTextArea extends CoreTextArea {
  static override styles = [...super.styles, styles] as typeof CoreTextArea.styles;

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
   * Number of visible rows. Charm defaults to 4; Zocdoc's text area is 6 rows.
   */
  @property({ reflect: true, type: Number })
  public override rows: number = 6;

  /**
   * How the control can be resized. Charm leaves this unset (the browser default
   * is `both`); Zocdoc's text area only grows vertically so it can't be dragged
   * out of a form's column.
   */
  @property({ reflect: true })
  public override resize?: 'none' | 'horizontal' | 'vertical' | 'both' = 'vertical';
}

project.scope.registerComponent(ZdTextArea);
