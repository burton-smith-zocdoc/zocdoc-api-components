import CoreCard from '@charm-ux/core/components/card/card.js';
import { project } from '@charm-ux/core';
import { html } from 'lit/static-html.js';
import styles from './card.styles.js';

/**
 * A container for grouping related content.
 *
 * @tag zd-card
 */
export class ZdCard extends CoreCard {
  static override styles = [...super.styles, styles] as typeof CoreCard.styles;

  protected override headerTemplate() {
    const hasHeading = this.hasSlotController.hasNamedSlot('heading') || !!this.heading;
    const hasSubheading = this.hasSlotController.hasNamedSlot('subheading') || !!this.subheading;

    return html`
      <header class="header" part="card-header" ?hidden=${!hasHeading && !hasSubheading}>
        <h3 part="card-heading" ?hidden=${!hasHeading}>
          <slot name="heading">${this.heading}</slot>
        </h3>
        <h4 part="card-subheading" ?hidden=${!hasSubheading}>
          <slot name="subheading">${this.subheading}</slot>
        </h4>
      </header>
    `;
  }
}

project.scope.registerComponent(ZdCard);
