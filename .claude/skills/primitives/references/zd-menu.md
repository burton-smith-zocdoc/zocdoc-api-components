# zd-menu

A popup menu of actions anchored to a trigger.

**Class** `ZdMenu` — **Module** `src/components/menu/menu.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-menu></zd-menu>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `fixed-placement` | `fixedPlacement` | `boolean` | `false` | Prevents the menu from being clipped when the component is placed inside a container with `overflow` of 'auto', 'hidden' , or 'scroll'. | `CoreMenu` |
| `open` | `open` | `boolean` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `placement` | `placement` | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'start' \| 'start-top' \| 'start-bottom' \| 'end' \| 'end-top' \| 'end-bottom'` | `'bottom-start'` | The placement of the menu. | `CoreMenu` |
| — | `popup` | `unknown` | — | — | `CoreMenu` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `menu-after-hide` | `unknown` | Emitted after the menu content closes and transitions are complete. | `CoreMenu` |
| `menu-after-show` | `unknown` | Emitted after the menu content is shown and transitions are complete. | `CoreMenu` |
| `menu-hide` | `unknown` | Emitted when the menu content closes. | `CoreMenu` |
| `menu-request-close` | `MenuRequestCloseEvent` | Emitted when the user attempts to close the menu. | `CoreMenu` |
| `menu-show` | `unknown` | Emitted when the menu content is shown. | `CoreMenu` |
| `ready` | `unknown` | Emitted when the component has completed its initial render. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The menu items. | `CoreMenu` |
| `trigger` | The element which should toggle the menu. | `CoreMenu` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `getItems(): Array<HTMLElement>` | Gets the menu items. | `CoreMenu` |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |
