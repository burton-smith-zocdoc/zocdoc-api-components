# zd-radio-group

Groups radio buttons for single-selection choices.

**Class** `ZdRadioGroup` — **Module** `src/components/radio-group/radio-group.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-radio-group></zd-radio-group>
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
| `layout` | `layout` | `'horizontal' \| 'vertical' \| 'horizontal-stacked' \| undefined` | — | How the radio items are laid out in the group. | `CoreRadioGroup` |
| `name` | `name` | `string \| undefined` | — | The input's name attribute. | `CharmFormControlElement` |
| `readonly` | `readonly` | `boolean` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `boolean` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `ValidityState` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `unknown` | Emitted when the radio group loses focus. | `CoreRadioGroup` |
| `change` | `unknown` | Emitted when the radio group's selected value changes. | `CharmFormControlElement` |
| `focus` | `unknown` | Emitted when the radio group gains focus. | `CoreRadioGroup` |
| `input` | `unknown` | fires when the value of the element has been changed as a direct result of a user action | `CharmFormControlElement` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The default slot where radio controls are placed. | `CoreRadioGroup` |
| `help-text` | Help text that describes how to use the input. Alternatively, you can use the `help-text` attribute. | `CoreRadioGroup` |
| `label` | The radio group label. Required for proper accessibility. Alternatively, you can use the `label` attribute. | `CoreRadioGroup` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean \| undefined` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): boolean` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
