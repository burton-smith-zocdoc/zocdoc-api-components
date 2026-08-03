import CoreAccordion from '@charm-ux/core/components/accordion/accordion.js';
import { project } from '@charm-ux/core';
import styles from './accordion.styles.js';

/**
 * Accordion container for grouping collapsible sections.
 *
 * @tag zd-accordion
 * @summary Groups accordion items into a single collapsible region.
 */
export class ZdAccordion extends CoreAccordion {
  static override styles = [...super.styles, styles] as typeof CoreAccordion.styles;
}

project.scope.registerComponent(ZdAccordion);
