# zd-checkbox

A labelled checkbox for boolean and multi-select choices, with indeterminate support.

**Class** `ZdCheckbox` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-checkbox></zd-checkbox>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'small' \| 'default' \| undefined` | — | The control's density. `small` swaps in the theme's `checkbox.small.*` metrics along with the smaller form-control label size. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `checked` | `checked` | `boolean` | — | Draws the checkbox in a checked state. | `CoreCheckbox` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CharmFormControlElement` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `indeterminate` | `indeterminate` | `boolean` | — | Draws the checkbox in an indeterminate state. | `CoreCheckbox` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CharmFormControlElement` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CharmFormControlElement` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `value` | `value` | `unknown` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `unknown` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `Event` | Emitted when the control loses focus. | `CoreCheckbox` |
| `change` | `Event` | Emitted when the control's checked state changes. | `CharmFormControlElement` |
| `focus` | `Event` | Emitted when the control gains focus. | `CoreCheckbox` |
| `input` | `Event` | Emitted when the value of the control changes. | `CharmFormControlElement` |
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
| `zd-checkbox` | HTML label element, whose purpose is to aid with styling. | `CoreCheckbox` |
| `zd-checkbox-base` | The checkbox's base wrapper. | `CoreCheckbox` |
| `zd-checkbox-control` | Checkbox visual representation as a span. | `CoreCheckbox` |
| `zd-checkbox-label` | The checkbox's label. | `CoreCheckbox` |
| `zd-checkbox-visual-base` | Part who parent's the rendered checkbox as a span and its label. | `CoreCheckbox` |
| `zd-form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `zd-form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `zd-form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `zd-form-control-help-text` | The help text container. | `CharmFormControlElement` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-checkbox-active-border-color` | — | — | Border color of checkbox when active. | `CoreCheckbox` |
| `--zd-charm-checkbox-active-fg-color` | — | — | Font color of checkbox when active. | `CoreCheckbox` |
| `--zd-charm-checkbox-bg-color` | — | — | The background color of the checkbox. | `CoreCheckbox` |
| `--zd-charm-checkbox-border-color` | — | — | Border color of checkbox. | `CoreCheckbox` |
| `--zd-charm-checkbox-border-radius` | — | — | The border radius of the checkbox. | `CoreCheckbox` |
| `--zd-charm-checkbox-checked-active-bg-color` | — | — | Background color when checked and active. | `CoreCheckbox` |
| `--zd-charm-checkbox-checked-active-border-color` | — | — | Border color of checkbox when checked and active. | `CoreCheckbox` |
| `--zd-charm-checkbox-checked-bg-color` | — | — | The background color of the checkbox when checked. | `CoreCheckbox` |
| `--zd-charm-checkbox-checked-border-color` | — | — | Border color of checkbox when checked. | `CoreCheckbox` |
| `--zd-charm-checkbox-checked-fg-color` | — | — | Font color of checkbox when checked. | `CoreCheckbox` |
| `--zd-charm-checkbox-checked-hover-bg-color` | — | — | Background color when checked and hovered over. | `CoreCheckbox` |
| `--zd-charm-checkbox-checked-hover-border-color` | — | — | Border color of checkbox when checked and hovered over. | `CoreCheckbox` |
| `--zd-charm-checkbox-disabled-bg-color` | — | — | Background color of checkbox when disabled. | `CoreCheckbox` |
| `--zd-charm-checkbox-disabled-border-color` | — | — | Border color of checkbox when disabled. | `CoreCheckbox` |
| `--zd-charm-checkbox-disabled-fg-color` | — | — | Font color of checkbox when disabled. | `CoreCheckbox` |
| `--zd-charm-checkbox-fg-color` | — | — | Font color of checkbox. | `CoreCheckbox` |
| `--zd-charm-checkbox-hover-border-color` | — | — | Border color of checkbox while being hovered over. | `CoreCheckbox` |
| `--zd-charm-checkbox-hover-fg-color` | — | — | Font color of checkbox when being hovered over. | `CoreCheckbox` |
| `--zd-charm-checkbox-icon-size` | — | — | The size of the checkbox's icon. | `CoreCheckbox` |
| `--zd-charm-checkbox-size` | — | — | The size of the checkbox. | `CoreCheckbox` |
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
