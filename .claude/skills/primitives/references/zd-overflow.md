# zd-overflow

Collapses items that no longer fit into an overflow menu.

**Class** `ZdOverflow` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-overflow></zd-overflow>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `fixed-placement` | `fixedPlacement` | `boolean` | `false` | Enable this option to prevent the overflow menu from being clipped when the component is placed inside a container with `overflow: auto\|hidden\|scroll`. | `CoreOverflow` |
| `label` | `label` | `string` | `'More options'` | Label for the icon button in the overflow menu. | `CoreOverflow` |
| `menu-position` | `menuPosition` | `'start' \| 'end' \| 'none'` | `'end'` | Location of overflow menu. Default is end. | `CoreOverflow` |
| `min` | `min` | `number` | `0` | Minimum number of values to always display, even if they overflow the container. | `CoreOverflow` |
| `overflow-direction` | `overflowDirection` | `'start' \| 'end'` | — | Side to start hiding/adding elements when collapsing/expanding. | `CoreOverflow` |
| `overflowing` | `overflowing` | `boolean` | — | Whether or not there are overflowing elements. Readonly. | `CoreOverflow` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `overflow` | `Event` | Emitted when an resize causes items to overflow or to no longer overflow. | `CoreOverflow` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `end` | End slot that can be used for static content. | `CoreOverflow` |
| `menu` | Slot that can be used to provide a custom menu for overflowed items. | `CoreOverflow` |
| `start` | Start slot that can be used for static content. | `CoreOverflow` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `isOverflowing(): boolean` | This method can be used to determine whether content is currently overflowing. | `CoreOverflow` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-overflow-base` | The component's base wrapper. | `CoreOverflow` |
| `zd-overflow-content` | The container for the default slot. | `CoreOverflow` |
| `zd-overflow-end` | The end slot. | `CoreOverflow` |
| `zd-overflow-menu` | The menu for overflowed items. | `CoreOverflow` |
| `zd-overflow-menu` | The menu for overflowed items. | `CoreOverflow` |
| `zd-overflow-menu-item` | The menu item for overflowed items. | `CoreOverflow` |
| `zd-overflow-start` | The start slot. | `CoreOverflow` |
| `zd-overflow-trigger` | The trigger button for the overflow menu. | `CoreOverflow` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-overflow-collapsing-container-display` | — | — | Sets the display property of the collapsing container. | `CoreOverflow` |
| `--zd-charm-overflow-item-gap` | — | — | Sets the gap between items in the overflow container. | `CoreOverflow` |
