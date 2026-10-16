import CoreAccordionItem from '@charm-ux/core/components/accordion-item/accordion-item.js';
import { project, type CharmElement } from '@charm-ux/core';
import { property } from 'lit/decorators.js';
import { ZdIcon } from '../icon/icon.js';
import styles from './accordion-item.styles.js';

/**
 * A single collapsible section of an accordion: a heading that expands to reveal its content.
 *
 * @tag zd-accordion-item
 */
export class ZdAccordionItem extends CoreAccordionItem {
  static override styles = [...super.styles, styles] as typeof CoreAccordionItem.styles;

  /**
   * Where the expand chevron sits. Charm defaults to the start of the row;
   * Zinc's accordion trails it after the heading.
   */
  @property({ reflect: true, attribute: 'expand-icon-position' })
  public override expandIconPosition?: 'start' | 'end' = 'end';

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdAccordionItem);
