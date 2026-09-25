# zd-radio

A single radio button option within a group.

**Class** `ZdRadio` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-radio></zd-radio>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `size` | `'small' \| 'default' \| undefined` | — | The control's density. `small` swaps in the theme's `radio.small.*` metrics along with the smaller form-control label size. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `boolean` | `false` | Focus on the radio on page load. | `CoreRadio` |
| `checked` | `checked` | `boolean` | — | This toggles the selected status for the radio and is for use when a radio button is used outside of a radio group. When used within a radio group, this value be overridden by the radio group's value. | `CoreRadio` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the radio. | `CoreRadio` |
| `hide-label` | `hideLabel` | `boolean` | — | Hides the input label. | `CoreRadio` |
| `label` | `label` | `string` | — | The input's label. Alternatively, you can use the default slot. | `CoreRadio` |
| `readonly` | `readonly` | `boolean` | — | Makes the input readonly. | `CoreRadio` |
| `value` | `value` | `string` | — | The radio's value attribute. | `CoreRadio` |
| `vertical` | `vertical` | `boolean` | — | The layout direction of the radio. | `CoreRadio` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `Event` | Emitted when the control loses focus. | `CoreRadio` |
| `focus` | `Event` | Emitted when the control gains focus. | `CoreRadio` |
| `ready` | `Event` | Emitted when the component has completed its initial render. | `CharmElement` |
| `selected` | `Event` | Emitted when the radio is selected. | `CoreRadio` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-radio-base` | The component's internal wrapper. | `CoreRadio` |
| `zd-radio-checked-icon` | The container the wraps the checked icon. | `CoreRadio` |
| `zd-radio-control` | The radio control. | `CoreRadio` |
| `zd-radio-label` | The radio label. | `CoreRadio` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-radio-active-bg-color` | — | — | The background color of the radio control when active. | `CoreRadio` |
| `--zd-charm-radio-bg-color` | — | — | The background color of the radio control. | `CoreRadio` |
| `--zd-charm-radio-border-color` | — | — | The border color of the radio control. | `CoreRadio` |
| `--zd-charm-radio-checked-active-border-color` | — | — | The border color of the checked radio control when active. | `CoreRadio` |
| `--zd-charm-radio-checked-bg-color` | — | — | The color of the checked indicator inside the radio control. | `CoreRadio` |
| `--zd-charm-radio-checked-border-color` | — | — | The border color of the radio control when the radio is checked. | `CoreRadio` |
| `--zd-charm-radio-checked-hover-border-color` | — | — | The border color of the checked radio control when hovered. | `CoreRadio` |
| `--zd-charm-radio-control-size` | — | — | The size of the radio button. | `CoreRadio` |
| `--zd-charm-radio-disabled-bg-color` | — | — | The background color of the radio control when disabled. | `CoreRadio` |
| `--zd-charm-radio-disabled-border-color` | — | — | The border color of the radio control when disabled. | `CoreRadio` |
| `--zd-charm-radio-hover-bg-color` | — | — | The background color of the radio control when hovered. | `CoreRadio` |
| `--zd-charm-radio-indicator-size` | — | — | The size of the checked indicator inside radio control. | `CoreRadio` |
| `--zd-charm-radio-label-active-color` | — | — | The color of the radio label when active. | `CoreRadio` |
| `--zd-charm-radio-label-checked-color` | — | — | The color of the radio label when the radio is checked. | `CoreRadio` |
| `--zd-charm-radio-label-checked-hover-color` | — | — | The color of the radio label when the radio is checked and hovered. | `CoreRadio` |
| `--zd-charm-radio-label-disabled-color` | — | — | The color of the radio label when disabled. | `CoreRadio` |
| `--zd-charm-radio-label-unchecked-hover-color` | — | — | The color of the radio label when the radio is unchecked and hovered. | `CoreRadio` |
| `--zd-charm-radio-unchecked-active-border-color` | — | — | The border color of the unchecked radio control when active. | `CoreRadio` |
| `--zd-charm-radio-unchecked-hover-border-color` | — | — | The border color of the unchecked radio control when hovered. | `CoreRadio` |
