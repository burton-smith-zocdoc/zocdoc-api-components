# zd-text-area

A multi-line text field with label and validation support.

**Class** `ZdTextArea` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-text-area></zd-text-area>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'small' \| 'default' \| undefined` | — | The control's density. `small` swaps in the theme's `formControl.small.*` metrics. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autocapitalize` | `autocapitalize` | `'off' \| 'none' \| 'on' \| 'sentences' \| 'words' \| 'characters'` | `'none'` | Controls whether and how text input is automatically capitalized as it is entered/edited by the user. | `CoreTextArea` |
| `autocomplete` | `autocomplete` | `'off' \| 'on'` | — | This attribute specifies whether the browser can automatically fill in the control's value. | `CoreTextArea` |
| `autofocus` | `autofocus` | `unknown` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CharmFormControlElement` |
| `enterkeyhint` | `enterkeyhint` | `'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send'` | — | Used to customize the label or icon of the Enter key on virtual keyboards. | `CoreTextArea` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `inputmode` | `inputmode` | `'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'` | — | Hints at the type of data that might be entered by the user while editing the element or its contents. | `CoreTextArea` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CharmFormControlElement` |
| `maxlength` | `maxlength` | `number` | — | The maximum length of input that will be considered valid. | `CoreTextArea` |
| `minlength` | `minlength` | `number` | — | The minimum length of input that will be considered valid. | `CoreTextArea` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CharmFormControlElement` |
| `placeholder` | `placeholder` | `string` | — | The textarea's placeholder text. | `CoreTextArea` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `resize` | `resize` | `'none' \| 'horizontal' \| 'vertical' \| 'both'` | — | How the control can be resized. Charm leaves this unset (the browser default is `both`); Zocdoc's text area only grows vertically so it can't be dragged out of a form's column. | `CoreTextArea` |
| `rows` | `rows` | `number` | — | Number of visible rows. Charm defaults to 4; Zocdoc's text area is 6 rows. | `CoreTextArea` |
| `value` | `value` | `unknown` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `unknown` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `Event` | Emitted when the control loses focus. | `CoreTextArea` |
| `change` | `Event` | Emitted when an alteration to the control's value is committed by the user. | `CharmFormControlElement` |
| `focus` | `Event` | Emitted when the control gains focus. | `CoreTextArea` |
| `input` | `Event` | Emitted when the control receives input and its value changes. | `CharmFormControlElement` |
| `keydown` | `Event` | Emitted when a key is pressed down while the control is focused. | `CoreTextArea` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): void` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): void` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `zd-form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `zd-form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `zd-form-control-help-text` | The help text container. | `CharmFormControlElement` |
| `zd-textarea-base` | The component's base wrapper. | `CoreTextArea` |
| `zd-textarea-control` | The textarea control. | `CoreTextArea` |
| `zd-textarea-control-input` | The textarea input. | `CoreTextArea` |
| `zd-textarea-label` | The textarea label. | `CoreTextArea` |

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
| `--zd-charm-text-area-input-line-height` | — | — | The line-height of the textarea control input. | `CoreTextArea` |
| `--zd-charm-text-area-input-min-height` | — | — | The min-height of the textarea control input. | `CoreTextArea` |
| `--zd-charm-text-area-input-min-width` | — | — | The min-width of the textarea control input. | `CoreTextArea` |
