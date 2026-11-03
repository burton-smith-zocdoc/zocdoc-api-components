# zd-option

A single choice within a combobox or option group.

**Class** `ZdOption` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-option></zd-option>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `current` | `current` | `boolean` | `false` | Indicates that the option is the active option of the parent combobox. Managed by the parent combobox. | `CoreOption` |
| `dir` | `dir` | `unknown` | — | — | `CharmElement` |
| `disabled` | `disabled` | `boolean` | `false` | Disables the option so it cannot be selected or focused. | `CoreOption` |
| `label` | `label` | `string` | — | A plain-text label used for filtering, typeahead, and selected-value display. Defaults to the text content. | `CoreOption` |
| `selected` | `selected` | `boolean` | `false` | Indicates that the option is selected. Managed by the parent combobox. | `CoreOption` |
| `value` | `value` | `string` | — | The value submitted with the form when this option is selected. Defaults to the option's text content. | `CoreOption` |
| — | `resolvedValue` | `string` | — | The value used by the parent component, falling back to the label when no value is set. | `CoreOption` |
| — | `textLabel` | `string` | — | The option's text content, used as a fallback label. Excludes the `start` and `end` slotted content. | `CoreOption` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `end` | Decorative content placed after the label, such as an icon. | `CoreOption` |
| `start` | Decorative content placed before the label, such as an icon. | `CoreOption` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `base` | The option row. | `CoreOption` |
| `check` | The checkmark shown for selected options. | `CoreOption` |
| `end` | Container for the end content. | `CoreOption` |
| `label` | The option's label. | `CoreOption` |
| `start` | Container for the start content. | `CoreOption` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-combobox-option-active-bg-color` | — | — | The background color of the active option. | `CoreOption` |
| `--zd-charm-combobox-option-bg-color` | — | — | The background color of an option. | `CoreOption` |
| `--zd-charm-combobox-option-border-radius` | — | — | The border radius of an option. | `CoreOption` |
| `--zd-charm-combobox-option-check-color` | — | — | The color of the selected option checkmark. | `CoreOption` |
| `--zd-charm-combobox-option-check-size` | — | — | The size of the selected option checkmark. | `CoreOption` |
| `--zd-charm-combobox-option-disabled-fg-color` | — | — | The foreground color of a disabled option. | `CoreOption` |
| `--zd-charm-combobox-option-fg-color` | — | — | The foreground color of an option. | `CoreOption` |
| `--zd-charm-combobox-option-hover-bg-color` | — | — | The background color of a hovered option. | `CoreOption` |
| `--zd-charm-combobox-option-padding-x` | — | — | The inline padding within an option. | `CoreOption` |
| `--zd-charm-combobox-option-padding-y` | — | — | The block padding within an option. | `CoreOption` |
| `--zd-charm-combobox-option-selected-bg-color` | — | — | The background color of a selected option. | `CoreOption` |
