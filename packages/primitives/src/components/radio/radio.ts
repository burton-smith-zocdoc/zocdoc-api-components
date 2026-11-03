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

  /**
   * Charm reports disabled only through ElementInternals, which axe cannot see,
   * so it holds the greyed label to full contrast. Mirroring it onto the host
   * attribute matches what checkbox already does and restores the WCAG
   * exemption for disabled controls.
   */
  protected override handleDisabledChange(): void {
    super.handleDisabledChange();
    this.syncAriaDisabled();
  }

  protected override setInitialAttributes(): void {
    super.setInitialAttributes();
    this.syncAriaDisabled();
  }

  private syncAriaDisabled(): void {
    if (this.effectivelyDisabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
  }
}

project.scope.registerComponent(ZdRadio);
