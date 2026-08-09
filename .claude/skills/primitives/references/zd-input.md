# zd-input

A text input field with label and validation support.

**Class** `ZdInput` — **Module** `src/components/input/input.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-input></zd-input>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'default' \| 'small' \| undefined` | — | The control's density. `small` swaps in the theme's `formControl.small.*` metrics. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autocapitalize` | `autocapitalize` | `'off' \| 'none' \| 'on' \| 'sentences' \| 'words' \| 'characters'` | `'off'` | Controls whether and how text input is automatically capitalized as it is entered/edited by the user. | `CoreInput` |
| `autocomplete` | `autocomplete` | `string \| undefined` | — | Permission the user agent has to provide automated assistance in filling out form field values and the type of information expected in the field. | `CoreInput` |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the input. | `CharmFormControlElement` |
| `enterkeyhint` | `enterkeyhint` | `'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| undefined` | — | Used to customize the label or icon of the Enter key on virtual keyboards. | `CoreInput` |
| `error-message` | `errorMessage` | `string` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `string \| undefined` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `boolean` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `inputmode` | `inputmode` | `'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' \| undefined` | — | Hints at the type of data that might be entered by the user while editing the element or its contents. | `CoreInput` |
| `invalid` | `invalid` | `boolean` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `string \| undefined` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `'end' \| 'start' \| 'top' \| undefined` | — | The position of the label | `CharmFormControlElement` |
| `max` | `max` | `number \| undefined` | — | The input's max attribute. | `CoreInput` |
| `maxlength` | `maxlength` | `number \| undefined` | — | The input's maxlength attribute. | `CoreInput` |
| `min` | `min` | `number \| undefined` | — | The input's min attribute. | `CoreInput` |
| `minlength` | `minlength` | `number \| undefined` | — | The input's minlength attribute. | `CoreInput` |
| `name` | `name` | `string \| undefined` | — | The input's name attribute. | `CharmFormControlElement` |
| `pattern` | `pattern` | `string \| undefined` | — | A pattern to validate input against. | `CoreInput` |
| `placeholder` | `placeholder` | `string \| undefined` | — | The input's placeholder text. | `CoreInput` |
| `readonly` | `readonly` | `boolean` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `boolean` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `spellcheck` | `spellcheck` | `boolean` | `false` | Enables spell checking on the input. | `CoreInput` |
| `step` | `step` | `number \| undefined` | — | The input's step attribute. | `CoreInput` |
| `type` | `type` | `'number' \| 'date' \| 'datetime-local' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'text' \| 'time' \| 'url' \| 'range' \| undefined` | — | — | `CoreInput` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `ValidityState` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |
| — | `valueAsDate` | `unknown` | — | Gets or sets the current value as a `Date` object. Only valid when `type` is `date`. | `CoreInput` |
| — | `valueAsNumber` | `unknown` | — | Gets or sets the current value as a number. | `CoreInput` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `change` | `unknown` | Emitted when an alteration to the control's value is committed by the user. | `CharmFormControlElement` |
| `input` | `unknown` | Emitted when the value is being changed by the user. | `CharmFormControlElement` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The options in the datalist. | `CoreInput` |
| `end` | A presentational suffix icon or similar element. | `CoreInput` |
| `label` | The input's label. Alternatively, you can use the label prop. | `CoreInput` |
| `start` | A presentational prefix icon or similar element. | `CoreInput` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean \| undefined` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): boolean \| undefined` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
