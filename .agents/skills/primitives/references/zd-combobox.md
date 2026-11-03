# zd-combobox

A text input paired with a listbox for filtering and selecting from a set of options.

**Class** `ZdCombobox` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-combobox></zd-combobox>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `allows-custom-value` | `allowsCustomValue` | `boolean` | `false` | Allows the user to commit a value that does not match any option. Only applies to single selection. | `CoreCombobox` |
| `allows-empty-collection` | `allowsEmptyCollection` | `boolean` | `false` | Keeps the listbox open when the collection is empty. | `CoreCombobox` |
| `auto-highlight` | `autoHighlight` | `boolean` | `false` | Highlights the first enabled option while filtering. | `CoreCombobox` |
| `autocomplete` | `autocomplete` | `string` | `'off'` | Controls browser autofill for the text input. | `CoreCombobox` |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `unknown` | — | — | `CharmElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CharmFormControlElement` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `inputmode` | `inputmode` | `'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'` | — | Hints at the type of data that might be entered by the user. | `CoreCombobox` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CharmFormControlElement` |
| `loading` | `loading` | `boolean` | `false` | Shows a spinner and allows the listbox to open while options are loading. | `CoreCombobox` |
| `max-tag-count` | `maxTagCount` | `number` | `DEFAULT_MAX_TAG_COUNT` | The number of selected tags to show, defaulting to 2. Selections beyond this count are summarized by a read-only "+N" tag. | `CoreCombobox` |
| `menu-trigger` | `menuTrigger` | `ComboboxMenuTrigger` | `'input'` | The interaction that opens the listbox. | `CoreCombobox` |
| `mode` | `mode` | `ComboboxMode` | `'both'` | Controls whether typing shows a list, an inline completion, both, or neither. | `CoreCombobox` |
| `multiple` | `multiple` | `boolean` | `false` | Allows more than one option to be selected. | `CoreCombobox` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CharmFormControlElement` |
| `open` | `open` | `boolean` | `false` | Indicates whether the listbox is open. | `CoreCombobox` |
| `placeholder` | `placeholder` | `string` | — | The text input's placeholder. | `CoreCombobox` |
| `placement` | `placement` | `PopupPlacement` | `'bottom-start'` | The preferred placement of the listbox. | `CoreCombobox` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CharmFormControlElement` |
| `remove-label` | `removeLabel` | `string` | `'Remove'` | Accessible label prefix for a tag's remove button. | `CoreCombobox` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `should-focus-wrap` | `shouldFocusWrap` | `boolean` | `false` | Wraps keyboard navigation from the last option to the first and vice versa. | `CoreCombobox` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| `value-delimiter` | `valueDelimiter` | `string` | — | The delimiter used to parse and serialize `value` when multiple selection is enabled. | `CoreCombobox` |
| `with-clear` | `withClear` | `boolean` | `false` | Adds a clear button when the combobox has a selection or input text. | `CoreCombobox` |
| — | `filter` | `ComboboxFilter` | — | A custom filter function. Receives the source option and the current input value. | `CoreCombobox` |
| — | `validationMessage` | `string` | — | Gets the current validation message, if one exists. | `CoreCombobox` |
| — | `validity` | `ValidityState` | — | Gets the current validity, where a required combobox must have at least one selected value. | `CoreCombobox` |
| — | `valueAsArray` | `string[]` | — | The selected values as an array. | `CoreCombobox` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `Event` | Emitted when the user commits a new value. | `CharmFormControlElement` |
| `combobox-hide` | `Event` | Emitted when the listbox closes. | `CoreCombobox` |
| `combobox-show` | `Event` | Emitted when the listbox opens. | `CoreCombobox` |
| `input` | `Event` | Emitted when the value is being changed by the user. | `CharmFormControlElement` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `clear-label` | Accessible text for the clear button. Defaults to "Clear". | `CoreCombobox` |
| `help-text` | Help text that describes how to use the combobox. Alternatively, use the `help-text` property. | `CoreCombobox` |
| `label` | The combobox label. Alternatively, use the `label` property. | `CoreCombobox` |
| `loading` | Replaces the default spinner shown while `loading` is true. | `CoreCombobox` |
| `no-results` | Content shown when no options match the current input value. | `CoreCombobox` |
| `start` | Content placed before the text input, such as an icon. | `CoreCombobox` |
| `toggle-label` | Accessible name for the listbox toggle button. Defaults to "Options". | `CoreCombobox` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean` | Checks for validity but doesn't report a validation message when invalid. | `CoreCombobox` |
| `clear(): void` | Clears the selection and the input value. | `CoreCombobox` |
| `hide(): void` | Closes the listbox and restores the input to the selected value. | `CoreCombobox` |
| `reportValidity(): boolean` | Checks for validity and shows the browser's validation message if the control is invalid. | `CoreCombobox` |
| `setCustomValidity(message?: string): void` | — | `CoreCombobox` |
| `show(): void` | Opens the listbox. | `CoreCombobox` |
| `toggle(): void` | Toggles the listbox. | `CoreCombobox` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `combobox-base` | The component's form-control wrapper. | `CoreCombobox` |
| `combobox-chevron` | The chevron indicator. | `CoreCombobox` |
| `combobox-clear` | The clear button. | `CoreCombobox` |
| `combobox-control` | The control wrapping the input, tags, and icons. | `CoreCombobox` |
| `combobox-empty` | The container shown when no options match. | `CoreCombobox` |
| `combobox-input` | The native text input. | `CoreCombobox` |
| `combobox-label` | The combobox label. | `CoreCombobox` |
| `combobox-listbox` | The listbox containing options. | `CoreCombobox` |
| `combobox-loading` | The container shown while loading. | `CoreCombobox` |
| `combobox-popup` | The popup element that positions the listbox. | `CoreCombobox` |
| `combobox-start` | Container for the start slot. | `CoreCombobox` |
| `combobox-tag` | A selected-value tag. | `CoreCombobox` |
| `combobox-tag-label` | The text within a tag. | `CoreCombobox` |
| `combobox-tag-remove` | The remove button within a tag. | `CoreCombobox` |
| `combobox-tags` | Container for selected-value tags. | `CoreCombobox` |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-combobox-icon-size` | — | — | The size of the chevron, clear, and tag icons. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-bg-color` | — | — | The listbox background color. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-border-color` | — | — | The listbox border color. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-border-radius` | — | — | The listbox border radius. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-border-style` | — | — | The listbox border style. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-border-width` | — | — | The listbox border width. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-empty-color` | — | — | The color of the empty and loading states. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-max-height` | — | — | The maximum height of the listbox. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-padding` | — | — | The padding within the listbox. | `CoreCombobox` |
| `--zd-charm-combobox-listbox-shadow` | — | — | The listbox shadow. | `CoreCombobox` |
| `--zd-charm-combobox-tag-bg-color` | — | — | The selected tag background color. | `CoreCombobox` |
| `--zd-charm-combobox-tag-border-radius` | — | — | The selected tag border radius. | `CoreCombobox` |
| `--zd-charm-combobox-tag-fg-color` | — | — | The selected tag foreground color. | `CoreCombobox` |
| `--zd-charm-combobox-tag-font-size` | — | — | The selected tag font size. | `CoreCombobox` |
| `--zd-charm-combobox-tag-gap` | — | — | The gap between tags and within a tag. | `CoreCombobox` |
| `--zd-charm-combobox-tag-padding-x` | — | — | The inline padding within a tag. | `CoreCombobox` |
| `--zd-charm-combobox-tag-padding-y` | — | — | The block padding within a tag. | `CoreCombobox` |
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
