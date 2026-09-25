# zd-input

A text input field with label and validation support.

**Class** `ZdInput` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-input></zd-input>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'small' \| 'default' \| undefined` | — | The control's density. `small` swaps in the theme's `formControl.small.*` metrics. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autocapitalize` | `autocapitalize` | `'off' \| 'none' \| 'on' \| 'sentences' \| 'words' \| 'characters'` | `'off'` | Controls whether and how text input is automatically capitalized as it is entered/edited by the user. | `CoreInput` |
| `autocomplete` | `autocomplete` | `string` | — | Permission the user agent has to provide automated assistance in filling out form field values and the type of information expected in the field. | `CoreInput` |
| `autofocus` | `autofocus` | `unknown` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CharmFormControlElement` |
| `enterkeyhint` | `enterkeyhint` | `'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send'` | — | Used to customize the label or icon of the Enter key on virtual keyboards. | `CoreInput` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `inputmode` | `inputmode` | `'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'` | — | Hints at the type of data that might be entered by the user while editing the element or its contents. | `CoreInput` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CharmFormControlElement` |
| `max` | `max` | `number` | — | The input's max attribute. | `CoreInput` |
| `maxlength` | `maxlength` | `number` | — | The input's maxlength attribute. | `CoreInput` |
| `min` | `min` | `number` | — | The input's min attribute. | `CoreInput` |
| `minlength` | `minlength` | `number` | — | The input's minlength attribute. | `CoreInput` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CharmFormControlElement` |
| `password-toggle` | `passwordToggle` | `boolean` | `false` | Adds a button to toggle the password's visibility. Only applies to password types. | `CoreInput` |
| `password-visible` | `passwordVisible` | `boolean` | `false` | Determines whether the password is currently visible. Only applies to password types. | `CoreInput` |
| `pattern` | `pattern` | `string` | — | A pattern to validate input against. | `CoreInput` |
| `placeholder` | `placeholder` | `string` | — | The input's placeholder text. | `CoreInput` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `spellcheck` | `spellcheck` | `boolean` | `false` | Enables spell checking on the input. | `CoreInput` |
| `step` | `step` | `number` | — | The input's step attribute. | `CoreInput` |
| `title` | `title` | `string` | `''` | Tooltip text for the input. | `CoreInput` |
| `type` | `type` | `'number' \| 'date' \| 'time' \| 'search' \| 'text' \| 'tel' \| 'email' \| 'url' \| 'datetime-local' \| 'password' \| 'range' \| undefined` | — | — | `CoreInput` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| `with-clear` | `withClear` | `boolean` | `false` | Adds a clear button when the input is not empty. | `CoreInput` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `unknown` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |
| — | `valueAsDate` | `Date \| null` | — | Gets or sets the current value as a `Date` object. Only valid when `type` is `date`. | `CoreInput` |
| — | `valueAsNumber` | `number` | — | Gets or sets the current value as a number. | `CoreInput` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `Event` | Emitted when an alteration to the control's value is committed by the user. | `CharmFormControlElement` |
| `input` | `Event` | Emitted when the value is being changed by the user. | `CharmFormControlElement` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `end` | A presentational suffix icon or similar element. | `CoreInput` |
| `label` | The input's label. Alternatively, you can use the label prop. | `CoreInput` |
| `start` | A presentational prefix icon or similar element. | `CoreInput` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): void` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): void` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `select(): void` | Selects all input text. | `CoreInput` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
| `setRangeText(replacement: string, start?: number, end?: number, selectMode?: 'select' \| 'start' \| 'end' \| 'preserve'): void` | Replaces a range of text in the input. | `CoreInput` |
| `setSelectionRange(selectionStart: number, selectionEnd: number, selectionDirection?: 'forward' \| 'backward' \| 'none'): void` | Sets the start and end positions of the selection. | `CoreInput` |
| `showPicker(): void` | Shows the browser picker for supported input types. | `CoreInput` |
| `stepDown(): void` | Decrements the value of a numeric input type by the value of the step attribute. | `CoreInput` |
| `stepUp(): void` | Increments the value of a numeric input type by the value of the step attribute. | `CoreInput` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-end` | Container for end slot. | `CoreInput` |
| `zd-form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `zd-form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `zd-form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `zd-form-control-help-text` | The help text container. | `CharmFormControlElement` |
| `zd-input` | The native input element. | `CoreInput` |
| `zd-input-base` | The component's base wrapper. | `CoreInput` |
| `zd-input-control` | The wrapper for start, input, and end. | `CoreInput` |
| `zd-input-label` | The label. | `CoreInput` |
| `zd-start` | Container for start slot. | `CoreInput` |

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
| `--zd-charm-input-range-active-bg-color` | — | — | The background color of the progress track and thumb when the input is active and the input type is `range`. | `CoreInput` |
| `--zd-charm-input-range-active-fg-color` | — | — | The foreground color of the progress track and thumb when the input is active and the input type is `range`. | `CoreInput` |
| `--zd-charm-input-range-disabled-bg-color` | — | — | The background color of the progress track and thumb when the input is disabled and the input type is `range`. | `CoreInput` |
| `--zd-charm-input-range-disabled-fg-color` | — | — | The foreground color of the progress track and thumb when the input is disabled and the input type is `range`. | `CoreInput` |
| `--zd-charm-input-range-hover-bg-color` | — | — | The background color of the progress track and thumb when the input is hovered and the input type is `range`. | `CoreInput` |
| `--zd-charm-input-range-hover-fg-color` | — | — | The foreground color of the progress track and thumb when the input is hovered and the input type is `range`. | `CoreInput` |
| `--zd-charm-input-range-progress-color` | — | — | The color of the slider's track that represents the selected range. | `CoreInput` |
| `--zd-charm-input-range-thumb-color` | — | — | The color of the slider's thumb. | `CoreInput` |
| `--zd-charm-input-range-track-color` | — | — | The color of the slider's track. | `CoreInput` |
