import CoreDatePicker from '@charm-ux/core/components/date-picker/date-picker.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdCalendar } from '../calendar/calendar.js';
import { ZdIcon } from '../icon/icon.js';
import { ZdPopup } from '../popup/popup.js';
import styles from './date-picker.styles.js';

/**
 * A segmented date field with a popup calendar for selecting a single date.
 *
 * @tag zd-date-picker
 */
export class ZdDatePicker extends CoreDatePicker {
  static override styles = [...super.styles, styles] as typeof CoreDatePicker.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCalendar, ZdIcon, ZdPopup];
  }
}

project.scope.registerComponent(ZdDatePicker);
