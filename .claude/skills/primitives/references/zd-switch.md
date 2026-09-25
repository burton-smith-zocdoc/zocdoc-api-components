# zd-switch

A labelled on/off toggle for a single setting.

**Class** `ZdSwitch` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-switch></zd-switch>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `checked` | `checked` | `boolean` | — | Draws the switch in a checked state. | `CoreSwitch` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
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
| `blur` | `Event` | Emitted when the control loses focus. | `CoreSwitch` |
| `change` | `Event` | Emitted when the control's checked state changes. | `CharmFormControlElement` |
| `focus` | `Event` | Emitted when the control gains focus. | `CoreSwitch` |
| `input` | `Event` | fires when the value of the element has been changed as a direct result of a user action | `CharmFormControlElement` |
| `ready` | `Event` | Emitted when the component has completed its initial render. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `checked-message` | The message to display when the toggle is checked. | `CoreSwitch` |
| `label` | The switch's label. | `CoreSwitch` |
| `unchecked-message` | The message to display when the toggle is unchecked. | `CoreSwitch` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): void` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `click(): void` | Simulates a click on the switch. | `CoreSwitch` |
| `reportValidity(): void` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `zd-form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `zd-form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `zd-form-control-help-text` | The help text container. | `CharmFormControlElement` |
| `zd-switch-base` | The component's internal wrapper. | `CoreSwitch` |
| `zd-switch-checked-message` | The message to display when the toggle is checked. | `CoreSwitch` |
| `zd-switch-control` | The switch control. | `CoreSwitch` |
| `zd-switch-label` | The switch label. | `CoreSwitch` |
| `zd-switch-thumb` | The switch position indicator. | `CoreSwitch` |
| `zd-switch-unchecked-message` | The message to display when the toggle is unchecked. | `CoreSwitch` |

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
| `--zd-charm-switch-control-active-bg-color` | — | — | The background color of the switch control when active. | `CoreSwitch` |
| `--zd-charm-switch-control-active-border-color` | — | — | The border color of the switch control when active. | `CoreSwitch` |
| `--zd-charm-switch-control-bg-color` | — | — | The background color of the switch control. | `CoreSwitch` |
| `--zd-charm-switch-control-border-color` | — | — | The border color of the switch control. | `CoreSwitch` |
| `--zd-charm-switch-control-checked-active-bg-color` | — | — | The background color of the switch control when checked and active. | `CoreSwitch` |
| `--zd-charm-switch-control-checked-active-border-color` | — | — | The border color of the switch control when checked and active. | `CoreSwitch` |
| `--zd-charm-switch-control-checked-bg-color` | — | — | The background color of the switch control when checked. | `CoreSwitch` |
| `--zd-charm-switch-control-checked-border-color` | — | — | The border color of the switch control when checked. | `CoreSwitch` |
| `--zd-charm-switch-control-checked-hover-bg-color` | — | — | The background color of the switch control when checked and hovered. | `CoreSwitch` |
| `--zd-charm-switch-control-checked-hover-border-color` | — | — | The border color of the switch control when checked and hovered. | `CoreSwitch` |
| `--zd-charm-switch-control-hover-bg-color` | — | — | The background color of the switch control when hovered. | `CoreSwitch` |
| `--zd-charm-switch-control-hover-border-color` | — | — | The border color of the switch control when hovered. | `CoreSwitch` |
| `--zd-charm-switch-control-transition` | — | — | The transition effect of the switch control. | `CoreSwitch` |
| `--zd-charm-switch-height` | — | — | The height of the switch. | `CoreSwitch` |
| `--zd-charm-switch-thumb-active-bg-color` | — | — | The background color of the switch thumb when active. | `CoreSwitch` |
| `--zd-charm-switch-thumb-bg-color` | — | — | The background color of the switch thumb. | `CoreSwitch` |
| `--zd-charm-switch-thumb-checked-active-bg-color` | — | — | The background color of the switch thumb when checked and active. | `CoreSwitch` |
| `--zd-charm-switch-thumb-checked-bg-color` | — | — | The background color of the switch thumb when checked. | `CoreSwitch` |
| `--zd-charm-switch-thumb-checked-hover-bg-color` | — | — | The background color of the switch thumb when checked and hovered. | `CoreSwitch` |
| `--zd-charm-switch-thumb-hover-bg-color` | — | — | The background color of the switch thumb when hovered. | `CoreSwitch` |
| `--zd-charm-switch-thumb-size` | — | — | The size of the thumb. | `CoreSwitch` |
| `--zd-charm-switch-thumb-transform` | — | — | The shift of the thumb along the x-axis. | `CoreSwitch` |
| `--zd-charm-switch-thumb-transition` | — | — | The transition effect of the switch thumb. | `CoreSwitch` |
| `--zd-charm-switch-width` | — | — | The width of the switch. | `CoreSwitch` |
