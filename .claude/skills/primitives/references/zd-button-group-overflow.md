# zd-button-group-overflow

A button group that moves buttons into a menu when space runs out.

**Class** `ZdButtonGroupOverflow` — **Module** `src/components/button-group-overflow/button-group-overflow.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-button-group-overflow></zd-button-group-overflow>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `fixed-placement` | `fixedPlacement` | `boolean` | `false` | Enable this option to prevent the overflow menu from being clipped when the component is placed inside a container with `overflow: auto\|hidden\|scroll`. | `CoreOverflow` |
| `label` | `label` | `string` | `'More options'` | Label for the icon button in the overflow menu. | `CoreOverflow` |
| `menu-position` | `menuPosition` | `'start' \| 'end' \| 'none'` | `'end'` | Location of overflow menu. Default is end. | `CoreOverflow` |
| `min` | `min` | `number` | `0` | Minimum number of values to always display, even if they overflow the container. | `CoreOverflow` |
| `overflow-direction` | `overflowDirection` | `'start' \| 'end' \| undefined` | — | Side to start hiding/adding elements when collapsing/expanding. | `CoreOverflow` |
| `overflowing` | `overflowing` | `unknown` | — | Whether or not there are overflowing elements. Readonly. (readonly) | `CoreOverflow` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `overflow` | `unknown` | Emitted when an resize causes items to overflow or to no longer overflow. | `CoreOverflow` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Elements to display in the button group with overflow capability. | `CoreOverflow` |
| `end` | End slot that can be used for static content. | `CoreOverflow` |
| `menu` | Slot that can be used to provide a custom menu for overflowed items. | `CoreOverflow` |
| `start` | Start slot that can be used for static content. | `CoreOverflow` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `isOverflowing(): void` | This method can be used to determine whether content is currently overflowing. | `CoreOverflow` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `overflow-base` | The component's base wrapper. | `CoreOverflow` |
| `overflow-content` | The container for the default slot. | `CoreOverflow` |
| `overflow-end` | The end slot. | `CoreOverflow` |
| `overflow-menu` | The menu for overflowed items. | `CoreOverflow` |
| `overflow-menu-item` | The menu item for overflowed items. | `CoreOverflow` |
| `overflow-start` | The start slot. | `CoreOverflow` |
| `overflow-trigger` | The trigger button for the overflow menu. | `CoreOverflow` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-overflow-item-gap` | — | — | Sets the gap between items in the overflow container. | `CoreOverflow` |
| `--zd-overflow-collapsing-container-display` | — | — | Sets the display property of the collapsing container. | `CoreOverflow` |
