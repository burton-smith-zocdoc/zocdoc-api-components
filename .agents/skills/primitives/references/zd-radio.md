# zd-radio

A single radio button option within a group.

**Class** `ZdRadio` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-radio></zd-radio>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'small' \| 'default' \| undefined` | — | The control's density. `small` swaps in the theme's `radio.small.*` metrics along with the smaller form-control label size. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CharmFocusableElement` |
| `checked` | `checked` | `boolean` | — | This toggles the selected status for the radio and is for use when a radio button is used outside of a radio group. When used within a radio group, this value be overridden by the radio group's value. | `CoreRadio` |
| `dir` | `dir` | `unknown` | — | — | `CharmElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CharmFormControlElement` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
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
| `blur` | `Event` | Emitted when the control loses focus. | `CoreRadio` |
| `change` | `Event` | fired when the user modifies the element's value | `CharmFormControlElement` |
| `focus` | `Event` | Emitted when the control gains focus. | `CoreRadio` |
| `input` | `Event` | fires when the value of the element has been changed as a direct result of a user action | `CharmFormControlElement` |
| `ready` | `Event` | Emitted when the component has completed its initial render. | `CharmElement` |
| `selected` | `Event` | Emitted when the radio is selected. | `CoreRadio` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean` | — | `CoreRadio` |
| `reportValidity(): boolean` | — | `CoreRadio` |
| `setCustomValidity(message?: string): void` | — | `CoreRadio` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |
| `radio-base` | The component's internal wrapper. | `CoreRadio` |
| `radio-checked-icon` | The container the wraps the checked icon. | `CoreRadio` |
| `radio-control` | The radio control. | `CoreRadio` |
| `radio-label` | The radio label. | `CoreRadio` |

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
| `--zd-charm-radio-active-bg-color` | — | — | The background color of the radio control when active. | `CoreRadio` |
| `--zd-charm-radio-bg-color` | — | — | The background color of the radio control. | `CoreRadio` |
| `--zd-charm-radio-border-color` | — | — | The border color of the radio control. | `CoreRadio` |
| `--zd-charm-radio-checked-active-border-color` | — | — | The border color of the checked radio control when active. | `CoreRadio` |
| `--zd-charm-radio-checked-bg-color` | — | — | The color of the checked indicator inside the radio control. | `CoreRadio` |
| `--zd-charm-radio-checked-border-color` | — | — | The border color of the radio control when the radio is checked. | `CoreRadio` |
| `--zd-charm-radio-checked-hover-border-color` | — | — | The border color of the checked radio control when hovered. | `CoreRadio` |
| `--zd-charm-radio-control-size` | — | — | The size of the radio button. | `CoreRadio` |
| `--zd-charm-radio-disabled-bg-color` | — | — | The background color of the radio control when disabled. | `CoreRadio` |
| `--zd-charm-radio-disabled-border-color` | — | — | The border color of the radio control when disabled. | `CoreRadio` |
| `--zd-charm-radio-hover-bg-color` | — | — | The background color of the radio control when hovered. | `CoreRadio` |
| `--zd-charm-radio-indicator-size` | — | — | The size of the checked indicator inside radio control. | `CoreRadio` |
| `--zd-charm-radio-label-active-color` | — | — | The color of the radio label when active. | `CoreRadio` |
| `--zd-charm-radio-label-checked-color` | — | — | The color of the radio label when the radio is checked. | `CoreRadio` |
| `--zd-charm-radio-label-checked-hover-color` | — | — | The color of the radio label when the radio is checked and hovered. | `CoreRadio` |
| `--zd-charm-radio-label-disabled-color` | — | — | The color of the radio label when disabled. | `CoreRadio` |
| `--zd-charm-radio-label-unchecked-hover-color` | — | — | The color of the radio label when the radio is unchecked and hovered. | `CoreRadio` |
| `--zd-charm-radio-unchecked-active-border-color` | — | — | The border color of the unchecked radio control when active. | `CoreRadio` |
| `--zd-charm-radio-unchecked-hover-border-color` | — | — | The border color of the unchecked radio control when hovered. | `CoreRadio` |
