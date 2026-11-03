# zd-option-group

Labels and groups related options within a combobox.

**Class** `ZdOptionGroup` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-option-group></zd-option-group>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | — | `CharmElement` |
| `disabled` | `disabled` | `boolean` | `false` | Disables every option in the group. | `CoreOptionGroup` |
| `label` | `label` | `string` | — | The group's label, announced before its options. | `CoreOptionGroup` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `label` | The group's label. Alternatively, use the `label` property. | `CoreOptionGroup` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `label` | The group's label. | `CoreOptionGroup` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-combobox-group-gap` | — | — | The gap between option groups. | `CoreOptionGroup` |
| `--zd-charm-combobox-group-label-color` | — | — | The group label color. | `CoreOptionGroup` |
| `--zd-charm-combobox-group-label-font-size` | — | — | The group label font size. | `CoreOptionGroup` |
| `--zd-charm-combobox-group-label-font-weight` | — | — | The group label font weight. | `CoreOptionGroup` |
| `--zd-charm-combobox-group-label-line-height` | — | — | The group label line height. | `CoreOptionGroup` |
| `--zd-charm-combobox-group-label-padding-y` | — | — | The block padding within a group label. | `CoreOptionGroup` |
