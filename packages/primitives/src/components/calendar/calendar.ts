import CoreCalendar from '@charm-ux/core/components/calendar/calendar.js';
import { project, type CharmElement } from '@charm-ux/core';
import { ZdIcon } from '../icon/icon.js';
import styles from './calendar.styles.js';

/**
 * A calendar grid for selecting a date, a date range, or multiple separate dates.
 *
 * @tag zd-calendar
 */
export class ZdCalendar extends CoreCalendar {
  static override styles = [...super.styles, styles] as typeof CoreCalendar.styles;

  /** Mirrors Charm's own dependencies(), swapping each Core* for its Zd* subclass (PBZD-001). */
  public static override get dependencies(): (typeof CharmElement)[] {
    return [ZdIcon];
  }
}

project.scope.registerComponent(ZdCalendar);
