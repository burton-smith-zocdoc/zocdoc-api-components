# zd-select

A dropdown select field for choosing from options.

Note that unlike the other form controls this has no `size` prop for density.
Charm's select already declares `size?: number` for the native `<select size>`
attribute (how many options to show at once), so the name is taken. Consumers
that need the compact treatment can set `--zd-form-control-input-height` and
`--zd-form-control-padding-y` directly.

**Class** `ZdSelect` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-select></zd-select>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CharmFormControlElement` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CharmFormControlElement` |
| `multiple` | `multiple` | `boolean` | `false` | This Boolean attribute indicates that multiple options can be selected in the list. * | `CoreSelect` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CharmFormControlElement` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `size` | `size` | `number` | — | This attribute represents the number of rows in the list that should be visible at one time * | `CoreSelect` |
| `value` | `value` | `unknown` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `unknown` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `Event` | Custom event that indicates a new selection has been made through e.target.value. | `CharmFormControlElement` |
| `input` | `Event` | Custom event that indicates a new selection has been made through e.target.value. | `CharmFormControlElement` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `end` | A slot for content to be placed at the end of the select. | `CoreSelect` |
| `label` | A placeholder for the select's label. | `CoreSelect` |
| `start` | A slot for content to be placed at the start of the select. | `CoreSelect` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): void` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): void` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-end` | Container for the end slot content. | `CoreSelect` |
| `zd-form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `zd-form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `zd-form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `zd-form-control-help-text` | The help text container. | `CharmFormControlElement` |
| `zd-select-base` | The component's base wrapper. | `CoreSelect` |
| `zd-select-control` | The component's select control. | `CoreSelect` |
| `zd-select-control-wrapper` | The component's select control wrapper. | `CoreSelect` |
| `zd-select-icon` | The component's select icon. | `CoreSelect` |
| `zd-select-label` | The component's label. | `CoreSelect` |
| `zd-start` | Container for the start slot content. | `CoreSelect` |

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
| `--zd-charm-select-icon-size` | — | — | Determines the chevron size. | `CoreSelect` |
| `--zd-charm-select-option-bg-color` | — | — | Determines the background color of the options. | `CoreSelect` |
| `--zd-charm-select-option-fg-color` | — | — | Determines the foreground color of the options. | `CoreSelect` |
