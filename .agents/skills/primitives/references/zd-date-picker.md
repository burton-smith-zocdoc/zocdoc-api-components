# zd-date-picker

A segmented date field with a popup calendar for selecting a single date.

**Class** `ZdDatePicker` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-date-picker></zd-date-picker>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autocomplete` | `autocomplete` | `string` | — | Autofill hint for the date segments. Set to `bday` to autofill a birthday. | `CoreDatePicker` |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CharmFormControlElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CoreDatePicker` |
| `disabled-dates` | `disabledDates` | `string` | `''` | A comma- or whitespace-separated list of unavailable dates in `YYYY-MM-DD` format. | `CoreDatePicker` |
| `disabled-week-days` | `disabledWeekDays` | `string` | `''` | A comma- or whitespace-separated list of unavailable weekdays, from 0 (Sunday) to 6 (Saturday). | `CoreDatePicker` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CoreDatePicker` |
| `first-day-of-week` | `firstDayOfWeek` | `number` | — | The first weekday, from 0 (Sunday) to 6 (Saturday), forwarded to the nested calendar. | `CoreDatePicker` |
| `fixed-placement` | `fixedPlacement` | `boolean` | `false` | Enables fixed positioning for the popup calendar. | `CoreDatePicker` |
| `focus-date` | `focusDate` | `string` | — | The date initially focused when there is no selected value. | `CoreDatePicker` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CoreDatePicker` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CoreDatePicker` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CoreDatePicker` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CoreDatePicker` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CoreDatePicker` |
| `max` | `max` | `string` | — | The latest selectable date, in `YYYY-MM-DD` format. | `CoreDatePicker` |
| `min` | `min` | `string` | — | The earliest selectable date, in `YYYY-MM-DD` format. | `CoreDatePicker` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CoreDatePicker` |
| `open` | `open` | `boolean` | `false` | Whether the popup calendar is open. | `CoreDatePicker` |
| `placement` | `placement` | `PopupPlacement` | `'bottom-start'` | Preferred popup placement relative to the segmented input. | `CoreDatePicker` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CoreDatePicker` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CoreDatePicker` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| `weekday-format` | `weekdayFormat` | `'narrow' \| 'short' \| 'long'` | `'short'` | The visible format for calendar weekday headings. | `CoreDatePicker` |
| — | `dir` | `unknown` | — | — | `CharmElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `unknown` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |
| — | `valueAsDate` | `Date \| null` | — | Gets or sets the value as a `Date` at local midnight; the Date's local calendar day is used. | `CoreDatePicker` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `Event` | Emitted when a value change is committed. | `CoreDatePicker` |
| `date-picker-today` | `Event` | Emitted when the Today action sets the value. | `CoreDatePicker` |
| `input` | `Event` | Emitted when the value changes during user interaction. | `CoreDatePicker` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `clear-label` | Label for the clear button in the popup footer. | `CoreDatePicker` |
| `day-placeholder` | Translated day segment placeholder. | `CoreDatePicker` |
| `day-segment-label` | Accessible name for the day segment. | `CoreDatePicker` |
| `end` | Content rendered at the end of the segmented input. | `CoreDatePicker` |
| `footer` | Content rendered below the calendar in the popup. | `CoreDatePicker` |
| `help-text` | Text that helps explain the expected input. | `CoreDatePicker` |
| `incomplete-date-message` | Validation text for a partially entered date; translated consumers may provide it here. | `CoreDatePicker` |
| `invalid-date-message` | Validation text for an impossible date. | `CoreDatePicker` |
| `label` | The date picker's label. | `CoreDatePicker` |
| `month-label` | Forwarded to the nested calendar month selector. | `CoreDatePicker` |
| `month-placeholder` | Translated month segment placeholder. | `CoreDatePicker` |
| `month-segment-label` | Accessible name for the month segment. | `CoreDatePicker` |
| `next-month-label` | Forwarded to the nested calendar next month control. | `CoreDatePicker` |
| `popup-label` | Accessible name for the calendar dialog when no field label is set. | `CoreDatePicker` |
| `previous-month-label` | Forwarded to the nested calendar previous month control. | `CoreDatePicker` |
| `start` | Content rendered at the start of the segmented input. | `CoreDatePicker` |
| `today-label` | Label for the today button in the popup footer. | `CoreDatePicker` |
| `toggle-label` | Accessible label for the calendar toggle button. | `CoreDatePicker` |
| `unavailable-date-message` | Validation text for a date outside the available dates. | `CoreDatePicker` |
| `year-label` | Forwarded to the nested calendar year field. | `CoreDatePicker` |
| `year-placeholder` | Translated year segment placeholder. | `CoreDatePicker` |
| `year-segment-label` | Accessible name for the year segment. | `CoreDatePicker` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): void` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `clear(): void` | Clears the current value and emits `input` and `change`. | `CoreDatePicker` |
| `focus(options?: FocusOptions): void` | Focuses the first segment. | `CoreDatePicker` |
| `hide(): void` | Closes the popup calendar and commits pending changes. | `CoreDatePicker` |
| `reportValidity(): void` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
| `show(): void` | Opens the popup calendar. | `CoreDatePicker` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `date-picker-base` | The component wrapper. | `CoreDatePicker` |
| `date-picker-control` | The segmented input wrapper. | `CoreDatePicker` |
| `date-picker-footer` | The popup footer wrapper. | `CoreDatePicker` |
| `date-picker-label` | The component label. | `CoreDatePicker` |
| `date-picker-literal` | A literal separator between segments. | `CoreDatePicker` |
| `date-picker-popup` | The popup container. | `CoreDatePicker` |
| `date-picker-segment` | A single editable date segment. | `CoreDatePicker` |
| `date-picker-segments` | Container for date segments. | `CoreDatePicker` |
| `date-picker-today` | The today button. | `CoreDatePicker` |
| `date-picker-toggle` | The calendar toggle button. | `CoreDatePicker` |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-date-picker-segment-placeholder-color` | — | — | The color of empty segment placeholders. | `CoreDatePicker` |
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
