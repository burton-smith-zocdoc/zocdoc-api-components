import CoreIcon from '@charm-ux/core/components/icon/icon.js';
import { project } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import styles from './icon.styles.js';

/**
 * The icon sizes the Zocdoc design system defines. Unlike the form controls,
 * icons get three steps rather than two.
 */
export type ZdIconSize = 'small' | 'default' | 'large';

/**
 * Renders an icon from the configured icon set.
 *
 * @tag zd-icon
 * @summary Displays a named icon at a token-driven size.
 */
export class ZdIcon extends CoreIcon {
  static override styles = [...super.styles, styles] as typeof CoreIcon.styles;

  /**
   * The icon's rendered size.
   *
   * Charm's icon is `1em` square, so it scales with whatever text it sits in.
   * That's the right default inside a button or a label, so omitting `size`
   * keeps it. Setting `size` pins the icon to a token instead, for the cases
   * where it stands on its own.
   */
  @property({ reflect: true })
  public size?: ZdIconSize;
}

project.scope.registerComponent(ZdIcon);
