# zd-checkbox-group

Groups checkboxes for multiple-selection choices with a shared label, help text, and validation.

**Class** `ZdCheckboxGroup` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-checkbox-group></zd-checkbox-group>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CharmFormControlElement` |
| `disabled` | `disabled` | `unknown` | — | Disables the input. | `CoreCheckboxGroup` |
| `error-message` | `errorMessage` | `unknown` | — | The input's error message. | `CoreCheckboxGroup` |
| `help-text` | `helpText` | `unknown` | — | The input's help text. Alternatively, you can use the help-text slot. | `CoreCheckboxGroup` |
| `hide-label` | `hideLabel` | `unknown` | `false` | Hides the input label and help text. | `CoreCheckboxGroup` |
| `invalid` | `invalid` | `unknown` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CoreCheckboxGroup` |
| `label` | `label` | `unknown` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CoreCheckboxGroup` |
| `label-position` | `labelPosition` | `unknown` | — | The position of the label | `CoreCheckboxGroup` |
| `layout` | `layout` | `'horizontal' \| 'vertical' \| 'horizontal-stacked'` | — | How the checkboxes are laid out in the group. | `CoreCheckboxGroup` |
| `listbox` | `listbox` | `boolean` | `false` | Presents the choices as a single-tab-stop listbox with arrow-key navigation. | `CoreCheckboxGroup` |
| `name` | `name` | `unknown` | — | The input's name attribute. | `CoreCheckboxGroup` |
| `readonly` | `readonly` | `unknown` | — | Makes the input readonly. | `CoreCheckboxGroup` |
| `required` | `required` | `unknown` | `false` | Makes the input a required field. | `CoreCheckboxGroup` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| `value-delimiter` | `valueDelimiter` | `string` | — | The delimiter used to parse and serialize `value`. Defaults to a comma. | `CoreCheckboxGroup` |
| — | `dir` | `unknown` | — | — | `CharmElement` |
| — | `validationMessage` | `string` | — | Gets the current validation message, if one exists. | `CoreCheckboxGroup` |
| — | `validity` | `ValidityState` | — | Gets group validity, where a required group must have at least one selected checkbox. | `CoreCheckboxGroup` |
| — | `valueAsArray` | `string[]` | — | The checkbox group's selected values as an array. | `CoreCheckboxGroup` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `Event` | Emitted when the group loses focus. | `CoreCheckboxGroup` |
| `change` | `Event` | Emitted when the group's selected values change. | `CoreCheckboxGroup` |
| `focus` | `Event` | Emitted when the group gains focus. | `CoreCheckboxGroup` |
| `input` | `Event` | Emitted when the group receives user input. | `CoreCheckboxGroup` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `help-text` | Help text that describes how to use the group. Alternatively, use the `help-text` property. | `CoreCheckboxGroup` |
| `label` | The checkbox group label. Required for proper accessibility. Alternatively, use the `label` property. | `CoreCheckboxGroup` |
| `required-text` | Localized required-state text announced with the group label. | `CoreCheckboxGroup` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean` | Checks for validity but doesn't report a validation message when invalid. | `CoreCheckboxGroup` |
| `reportValidity(): boolean` | Checks for validity and sets the browser's validation message when the group is invalid. | `CoreCheckboxGroup` |
| `setCustomValidity(message?: string): void` | — | `CoreCheckboxGroup` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `checkbox-group-base` | The component's internal fieldset. | `CoreCheckboxGroup` |
| `checkbox-group-checkboxes` | Wrapper around the default slot. | `CoreCheckboxGroup` |
| `checkbox-group-help-text` | The help text's wrapper. | `CoreCheckboxGroup` |
| `checkbox-group-label` | The checkbox group's label. | `CoreCheckboxGroup` |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-checkbox-group-checkbox-gap` | — | — | The gap between checkboxes. | `CoreCheckboxGroup` |
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
