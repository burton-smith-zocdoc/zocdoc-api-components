import CoreRadio from '@charm-ux/core/components/radio/radio.js';
import { project } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import type { ZdControlSize } from '../control-size.js';
import styles from './radio.styles.js';

/**
 * A single radio button option within a group.
 *
 * @tag zd-radio
 */
export class ZdRadio extends CoreRadio {
  static override styles = [...super.styles, styles] as typeof CoreRadio.styles;

  /**
   * The control's density. `small` swaps in the theme's `radio.small.*` metrics
   * along with the smaller form-control label size.
   */
  @property({ reflect: true })
  public size?: ZdControlSize;
}

project.scope.registerComponent(ZdRadio);
