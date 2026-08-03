import CoreCard from '@charm-ux/core/components/card/card.js';
import { project } from '@charm-ux/core';
import styles from './card.styles.js';

/**
 * Card component for content containers.
 *
 * @tag zd-card
 * @summary A container for grouping related content with optional interactivity.
 */
export class ZdCard extends CoreCard {
  static override styles = [...super.styles, styles] as typeof CoreCard.styles;
}

project.scope.registerComponent(ZdCard);
