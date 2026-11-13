import CoreDateRangePicker from '@charm-ux/core/components/date-range-picker/date-range-picker.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdCalendar } from '../calendar/calendar.js';
import { ZdIcon } from '../icon/icon.js';
import { ZdPopup } from '../popup/popup.js';
import styles from './date-range-picker.styles.js';

/**
 * A segmented date field with a popup calendar for selecting a start and end date.
 *
 * @tag zd-date-range-picker
 */
export class ZdDateRangePicker extends CoreDateRangePicker {
  static override styles = [...super.styles, styles] as typeof CoreDateRangePicker.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdCalendar, ZdIcon, ZdPopup];
  }
}

project.scope.registerComponent(ZdDateRangePicker);
