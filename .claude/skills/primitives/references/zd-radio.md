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

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `radio-base` | The component's internal wrapper. | `CoreRadio` |
| `radio-checked-icon` | The container the wraps the checked icon. | `CoreRadio` |
| `radio-control` | The radio control. | `CoreRadio` |
| `radio-label` | The radio label. | `CoreRadio` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-radio-active-bg-color` | — | — | The background color of the radio control when active. | `CoreRadio` |
| `--zd-radio-checked-active-border-color` | — | — | The border color of the checked radio control when active. | `CoreRadio` |
| `--zd-radio-unchecked-active-border-color` | — | — | The border color of the unchecked radio control when active. | `CoreRadio` |
| `--zd-radio-bg-color` | — | — | The background color of the radio control. | `CoreRadio` |
| `--zd-radio-border-color` | — | — | The border color of the radio control. | `CoreRadio` |
| `--zd-radio-checked-bg-color` | — | — | The color of the checked indicator inside the radio control. | `CoreRadio` |
| `--zd-radio-checked-border-color` | — | — | The border color of the radio control when the radio is checked. | `CoreRadio` |
| `--zd-radio-control-size` | — | — | The size of the radio button. | `CoreRadio` |
| `--zd-radio-disabled-bg-color` | — | — | The background color of the radio control when disabled. | `CoreRadio` |
| `--zd-radio-disabled-border-color` | — | — | The border color of the radio control when disabled. | `CoreRadio` |
| `--zd-radio-hover-bg-color` | — | — | The background color of the radio control when hovered. | `CoreRadio` |
| `--zd-radio-checked-hover-border-color` | — | — | The border color of the checked radio control when hovered. | `CoreRadio` |
| `--zd-radio-unchecked-hover-border-color` | — | — | The border color of the unchecked radio control when hovered. | `CoreRadio` |
| `--zd-radio-indicator-size` | — | — | The size of the checked indicator inside radio control. | `CoreRadio` |
| `--zd-radio-label-active-color` | — | — | The color of the radio label when active. | `CoreRadio` |
| `--zd-radio-label-checked-color` | — | — | The color of the radio label when the radio is checked. | `CoreRadio` |
| `--zd-radio-label-checked-hover-color` | — | — | The color of the radio label when the radio is checked and hovered. | `CoreRadio` |
| `--zd-radio-label-disabled-color` | — | — | The color of the radio label when disabled. | `CoreRadio` |
| `--zd-radio-label-unchecked-hover-color` | — | — | The color of the radio label when the radio is unchecked and hovered. | `CoreRadio` |
