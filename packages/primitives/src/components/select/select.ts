import CoreSelect from '@charm-ux/core/components/select/select.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './select.styles.js';

/**
 * Select component for dropdown selection.
 *
 * Note that unlike the other form controls this has no `size` prop for density.
 * Charm's select already declares `size?: number` for the native `<select size>`
 * attribute (how many options to show at once), so the name is taken. Consumers
 * that need the compact treatment can set `--zd-form-control-input-height` and
 * `--zd-form-control-padding-y` directly.
 *
 * @tag zd-select
 * @summary Dropdown select field for choosing from options.
 */
export class ZdSelect extends CoreSelect {
  static override styles = [...super.styles, styles] as typeof CoreSelect.styles;

  /**
   * Charm's CoreSelect declares its children as Charm classes. `registerComponent()`
   * keeps the first registration for a tag name, so without this override a deep
   * import of this module would register the Charm children as `zd-*` and the
   * Zocdoc subclasses would never be used (PBZD-001).
   */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdSelect);
