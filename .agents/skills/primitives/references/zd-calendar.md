# zd-calendar

A calendar grid for selecting a date, a date range, or multiple separate dates.

**Class** `ZdCalendar` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-calendar></zd-calendar>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `unknown` | — | — | `CharmElement` |
| `disabled` | `disabled` | `boolean` | `false` | Prevents date selection and calendar navigation. | `CoreCalendar` |
| `disabled-dates` | `disabledDates` | `string` | `''` | A comma- or whitespace-separated list of unavailable dates in `YYYY-MM-DD` format. | `CoreCalendar` |
| `disabled-week-days` | `disabledWeekDays` | `string` | `''` | A comma- or whitespace-separated list of unavailable weekdays, from 0 (Sunday) to 6 (Saturday). | `CoreCalendar` |
| `first-day-of-week` | `firstDayOfWeek` | `number` | — | The first weekday, from 0 (Sunday) to 6 (Saturday). Defaults to the locale's first weekday. | `CoreCalendar` |
| `focus-date` | `focusDate` | `string` | — | The date initially focused when the calendar has no selected value. | `CoreCalendar` |
| `max` | `max` | `string` | — | The latest selectable date, in `YYYY-MM-DD` format. | `CoreCalendar` |
| `max-range` | `maxRange` | `number` | `0` | The maximum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. | `CoreCalendar` |
| `min` | `min` | `string` | — | The earliest selectable date, in `YYYY-MM-DD` format. | `CoreCalendar` |
| `min-range` | `minRange` | `number` | `0` | The minimum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. | `CoreCalendar` |
| `readonly` | `readOnly` | `boolean` | `false` | Prevents date selection while allowing navigation. | `CoreCalendar` |
| `selection-mode` | `selectionMode` | `CalendarSelectionMode` | `'single'` | Whether the calendar selects one date, a continuous range, or separate dates. | `CoreCalendar` |
| `value` | `value` | `CalendarValue` | — | The selected date (`YYYY-MM-DD`) or date list. Range values contain the start and end dates. | `CoreCalendar` |
| `weekday-format` | `weekdayFormat` | `'narrow' \| 'short' \| 'long'` | `'short'` | The visible format for weekday headings. | `CoreCalendar` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `Event` | Emitted when a selection is committed. In range mode, this fires after the second date is selected. | `CoreCalendar` |
| `input` | `Event` | Emitted when a selection changes during interaction. | `CoreCalendar` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `day-YYYY-MM-DD` | Optional content rendered inside a matching date cell. | `CoreCalendar` |
| `month-label` | Translated label for the month selector. | `CoreCalendar` |
| `next-month-label` | Translated accessible name for the next-month button. | `CoreCalendar` |
| `previous-month-label` | Translated accessible name for the previous-month button. | `CoreCalendar` |
| `year-label` | Translated label for the year field. | `CoreCalendar` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `focus(options?: FocusOptions): void` | Focuses the currently active date in the grid. | `CoreCalendar` |
| `goToDate(value: string \| Date): void` | Moves the visible calendar and keyboard focus to a date without selecting it. Date arguments use their local calendar day. | `CoreCalendar` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `calendar-base` | The calendar wrapper. | `CoreCalendar` |
| `day` | A date button. | `CoreCalendar` |
| `day-disabled` | A disabled date. | `CoreCalendar` |
| `day-range-inner` | A date inside a selected range. | `CoreCalendar` |
| `day-selected` | A selected date or range endpoint. | `CoreCalendar` |
| `day-today` | Today's date. | `CoreCalendar` |
| `grid` | The date grid. | `CoreCalendar` |
| `header` | The month/year controls and navigation buttons. | `CoreCalendar` |
| `month-select` | The month selector. | `CoreCalendar` |
| `next` | The next-month button. | `CoreCalendar` |
| `previous` | The previous-month button. | `CoreCalendar` |
| `weekday` | A weekday heading. | `CoreCalendar` |
| `year-input` | The year input. | `CoreCalendar` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-calendar-day-active-bg-color` | — | — | The background color of pressed, unselected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-active-fg-color` | — | — | The text color of pressed, unselected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-border-radius` | — | — | The day button border radius. | `CoreCalendar` |
| `--zd-charm-calendar-day-disabled-bg-color` | — | — | The background color of unavailable day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-disabled-cursor` | — | — | The cursor for unavailable day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-disabled-fg-color` | — | — | The text color for unavailable day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-fg-color` | — | — | The default text color for day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-font-size` | — | — | The day button font size. | `CoreCalendar` |
| `--zd-charm-calendar-day-hover-bg-color` | — | — | The background color of hovered, unselected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-hover-fg-color` | — | — | The text color of hovered, unselected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-range-bg-color` | — | — | The background color of day buttons inside a selected range. | `CoreCalendar` |
| `--zd-charm-calendar-day-range-fg-color` | — | — | The text color of day buttons inside a selected range. | `CoreCalendar` |
| `--zd-charm-calendar-day-row-size` | — | — | The block size of a calendar week row. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-active-bg-color` | — | — | The background color of pressed selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-active-border-color` | — | — | The border color of pressed selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-active-fg-color` | — | — | The text color of pressed selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-bg-color` | — | — | The background color of selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-border-color` | — | — | The border color of selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-fg-color` | — | — | The text color of selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-hover-bg-color` | — | — | The background color of hovered selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-hover-border-color` | — | — | The border color of hovered selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-selected-hover-fg-color` | — | — | The text color of hovered selected day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-size` | — | — | The inline and block size of day buttons. | `CoreCalendar` |
| `--zd-charm-calendar-day-today-border-color` | — | — | The border color for today's day button. | `CoreCalendar` |
| `--zd-charm-calendar-heading-disabled-bg-color` | — | — | The disabled background color for month/year inputs. | `CoreCalendar` |
| `--zd-charm-calendar-heading-disabled-cursor` | — | — | The disabled cursor for month/year inputs. | `CoreCalendar` |
| `--zd-charm-calendar-heading-disabled-fg-color` | — | — | The disabled text color for month/year inputs. | `CoreCalendar` |
| `--zd-charm-calendar-heading-fg-color` | — | — | The text color for the month/year controls. | `CoreCalendar` |
| `--zd-charm-calendar-heading-font-size` | — | — | The month/year heading font size. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-active-bg-color` | — | — | The active background color for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-active-fg-color` | — | — | The active text color for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-border-radius` | — | — | The border radius of previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-disabled-bg-color` | — | — | The disabled background color for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-disabled-cursor` | — | — | The disabled cursor for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-disabled-fg-color` | — | — | The disabled text color for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-fg-color` | — | — | The text color for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-font-size` | — | — | The month navigation button font size. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-hover-bg-color` | — | — | The hover background color for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-heading-navigation-hover-fg-color` | — | — | The hover text color for previous/next month buttons. | `CoreCalendar` |
| `--zd-charm-calendar-weekday-fg-color` | — | — | The text color for weekday headings. | `CoreCalendar` |
| `--zd-charm-calendar-weekday-font-size` | — | — | The weekday heading font size. | `CoreCalendar` |
