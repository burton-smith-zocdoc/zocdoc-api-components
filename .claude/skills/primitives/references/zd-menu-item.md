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

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `menu-item-base` | The control's base. | `CoreMenuItem` |
| `menu-item-checkbox` | The control's checkbox. | `CoreMenuItem` |
| `menu-item-checkbox-container` | The control's checkbox container. | `CoreMenuItem` |
| `menu-item-checkbox-icon` | The control's checkbox icon. | `CoreMenuItem` |
| `menu-item-radio` | The control's radio. | `CoreMenuItem` |
| `menu-item-radio-container` | The control's radio container. | `CoreMenuItem` |
| `menu-item-radio-indicator` | The control's radio indicator. | `CoreMenuItem` |
| `menu-item-submenu-item-icon` | The control's submenu icon. | `CoreMenuItem` |
| `menu-item-submenu-item-icon-expanded` | The control's submenu icon when expanded. | `CoreMenuItem` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-menu-item-active-bg-color` | — | — | Determines the background color when active. | `CoreMenuItem` |
| `--zd-menu-item-active-border-color` | — | — | Determines the border color when active. | `CoreMenuItem` |
| `--zd-menu-item-active-fg-color` | — | — | Determines the foreground color when active. | `CoreMenuItem` |
| `--zd-menu-item-bg-color` | — | — | Determines the background color. | `CoreMenuItem` |
| `--zd-menu-item-border-color` | — | — | Determines the border color. | `CoreMenuItem` |
| `--zd-menu-item-border-radius` | — | — | Determines the border radius of the menu item. | `CoreMenuItem` |
| `--zd-menu-item-disabled-bg-color` | — | — | Determines the background color when disabled. | `CoreMenuItem` |
| `--zd-menu-item-disabled-border-color` | — | — | Determines the border color when disabled. | `CoreMenuItem` |
| `--zd-menu-item-disabled-fg-color` | — | — | Determines the foreground color when disabled. | `CoreMenuItem` |
| `--zd-menu-item-fg-color` | — | — | Determines the foreground color. | `CoreMenuItem` |
| `--zd-menu-item-focus-outline-color` | — | — | Determines the outline color when focused. | `CoreMenuItem` |
| `--zd-menu-item-focus-outline-offset` | — | — | Determines the outline offset when focused. | `CoreMenuItem` |
| `--zd-menu-item-hover-bg-color` | — | — | Determines the background color when hovered. | `CoreMenuItem` |
| `--zd-menu-item-hover-border-color` | — | — | Determines the border color when hovered. | `CoreMenuItem` |
| `--zd-menu-item-hover-fg-color` | — | — | Determines the foreground color when hovered. | `CoreMenuItem` |
| `--zd-menu-item-input-container-width` | — | — | Determines the width of the input container. | `CoreMenuItem` |
| `--zd-menu-item-input-hover-bg-color` | — | — | Determines the background color of the input container when hovered. | `CoreMenuItem` |
| `--zd-menu-item-input-size` | — | — | Determines the size of the input (checkbox or radio). | `CoreMenuItem` |
| `--zd-menu-item-margin-x` | — | — | Determines the inline margin of the menu item. | `CoreMenuItem` |
| `--zd-menu-item-padding-x` | — | — | Determines list item's inline padding. | `CoreMenuItem` |
| `--zd-menu-item-padding-y` | — | — | Determines list item's block padding. | `CoreMenuItem` |
| `--zd-menu-item-radio-active-bg-color` | — | — | Determines the background color of the radio indicator when active. | `CoreMenuItem` |
| `--zd-menu-item-radio-bg-color` | — | — | Determines the background color of the radio indicator. | `CoreMenuItem` |
| `--zd-menu-item-radio-hover-border-color` | — | — | Determines the border color of the radio indicator when hovered. | `CoreMenuItem` |
| `--zd-menu-item-submenu-icon-rotation` | — | — | Determines the rotation of the submenu icon on expanded. | `CoreMenuItem` |
| `--zd-menu-item-submenu-icon-size` | — | — | Determines the size of the submenu icon. | `CoreMenuItem` |
