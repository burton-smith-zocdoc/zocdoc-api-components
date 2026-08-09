# zd-radio

A single radio button option within a group.

**Class** `ZdRadio` — **Module** `src/components/radio/radio.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-radio></zd-radio>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'default' \| 'small' \| undefined` | — | The control's density. `small` swaps in the theme's `radio.small.*` metrics along with the smaller form-control label size. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the radio on page load. | `CoreRadio` |
| `checked` | `checked` | `boolean \| undefined` | — | This toggles the selected status for the radio and is for use when a radio button is used outside of a radio group. When used within a radio group, this value be overridden by the radio group's value. | `CoreRadio` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean \| undefined` | — | Disables the radio. | `CoreRadio` |
| `hide-label` | `hideLabel` | `boolean \| undefined` | — | Hides the input label. | `CoreRadio` |
| `label` | `label` | `string \| undefined` | — | The input's label. Alternatively, you can use the default slot. | `CoreRadio` |
| `readonly` | `readonly` | `boolean \| undefined` | — | Makes the input readonly. | `CoreRadio` |
| `value` | `value` | `string \| undefined` | — | The radio's value attribute. | `CoreRadio` |
| `vertical` | `vertical` | `boolean \| undefined` | — | The layout direction of the radio. | `CoreRadio` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `unknown` | Emitted when the control loses focus. | `CoreRadio` |
| `focus` | `unknown` | Emitted when the control gains focus. | `CoreRadio` |
| `ready` | `unknown` | Emitted when the component has completed its initial render. | `CharmElement` |
| `selected` | `unknown` | Emitted when the radio is selected. | `CoreRadio` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The radio's label. | `CoreRadio` |
