# zd-menu

A popup menu of actions anchored to a trigger.

**Class** `ZdMenu` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-menu></zd-menu>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `fixed-placement` | `fixedPlacement` | `boolean` | `false` | Prevents the menu from being clipped when the component is placed inside a container with `overflow` of 'auto', 'hidden' , or 'scroll'. | `CoreMenu` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `placement` | `placement` | `'start' \| 'end' \| 'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'start-top' \| 'start-bottom' \| 'end-top' \| 'end-bottom'` | `'bottom-start'` | The placement of the menu. | `CoreMenu` |
| — | `popup` | `CorePopup \| undefined` | — | — | `CoreMenu` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `menu-after-hide` | `Event` | Emitted after the menu content closes and transitions are complete. | `CoreMenu` |
| `menu-after-show` | `Event` | Emitted after the menu content is shown and transitions are complete. | `CoreMenu` |
| `menu-hide` | `Event` | Emitted when the menu content closes. | `CoreMenu` |
| `menu-request-close` | `Event` | Emitted when the user attempts to close the menu. | `CoreMenu` |
| `menu-show` | `Event` | Emitted when the menu content is shown. | `CoreMenu` |
| `ready` | `Event` | Emitted when the component has completed its initial render. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `trigger` | The element which should toggle the menu. | `CoreMenu` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `getItems(): Array<HTMLElement>` | Gets the menu items. | `CoreMenu` |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-menu-popup` | The popup element that positions the menu. | `CoreMenu` |
| `zd-menu-popup-base` | The menu panel: background, border and shadow. | `CoreMenu` |
| `zd-menu-popup-dialog` | The popup's own positioned container. | `CoreMenu` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-menu-bg-color` | — | — | The background color of the menu. | `CoreMenu` |
| `--zd-charm-menu-border-color` | — | — | The border color of the menu. | `CoreMenu` |
| `--zd-charm-menu-border-radius` | — | — | The border radius of the menu. | `CoreMenu` |
| `--zd-charm-menu-border-style` | — | — | The border style of the menu. | `CoreMenu` |
| `--zd-charm-menu-border-width` | — | — | The border width of the menu. | `CoreMenu` |
| `--zd-charm-menu-max-width` | — | — | The maximum width of the menu. | `CoreMenu` |
| `--zd-charm-menu-min-width` | — | — | The minimum width of the menu. | `CoreMenu` |
| `--zd-charm-menu-popup-padding` | — | — | The padding to apply to the menu popup. | `CoreMenu` |
| `--zd-charm-menu-shadow` | — | — | The shadow of the menu. | `CoreMenu` |
| `--zd-charm-menu-transition` | — | — | The transition of the menu. | `CoreMenu` |
| `--zd-charm-menu-width` | — | — | The width of the menu. | `CoreMenu` |
| `--zd-charm-menu-z-index` | — | — | The z-index of the menu. | `CoreMenu` |
