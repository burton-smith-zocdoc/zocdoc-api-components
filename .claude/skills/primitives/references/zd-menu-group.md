# zd-menu-group

Groups related menu items under a heading.

**Class** `ZdMenuGroup` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-menu-group></zd-menu-group>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string` | — | The heading text for the menu group. | `CoreMenuGroup` |
| `select` | `select` | `'single' \| 'multiple'` | — | Determines if the elements inside the group are selectable as "single" (only one selected at a time) or "multiple" (checkbox behavior). | `CoreMenuGroup` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `menu-group-select` | `Event` | Emitted when a menu item is selected in a group. | `CoreMenuGroup` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `heading` | Slot for the group heading. | `CoreMenuGroup` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-menu-group-base` | The base wrapper for the menu group. | `CoreMenuGroup` |
| `zd-menu-group-heading` | The heading element for the menu group. | `CoreMenuGroup` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-menu-group-heading-line-height` | — | — | The line height for the menu group header. | `CoreMenuGroup` |
| `--zd-charm-menu-group-heading-margin` | — | — | The margin for the menu group header. | `CoreMenuGroup` |
| `--zd-charm-menu-group-heading-padding-x` | — | — | The x padding for the menu group header. | `CoreMenuGroup` |
| `--zd-charm-menu-group-heading-padding-y` | — | — | The y padding for the menu group header. | `CoreMenuGroup` |
| `--zd-charm-menu-group-heading-size` | — | — | The font size for the menu group header. | `CoreMenuGroup` |
| `--zd-charm-menu-group-heading-weight` | — | — | The font weight for the menu group header. | `CoreMenuGroup` |
