import CoreAccordionItem from '@charm-ux/core/components/accordion-item/accordion-item.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './accordion-item.styles.js';

/**
 * A single collapsible section of an accordion.
 *
 * @tag zd-accordion-item
 * @summary A heading that expands to reveal its content.
 */
export class ZdAccordionItem extends CoreAccordionItem {
  static override styles = [...super.styles, styles] as typeof CoreAccordionItem.styles;

  /**
   * Charm's CoreAccordionItem declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdAccordionItem);
