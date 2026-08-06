import CoreButton from '@charm-ux/core/components/button/button.js';
import { project } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import type { ZdControlSize } from '../control-size.js';
import styles from './button.styles.js';

/**
 * The visual treatments a Zocdoc button can take. Each one is backed by a
 * `button.<variant>` token group in the Zocdoc theme.
 */
export type ZdButtonVariant =
  | 'primary'
  | 'secondary'
  | 'inverse'
  | 'ghost'
  | 'destructive'
  | 'link';

/**
 * An interactive button, with a variant per visual treatment and two densities.
 *
 * @tag zd-button
 */
export class ZdButton extends CoreButton {
  static override styles = [...super.styles, styles] as typeof CoreButton.styles;

  /**
   * The button's visual treatment. Omit it to use the base `button.*` tokens,
   * which is what an unstyled Charm button renders.
   */
  @property({ reflect: true })
  public variant?: ZdButtonVariant = 'secondary';

  /**
   * The button's density. `small` swaps in the theme's `button.small.*` metrics;
   * `default` and an omitted value both use the base metrics.
   */
  @property({ reflect: true })
  public size?: ZdControlSize;

  /**
   * Stretch the button to the width of its container.
   *
   * Charm's button is `display: inline-block` with a full-width `.control`, so
   * this only has to widen the host.
   */
  @property({ type: Boolean, reflect: true })
  public fluid?: boolean;
}

project.scope.registerComponent(ZdButton);
