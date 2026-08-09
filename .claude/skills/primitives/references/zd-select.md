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
