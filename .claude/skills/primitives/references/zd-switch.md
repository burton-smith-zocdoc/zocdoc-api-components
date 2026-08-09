# zd-switch

A labelled on/off toggle for a single setting.

**Class** `ZdSwitch` — **Module** `src/components/switch/switch.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-switch></zd-switch>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `checked` | `checked` | `boolean` | — | Draws the switch in a checked state. | `CoreSwitch` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the input. | `CharmFormControlElement` |
| `error-message` | `errorMessage` | `string` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `string \| undefined` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `boolean` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
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
| `blur` | `unknown` | Emitted when the control loses focus. | `CoreSwitch` |
| `change` | `unknown` | Emitted when the control's checked state changes. | `CharmFormControlElement` |
| `focus` | `unknown` | Emitted when the control gains focus. | `CoreSwitch` |
| `input` | `unknown` | fires when the value of the element has been changed as a direct result of a user action | `CharmFormControlElement` |
| `ready` | `unknown` | Emitted when the component has completed its initial render. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `checked-message` | The message to display when the toggle is checked. | `CoreSwitch` |
| `label` | The switch's label. | `CoreSwitch` |
| `unchecked-message` | The message to display when the toggle is unchecked. | `CoreSwitch` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean \| undefined` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `click(): void` | Simulates a click on the switch. | `CoreSwitch` |
| `reportValidity(): boolean \| undefined` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
