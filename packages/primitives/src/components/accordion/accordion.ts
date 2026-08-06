import CoreAccordion from '@charm-ux/core/components/accordion/accordion.js';
import { project } from '@charm-ux/core';
import styles from './accordion.styles.js';

/**
 * Groups accordion items into a single collapsible region.
 *
 * @tag zd-accordion
 */
export class ZdAccordion extends CoreAccordion {
  static override styles = [...super.styles, styles] as typeof CoreAccordion.styles;
}

project.scope.registerComponent(ZdAccordion);
