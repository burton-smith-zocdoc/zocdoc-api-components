# zd-input

A text input field with label and validation support.

**Class** `ZdInput` — **Module** `src/components/input/input.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-input></zd-input>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'default' \| 'small' \| undefined` | — | The control's density. `small` swaps in the theme's `formControl.small.*` metrics. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autocapitalize` | `autocapitalize` | `'off' \| 'none' \| 'on' \| 'sentences' \| 'words' \| 'characters'` | `'off'` | Controls whether and how text input is automatically capitalized as it is entered/edited by the user. | `CoreInput` |
| `autocomplete` | `autocomplete` | `string \| undefined` | — | Permission the user agent has to provide automated assistance in filling out form field values and the type of information expected in the field. | `CoreInput` |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the input. | `CharmFormControlElement` |
| `enterkeyhint` | `enterkeyhint` | `'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| undefined` | — | Used to customize the label or icon of the Enter key on virtual keyboards. | `CoreInput` |
| `error-message` | `errorMessage` | `string` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `string \| undefined` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `boolean` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `inputmode` | `inputmode` | `'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' \| undefined` | — | Hints at the type of data that might be entered by the user while editing the element or its contents. | `CoreInput` |
| `invalid` | `invalid` | `boolean` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `string \| undefined` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `'end' \| 'start' \| 'top' \| undefined` | — | The position of the label | `CharmFormControlElement` |
| `max` | `max` | `number \| undefined` | — | The input's max attribute. | `CoreInput` |
| `maxlength` | `maxlength` | `number \| undefined` | — | The input's maxlength attribute. | `CoreInput` |
| `min` | `min` | `number \| undefined` | — | The input's min attribute. | `CoreInput` |
| `minlength` | `minlength` | `number \| undefined` | — | The input's minlength attribute. | `CoreInput` |
| `name` | `name` | `string \| undefined` | — | The input's name attribute. | `CharmFormControlElement` |
| `password-toggle` | `passwordToggle` | `boolean` | `false` | Adds a button to toggle the password's visibility. Only applies to password types. | `CoreInput` |
| `password-visible` | `passwordVisible` | `boolean` | `false` | Determines whether the password is currently visible. Only applies to password types. | `CoreInput` |
| `pattern` | `pattern` | `string \| undefined` | — | A pattern to validate input against. | `CoreInput` |
| `placeholder` | `placeholder` | `string \| undefined` | — | The input's placeholder text. | `CoreInput` |
| `readonly` | `readonly` | `boolean` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `boolean` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `spellcheck` | `spellcheck` | `boolean` | `false` | Enables spell checking on the input. | `CoreInput` |
| `step` | `step` | `number \| undefined` | — | The input's step attribute. | `CoreInput` |
| `title` | `title` | `string` | `''` | Tooltip text for the input. | `CoreInput` |
| `type` | `type` | `'number' \| 'date' \| 'datetime-local' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'text' \| 'time' \| 'url' \| 'range' \| undefined` | — | — | `CoreInput` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| `with-clear` | `withClear` | `boolean` | `false` | Adds a clear button when the input is not empty. | `CoreInput` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `ValidityState` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |
| — | `valueAsDate` | `unknown` | — | Gets or sets the current value as a `Date` object. Only valid when `type` is `date`. | `CoreInput` |
| — | `valueAsNumber` | `unknown` | — | Gets or sets the current value as a number. | `CoreInput` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `unknown` | Emitted when an alteration to the control's value is committed by the user. | `CharmFormControlElement` |
| `input` | `unknown` | Emitted when the value is being changed by the user. | `CharmFormControlElement` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The options in the datalist. | `CoreInput` |
| `end` | A presentational suffix icon or similar element. | `CoreInput` |
| `label` | The input's label. Alternatively, you can use the label prop. | `CoreInput` |
| `start` | A presentational prefix icon or similar element. | `CoreInput` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean \| undefined` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): boolean \| undefined` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `select(): void` | Selects all input text. | `CoreInput` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
| `setRangeText(replacement: string, start?: number, end?: number, selectMode: 'select' \| 'start' \| 'end' \| 'preserve'): void` | Replaces a range of text in the input. | `CoreInput` |
| `setSelectionRange(selectionStart: number, selectionEnd: number, selectionDirection: 'forward' \| 'backward' \| 'none'): void` | Sets the start and end positions of the selection. | `CoreInput` |
| `showPicker(): void` | Shows the browser picker for supported input types. | `CoreInput` |
| `stepDown(): void` | Decrements the value of a numeric input type by the value of the step attribute. | `CoreInput` |
| `stepUp(): void` | Increments the value of a numeric input type by the value of the step attribute. | `CoreInput` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `end` | Container for end slot. | `CoreInput` |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |
| `input` | The native input element. | `CoreInput` |
| `input-base` | The component's base wrapper. | `CoreInput` |
| `input-control` | The wrapper for start, input, and end. | `CoreInput` |
| `input-label` | The label. | `CoreInput` |
| `start` | Container for start slot. | `CoreInput` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-input-range-active-bg-color` | — | — | The background color of the progress track and thumb when the input is active and the input type is `range`. | `CoreInput` |
| `--zd-input-range-active-fg-color` | — | — | The foreground color of the progress track and thumb when the input is active and the input type is `range`. | `CoreInput` |
| `--zd-input-range-disabled-bg-color` | — | — | The background color of the progress track and thumb when the input is disabled and the input type is `range`. | `CoreInput` |
| `--zd-input-range-disabled-fg-color` | — | — | The foreground color of the progress track and thumb when the input is disabled and the input type is `range`. | `CoreInput` |
| `--zd-input-range-hover-bg-color` | — | — | The background color of the progress track and thumb when the input is hovered and the input type is `range`. | `CoreInput` |
| `--zd-input-range-hover-fg-color` | — | — | The foreground color of the progress track and thumb when the input is hovered and the input type is `range`. | `CoreInput` |
| `--zd-input-range-progress-color` | — | — | The color of the slider's track that represents the selected range. | `CoreInput` |
| `--zd-input-range-thumb-color` | — | — | The color of the slider's thumb. | `CoreInput` |
| `--zd-input-range-track-color` | — | — | The color of the slider's track. | `CoreInput` |
| `--zd-form-control-bg-color` | — | — | Determines the background color for the control. | `CharmFormControlElement` |
| `--zd-form-control-border-radius` | — | — | Determines the border radius of the control. | `CharmFormControlElement` |
| `--zd-form-control-disabled-bg-color` | — | — | Determines the disabled input background color. | `CharmFormControlElement` |
| `--zd-form-control-disabled-border-color` | — | — | Determines the disabled input border color. | `CharmFormControlElement` |
| `--zd-form-control-disabled-fg-color` | — | — | Determines the disabled input foreground color. | `CharmFormControlElement` |
| `--zd-form-control-disabled-opacity` | — | — | Determines the disabled input opacity. | `CharmFormControlElement` |
| `--zd-form-control-fg-color` | — | — | Determines the control text color. | `CharmFormControlElement` |
| `--zd-form-control-focus-border-color` | — | — | Determines the focused control border color. | `CharmFormControlElement` |
| `--zd-form-control-font-size` | — | — | Determines the font size. | `CharmFormControlElement` |
| `--zd-form-control-help-text-color` | — | — | Determines the help text color. | `CharmFormControlElement` |
| `--zd-form-control-help-text-font-size` | — | — | Determines the help text font size. | `CharmFormControlElement` |
| `--zd-form-control-help-text-font-weight` | — | — | Determines the help text font weight. | `CharmFormControlElement` |
| `--zd-form-control-help-text-gap` | — | — | Determines the margin after help text. | `CharmFormControlElement` |
| `--zd-form-control-icon-gap` | — | — | Determines the margin between start/end icons and the input. | `CharmFormControlElement` |
| `--zd-form-control-input-height` | — | — | Determines the input height. | `CharmFormControlElement` |
| `--zd-form-control-invalid-border-color` | — | — | Determines the error border color. | `CharmFormControlElement` |
| `--zd-form-control-invalid-message-color` | — | — | Determines the error text color. | `CharmFormControlElement` |
| `--zd-form-control-invalid-message-font-size` | — | — | Determines the error message font size. | `CharmFormControlElement` |
| `--zd-form-control-label-color` | — | — | Determines the label color. | `CharmFormControlElement` |
| `--zd-form-control-label-font-size` | — | — | Determines the label font size. | `CharmFormControlElement` |
| `--zd-form-control-label-font-weight` | — | — | Determines the label font weight. | `CharmFormControlElement` |
| `--zd-form-control-label-gap` | — | — | Determines the margin between label and the control. | `CharmFormControlElement` |
| `--zd-form-control-label-required-indicator-gap` | — | — | Determines the margin between the required indicator and the label. | `CharmFormControlElement` |
| `--zd-form-control-padding-x` | — | — | Determines the inline padding within the input element. | `CharmFormControlElement` |
| `--zd-form-control-padding-y` | — | — | Determines the input block padding within the input element. | `CharmFormControlElement` |
| `--zd-form-control-placeholder-color` | — | — | Determines the placeholder text color. | `CharmFormControlElement` |
| `--zd-form-control-range-thumb-size` | — | — | Determines thumb size when the input type is range. | `CharmFormControlElement` |
| `--zd-form-control-range-track-margin-top` | — | — | Determines the margin-top of the track when the input type is range. | `CharmFormControlElement` |
| `--zd-form-control-range-track-size` | — | — | Determines track size when the input type is range. | `CharmFormControlElement` |
