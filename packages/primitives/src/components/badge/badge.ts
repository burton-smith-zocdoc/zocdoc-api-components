import CoreBadge from '@charm-ux/core/components/badge/badge.js';
import { project } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import styles from './badge.styles.js';

/**
 * The visual treatments a Zocdoc badge can take. Each one is backed by a
 * `badge.<variant>` token group in the Zocdoc theme.
 */
export type ZdBadgeVariant =
  | 'neutral'
  | 'inverse'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'caution'
  | 'brand';

/**
 * Badge component for labels and status indicators.
 *
 * @tag zd-badge
 * @summary Displays a small label or status indicator.
 */
export class ZdBadge extends CoreBadge {
  static override styles = [...super.styles, styles] as typeof CoreBadge.styles;

  /**
   * The badge's visual treatment. Omit it to use the base `badge.*` tokens.
   *
   * Note that a variant is styling only - it carries no meaning for assistive
   * technology, so the badge's text has to say what the state is (A11Y-001).
   */
  @property({ reflect: true })
  public variant?: ZdBadgeVariant;
}

project.scope.registerComponent(ZdBadge);
