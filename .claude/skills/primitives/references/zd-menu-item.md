# zd-menu-item

A single selectable action inside a menu.

**Class** `ZdMenuItem` — **Module** `src/components/menu-item/menu-item.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-menu-item></zd-menu-item>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `checked` | `checked` | `boolean \| undefined` | — | Indicates whether the menu item is checked. | `CoreMenuItem` |
| `current` | `current` | `'page' \| 'step' \| 'location' \| 'date' \| 'time' \| 'true' \| 'false' \| null \| undefined` | — | Sets `aria-current` on the internal link. | `CoreMenuItem` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean \| undefined` | — | Disables the emitted click event. | `CoreMenuItem` |
| `expanded` | `expanded` | `boolean \| undefined` | — | Expands the menu item to reveal a submenu. | `CoreMenuItem` |
| `href` | `href` | `string \| undefined` | — | When set, the underlying menu item will be rendered as an `<a>` with this `href` instead of a `<span>`. | `CoreMenuItem` |
| `role` | `role` | `string \| null` | `null` | The role of the menu item. | `CoreMenuItem` |
| `sub-menu-placement` | `subMenuPlacement` | `string` | `'right-start'` | Controls the placement of the submenu popup. | `CoreMenuItem` |
| `target` | `target` | `'_blank' \| '_parent' \| '_self' \| '_top' \| (string & {}) \| undefined` | — | Tells the browser where to open the link. Only used when `href` is set. | `CoreMenuItem` |
| — | `hasSubmenu` | `boolean` | `false` | Indicates whether the menu item contains a submenu. | `CoreMenuItem` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `expanded-change` | `unknown` | Emitted when the item's expanded state changes. | `CoreMenuItem` |
| `menu-item-change` | `unknown` | Emitted when the menu item is change. | `CoreMenuItem` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The menu item's content. | `CoreMenuItem` |
| `anchor` | The anchor element when the menu item has a submenu. | `CoreMenuItem` |
| `checkbox-indicator` | The checkbox indicator icon. | `CoreMenuItem` |
| `end` | A presentational suffix icon or similar element. | `CoreMenuItem` |
| `radio-indicator` | The radio indicator icon. | `CoreMenuItem` |
| `start` | A presentational prefix icon or similar element. | `CoreMenuItem` |
| `trigger` | The trigger element when the menu item has a submenu. | `CoreMenuItem` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `click(): void` | Overrides the default click action for the menu item. | `CoreMenuItem` |
