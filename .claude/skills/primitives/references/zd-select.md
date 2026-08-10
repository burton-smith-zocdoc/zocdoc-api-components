# zd-select

A dropdown select field for choosing from options.

Note that unlike the other form controls this has no `size` prop for density.
Charm's select already declares `size?: number` for the native `<select size>`
attribute (how many options to show at once), so the name is taken. Consumers
that need the compact treatment can set `--zd-form-control-input-height` and
`--zd-form-control-padding-y` directly.

**Class** `ZdSelect` — **Module** `src/components/select/select.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-select></zd-select>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the input. | `CharmFormControlElement` |
| `error-message` | `errorMessage` | `string` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `string \| undefined` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `boolean` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `invalid` | `invalid` | `boolean` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `string \| undefined` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `'end' \| 'start' \| 'top' \| undefined` | — | The position of the label | `CharmFormControlElement` |
| `multiple` | `multiple` | `boolean` | `false` | This Boolean attribute indicates that multiple options can be selected in the list. * | `CoreSelect` |
| `name` | `name` | `string \| undefined` | — | The input's name attribute. | `CharmFormControlElement` |
| `readonly` | `readonly` | `boolean` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `boolean` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `size` | `size` | `number \| undefined` | — | This attribute represents the number of rows in the list that should be visible at one time * | `CoreSelect` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `ValidityState` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `unknown` | Custom event that indicates a new selection has been made through e.target.value. | `CharmFormControlElement` |
| `input` | `unknown` | Custom event that indicates a new selection has been made through e.target.value. | `CharmFormControlElement` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | A hidden slot for the options provided to the control. | `CoreSelect` |
| `end` | A slot for content to be placed at the end of the select. | `CoreSelect` |
| `label` | A placeholder for the select's label. | `CoreSelect` |
| `start` | A slot for content to be placed at the start of the select. | `CoreSelect` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean \| undefined` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): boolean \| undefined` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `end` | Container for the end slot content. | `CoreSelect` |
| `form-control-error-text` | The error message container. | `CharmFormControlElement` |
| `form-control-error-text-icon` | The error message icon. | `CharmFormControlElement` |
| `form-control-error-text-message` | The error message text. | `CharmFormControlElement` |
| `form-control-help-text` | The help text container. | `CharmFormControlElement` |
| `select-base` | The component's base wrapper. | `CoreSelect` |
| `select-control` | The component's select control. | `CoreSelect` |
| `select-control-wrapper` | The component's select control wrapper. | `CoreSelect` |
| `select-icon` | The component's select icon. | `CoreSelect` |
| `select-label` | The component's label. | `CoreSelect` |
| `start` | Container for the start slot content. | `CoreSelect` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-select-icon-size` | — | — | Determines the chevron size. | `CoreSelect` |
| `--zd-select-option-bg-color` | — | — | Determines the background color of the options. | `CoreSelect` |
| `--zd-select-option-fg-color` | — | — | Determines the foreground color of the options. | `CoreSelect` |
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
