import CoreRadioGroup from '@charm-ux/core/components/radio-group/radio-group.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './radio-group.styles.js';

/**
 * Radio group component for grouping radio buttons.
 *
 * @tag zd-radio-group
 * @summary Groups radio buttons for single-selection choices.
 */
export class ZdRadioGroup extends CoreRadioGroup {
  static override styles = [...super.styles, styles] as typeof CoreRadioGroup.styles;

  /**
   * Charm's CoreRadioGroup declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdRadioGroup);
