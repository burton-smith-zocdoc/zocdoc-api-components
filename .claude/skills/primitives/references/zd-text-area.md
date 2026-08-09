# zd-text-area

A multi-line text field with label and validation support.

**Class** `ZdTextArea` — **Module** `src/components/text-area/text-area.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-text-area></zd-text-area>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `resize` | `resize` | `'none' \| 'horizontal' \| 'vertical' \| 'both' \| undefined` | `'vertical'` | How the control can be resized. Charm leaves this unset (the browser default is `both`); Zocdoc's text area only grows vertically so it can't be dragged out of a form's column. |
| `rows` | `rows` | `number` | `6` | Number of visible rows. Charm defaults to 4; Zocdoc's text area is 6 rows. |
| `size` | `size` | `'default' \| 'small' \| undefined` | — | The control's density. `small` swaps in the theme's `formControl.small.*` metrics. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autocapitalize` | `autocapitalize` | `'off' \| 'none' \| 'on' \| 'sentences' \| 'words' \| 'characters'` | `'none'` | Controls whether and how text input is automatically capitalized as it is entered/edited by the user. | `CoreTextArea` |
| `autocomplete` | `autocomplete` | `'off' \| 'on' \| undefined` | — | This attribute specifies whether the browser can automatically fill in the control's value. | `CoreTextArea` |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the input on page load. | `CharmFocusableElement` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the input. | `CharmFormControlElement` |
| `enterkeyhint` | `enterkeyhint` | `'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send' \| undefined` | — | Used to customize the label or icon of the Enter key on virtual keyboards. | `CoreTextArea` |
| `error-message` | `errorMessage` | `string` | — | The input's error message. | `CharmFormControlElement` |
| `help-text` | `helpText` | `string \| undefined` | — | The input's help text. Alternatively, you can use the help-text slot. | `CharmFormControlElement` |
| `hide-label` | `hideLabel` | `boolean` | `false` | Hides the input label and help text. | `CharmFormControlElement` |
| `inputmode` | `inputmode` | `'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' \| undefined` | — | Hints at the type of data that might be entered by the user while editing the element or its contents. | `CoreTextArea` |
| `invalid` | `invalid` | `boolean` | `false` | This will be true when the control is in an invalid state. Validity is determined by the `required` prop. | `CharmFormControlElement` |
| `label` | `label` | `string \| undefined` | — | The input's label. If you need to display HTML, you can use the `label` slot instead. | `CharmFormControlElement` |
| `label-position` | `labelPosition` | `'end' \| 'start' \| 'top' \| undefined` | — | The position of the label | `CharmFormControlElement` |
| `maxlength` | `maxlength` | `number \| undefined` | — | The maximum length of input that will be considered valid. | `CoreTextArea` |
| `minlength` | `minlength` | `number \| undefined` | — | The minimum length of input that will be considered valid. | `CoreTextArea` |
| `name` | `name` | `string \| undefined` | — | The input's name attribute. | `CharmFormControlElement` |
| `placeholder` | `placeholder` | `string \| undefined` | — | The textarea's placeholder text. | `CoreTextArea` |
| `readonly` | `readonly` | `boolean` | — | Makes the input readonly. | `CharmFormControlElement` |
| `required` | `required` | `boolean` | `false` | Makes the input a required field. | `CharmFormControlElement` |
| `value` | `value` | `string` | — | The input's value attribute. | `CharmFormControlElement` |
| — | `validationMessage` | `unknown` | — | Gets the current validation message, if one exists. (readonly) | `CharmFormControlElement` |
| — | `validity` | `ValidityState` | — | Gets the validity of the input. (readonly) | `CharmFormControlElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `unknown` | Emitted when the control loses focus. | `CoreTextArea` |
| `change` | `unknown` | Emitted when an alteration to the control's value is committed by the user. | `CharmFormControlElement` |
| `focus` | `unknown` | Emitted when the control gains focus. | `CoreTextArea` |
| `input` | `unknown` | Emitted when the control receives input and its value changes. | `CharmFormControlElement` |
| `keydown` | `unknown` | Emitted when a key is pressed down while the control is focused. | `CoreTextArea` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `checkValidity(): boolean \| undefined` | Checks for validity but doesn't report a validation message when invalid. | `CharmFormControlElement` |
| `reportValidity(): boolean \| undefined` | Checks for validity and shows the browser's validation message if the control is invalid. | `CharmFormControlElement` |
| `setCustomValidity(message: unknown): void` | Sets a custom validation message. | `CharmFormControlElement` |
