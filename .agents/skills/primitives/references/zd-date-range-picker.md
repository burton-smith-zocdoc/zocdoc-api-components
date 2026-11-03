# zd-date-range-picker

A segmented date field with a popup calendar for selecting a start and end date.

**Class** `ZdDateRangePicker` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-date-range-picker></zd-date-range-picker>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `unknown` | — | — | `CharmElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CharmFormControlElement` |
| `disabled-dates` | `disabledDates` | `string` | `''` | A comma- or whitespace-separated list of unavailable ISO dates. | `CoreDateRangePicker` |
| `disabled-week-days` | `disabledWeekDays` | `string` | `''` | A comma- or whitespace-separated list of unavailable weekdays (0 Sunday through 6 Saturday). | `CoreDateRangePicker` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CharmFormControlElement` |
| `first-day-of-week` | `firstDayOfWeek` | `number` | — | The locale-first weekday override (0 Sunday through 6 Saturday). | `CoreDateRangePicker` |
| `fixed-placement` | `fixedPlacement` | `boolean` | `false` | Enables fixed positioning for the popup calendar. | `CoreDateRangePicker` |
| `focus-date` | `focusDate` | `string` | — | The date initially focused when no range value is set. | `CoreDateRangePicker` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CharmFormControlElement` |
| `max` | `max` | `string` | — | The latest selectable date, in `YYYY-MM-DD` format. | `CoreDateRangePicker` |
| `max-range` | `maxRange` | `number` | `0` | The maximum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. | `CoreDateRangePicker` |
| `min` | `min` | `string` | — | The earliest selectable date, in `YYYY-MM-DD` format. | `CoreDateRangePicker` |
| `min-range` | `minRange` | `number` | `0` | The minimum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. | `CoreDateRangePicker` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CharmFormControlElement` |
| `open` | `open` | `boolean` | `false` | Whether the popup calendar is open. | `CoreDateRangePicker` |
| `placement` | `placement` | `PopupPlacement` | `'bottom-start'` | Preferred popup placement relative to the segmented input. | `CoreDateRangePicker` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| `weekday-format` | `weekdayFormat` | `'narrow' \| 'short' \| 'long'` | `'short'` | The visible format for calendar weekday headings. | `CoreDateRangePicker` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `unknown` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `Event` | Emitted when a value change is committed. | `CharmFormControlElement` |
| `date-range-picker-today` | `Event` | Emitted when the Today action sets the range. | `CoreDateRangePicker` |
| `input` | `Event` | Emitted when the value changes during user interaction. | `CharmFormControlElement` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `clear-label` | Label for the clear button in the popup footer. | `CoreDateRangePicker` |
| `day-placeholder` | Translated day segment placeholder. | `CoreDateRangePicker` |
| `end` | Content rendered at the end of the segmented input. | `CoreDateRangePicker` |
| `end-day-label` | Accessible name for the end day segment. | `CoreDateRangePicker` |
| `end-label` | Accessible name for the end date segments. | `CoreDateRangePicker` |
| `end-month-label` | Accessible name for the end month segment. | `CoreDateRangePicker` |
| `end-year-label` | Accessible name for the end year segment. | `CoreDateRangePicker` |
| `footer` | Content rendered below the calendar in the popup. | `CoreDateRangePicker` |
| `help-text` | Text that helps explain the expected input. | `CoreDateRangePicker` |
| `incomplete-range-message` | Validation text for a partially entered range. | `CoreDateRangePicker` |
| `invalid-range-message` | Validation text for an impossible range. | `CoreDateRangePicker` |
| `label` | The date range picker's label. | `CoreDateRangePicker` |
| `max-range-message` | Singular maximum range length message; supports `{count}`. | `CoreDateRangePicker` |
| `max-range-message-other` | Plural maximum range length message; supports `{count}`. | `CoreDateRangePicker` |
| `min-range-message` | Singular minimum range length message; supports `{count}`. | `CoreDateRangePicker` |
| `min-range-message-other` | Plural minimum range length message; supports `{count}`. | `CoreDateRangePicker` |
| `month-label` | Forwarded to the nested calendar month selector. | `CoreDateRangePicker` |
| `month-placeholder` | Translated month segment placeholder. | `CoreDateRangePicker` |
| `next-month-label` | Forwarded to the nested calendar next month control. | `CoreDateRangePicker` |
| `popup-label` | Accessible name for the calendar dialog when no field label is set. | `CoreDateRangePicker` |
| `previous-month-label` | Forwarded to the nested calendar previous month control. | `CoreDateRangePicker` |
| `range-separator` | Separator between start and end segment groups. | `CoreDateRangePicker` |
| `start` | Content rendered at the start of the segmented input. | `CoreDateRangePicker` |
| `start-day-label` | Accessible name for the start day segment. | `CoreDateRangePicker` |
| `start-label` | Accessible name for the start date segments. | `CoreDateRangePicker` |
| `start-month-label` | Accessible name for the start month segment. | `CoreDateRangePicker` |
| `start-year-label` | Accessible name for the start year segment. | `CoreDateRangePicker` |
| `today-label` | Label for the today button in the popup footer. | `CoreDateRangePicker` |
| `toggle-label` | Accessible label for the calendar toggle button. | `CoreDateRangePicker` |
| `unavailable-range-message` | Validation text when either endpoint is unavailable. | `CoreDateRangePicker` |
| `year-label` | Forwarded to the nested calendar year field. | `CoreDateRangePicker` |
| `year-placeholder` | Translated year segment placeholder. | `CoreDateRangePicker` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): void` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `clear(): void` | Clears both endpoints and emits `input` and `change`. | `CoreDateRangePicker` |
| `focus(options?: FocusOptions): void` | Focuses the first segment of the start date. | `CoreDateRangePicker` |
| `hide(): void` | Closes the calendar and discards any in-progress calendar selection. | `CoreDateRangePicker` |
| `reportValidity(): void` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
| `show(): void` | Opens the calendar and starts a fresh in-progress selection from the committed value. | `CoreDateRangePicker` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `date-range-picker-base` | The component wrapper. | `CoreDateRangePicker` |
| `date-range-picker-control` | The segmented input wrapper. | `CoreDateRangePicker` |
| `date-range-picker-footer` | The popup footer wrapper. | `CoreDateRangePicker` |
| `date-range-picker-group` | Segment group for each endpoint. | `CoreDateRangePicker` |
| `date-range-picker-label` | The component label. | `CoreDateRangePicker` |
| `date-range-picker-literal` | A literal separator between segments. | `CoreDateRangePicker` |
| `date-range-picker-popup` | The popup container. | `CoreDateRangePicker` |
| `date-range-picker-segment` | A single editable date segment. | `CoreDateRangePicker` |
| `date-range-picker-separator` | The separator between start and end groups. | `CoreDateRangePicker` |
| `date-range-picker-today` | The today button. | `CoreDateRangePicker` |
| `date-range-picker-toggle` | The calendar toggle button. | `CoreDateRangePicker` |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-form-control-bg-color` | — | — | Determines the background color for the control. | `CharmFormControlElement` |
| `--zd-charm-form-control-border-radius` | — | — | Determines the border radius of the control. | `CharmFormControlElement` |
| `--zd-charm-form-control-disabled-bg-color` | — | — | Determines the disabled input background color. | `CharmFormControlElement` |
| `--zd-charm-form-control-disabled-border-color` | — | — | Determines the disabled input border color. | `CharmFormControlElement` |
| `--zd-charm-form-control-disabled-fg-color` | — | — | Determines the disabled input foreground color. | `CharmFormControlElement` |
| `--zd-charm-form-control-disabled-opacity` | — | — | Determines the disabled input opacity. | `CharmFormControlElement` |
| `--zd-charm-form-control-fg-color` | — | — | Determines the control text color. | `CharmFormControlElement` |
| `--zd-charm-form-control-focus-border-color` | — | — | Determines the focused control border color. | `CharmFormControlElement` |
| `--zd-charm-form-control-font-size` | — | — | Determines the font size. | `CharmFormControlElement` |
| `--zd-charm-form-control-help-text-color` | — | — | Determines the help text color. | `CharmFormControlElement` |
| `--zd-charm-form-control-help-text-font-size` | — | — | Determines the help text font size. | `CharmFormControlElement` |
| `--zd-charm-form-control-help-text-font-weight` | — | — | Determines the help text font weight. | `CharmFormControlElement` |
| `--zd-charm-form-control-help-text-gap` | — | — | Determines the margin after help text. | `CharmFormControlElement` |
| `--zd-charm-form-control-icon-gap` | — | — | Determines the margin between start/end icons and the input. | `CharmFormControlElement` |
| `--zd-charm-form-control-input-height` | — | — | Determines the input height. | `CharmFormControlElement` |
| `--zd-charm-form-control-invalid-border-color` | — | — | Determines the error border color. | `CharmFormControlElement` |
| `--zd-charm-form-control-invalid-message-color` | — | — | Determines the error text color. | `CharmFormControlElement` |
| `--zd-charm-form-control-invalid-message-font-size` | — | — | Determines the error message font size. | `CharmFormControlElement` |
| `--zd-charm-form-control-label-color` | — | — | Determines the label color. | `CharmFormControlElement` |
| `--zd-charm-form-control-label-font-size` | — | — | Determines the label font size. | `CharmFormControlElement` |
| `--zd-charm-form-control-label-font-weight` | — | — | Determines the label font weight. | `CharmFormControlElement` |
| `--zd-charm-form-control-label-gap` | — | — | Determines the margin between label and the control. | `CharmFormControlElement` |
| `--zd-charm-form-control-label-required-indicator-gap` | — | — | Determines the margin between the required indicator and the label. | `CharmFormControlElement` |
| `--zd-charm-form-control-padding-x` | — | — | Determines the inline padding within the input element. | `CharmFormControlElement` |
| `--zd-charm-form-control-padding-y` | — | — | Determines the input block padding within the input element. | `CharmFormControlElement` |
| `--zd-charm-form-control-placeholder-color` | — | — | Determines the placeholder text color. | `CharmFormControlElement` |
| `--zd-charm-form-control-range-thumb-size` | — | — | Determines thumb size when the input type is range. | `CharmFormControlElement` |
| `--zd-charm-form-control-range-track-margin-top` | — | — | Determines the margin-top of the track when the input type is range. | `CharmFormControlElement` |
| `--zd-charm-form-control-range-track-size` | — | — | Determines track size when the input type is range. | `CharmFormControlElement` |
