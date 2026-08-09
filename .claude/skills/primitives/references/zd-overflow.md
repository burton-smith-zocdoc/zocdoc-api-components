# zd-overflow

Collapses items that no longer fit into an overflow menu.

**Class** `ZdOverflow` — **Module** `src/components/overflow/overflow.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-overflow></zd-overflow>
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
| _(default)_ | Default slot that should contain multiple elements. These elements will be hidden or shown during resize. | `CoreOverflow` |
| `end` | End slot that can be used for static content. | `CoreOverflow` |
| `menu` | Slot that can be used to provide a custom menu for overflowed items. | `CoreOverflow` |
| `start` | Start slot that can be used for static content. | `CoreOverflow` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `isOverflowing(): void` | This method can be used to determine whether content is currently overflowing. | `CoreOverflow` |
