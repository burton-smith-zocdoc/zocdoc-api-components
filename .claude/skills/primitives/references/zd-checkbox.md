# zd-checkbox

A labelled checkbox for boolean and multi-select choices, with indeterminate support.

**Class** `ZdCheckbox` — **Module** `src/components/checkbox/checkbox.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-checkbox></zd-checkbox>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'default' \| 'small' \| undefined` | — | The control's density. `small` swaps in the theme's `checkbox.small.*` metrics along with the smaller form-control label size. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `checked` | `checked` | `boolean \| undefined` | — | Draws the checkbox in a checked state. | `CoreCheckbox` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the input. | `CharmFormControlElement` |
| `error-message` | `errorMessage` | `string` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `string \| undefined` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `boolean` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `indeterminate` | `indeterminate` | `boolean \| undefined` | — | Draws the checkbox in an indeterminate state. | `CoreCheckbox` |
| `invalid` | `invalid` | `boolean` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `string \| undefined` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `'end' \| 'start' \| 'top' \| undefined` | — | The position of the label | `CharmFormControlElement` |
| `name` | `name` | `string \| undefined` | — | The input's name attribute. | `CharmFormControlElement` |
| `readonly` | `readonly` | `boolean` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `boolean` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `ValidityState` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `unknown` | Emitted when the control loses focus. | `CoreCheckbox` |
| `change` | `unknown` | Emitted when the control's checked state changes. | `CharmFormControlElement` |
| `focus` | `unknown` | Emitted when the control gains focus. | `CoreCheckbox` |
| `input` | `unknown` | Emitted when the value of the control changes. | `CharmFormControlElement` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Used for the label. | `CoreCheckbox` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean \| undefined` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): boolean \| undefined` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `checkbox` | HTML label element, whose purpose is to aid with styling. | `CoreCheckbox` |
| `checkbox-base` | The checkbox's base wrapper. | `CoreCheckbox` |
| `checkbox-control` | Checkbox visual representation as a span. | `CoreCheckbox` |
| `checkbox-label` | The checkbox's label. | `CoreCheckbox` |
| `checkbox-visual-base` | Part who parent's the rendered checkbox as a span and its label. | `CoreCheckbox` |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-checkbox-active-border-color` | — | — | Border color of checkbox when active. | `CoreCheckbox` |
| `--zd-checkbox-active-fg-color` | — | — | Font color of checkbox when active. | `CoreCheckbox` |
| `--zd-checkbox-bg-color` | — | — | The background color of the checkbox. | `CoreCheckbox` |
| `--zd-checkbox-border-color` | — | — | Border color of checkbox. | `CoreCheckbox` |
| `--zd-checkbox-border-radius` | — | — | The border radius of the checkbox. | `CoreCheckbox` |
| `--zd-checkbox-checked-active-bg-color` | — | — | Background color when checked and active. | `CoreCheckbox` |
| `--zd-checkbox-checked-active-border-color` | — | — | Border color of checkbox when checked and active. | `CoreCheckbox` |
| `--zd-checkbox-checked-bg-color` | — | — | The background color of the checkbox when checked. | `CoreCheckbox` |
| `--zd-checkbox-checked-border-color` | — | — | Border color of checkbox when checked. | `CoreCheckbox` |
| `--zd-checkbox-checked-fg-color` | — | — | Font color of checkbox when checked. | `CoreCheckbox` |
| `--zd-checkbox-checked-hover-bg-color` | — | — | Background color when checked and hovered over. | `CoreCheckbox` |
| `--zd-checkbox-checked-hover-border-color` | — | — | Border color of checkbox when checked and hovered over. | `CoreCheckbox` |
| `--zd-checkbox-disabled-bg-color` | — | — | Background color of checkbox when disabled. | `CoreCheckbox` |
| `--zd-checkbox-disabled-border-color` | — | — | Border color of checkbox when disabled. | `CoreCheckbox` |
| `--zd-checkbox-disabled-fg-color` | — | — | Font color of checkbox when disabled. | `CoreCheckbox` |
| `--zd-checkbox-fg-color` | — | — | Font color of checkbox. | `CoreCheckbox` |
| `--zd-checkbox-hover-border-color` | — | — | Border color of checkbox while being hovered over. | `CoreCheckbox` |
| `--zd-checkbox-hover-fg-color` | — | — | Font color of checkbox when being hovered over. | `CoreCheckbox` |
| `--zd-checkbox-icon-size` | — | — | The size of the checkbox's icon. | `CoreCheckbox` |
| `--zd-checkbox-size` | — | — | The size of the checkbox. | `CoreCheckbox` |
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
