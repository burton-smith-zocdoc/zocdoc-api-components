# zd-menu-group

Groups related menu items under a heading.

**Class** `ZdMenuGroup` — **Module** `src/components/menu-group/menu-group.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-menu-group></zd-menu-group>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string \| undefined` | — | The heading text for the menu group. | `CoreMenuGroup` |
| `select` | `select` | `'single' \| 'multiple' \| undefined` | — | Determines if the elements inside the group are selectable as "single" (only one selected at a time) or "multiple" (checkbox behavior). | `CoreMenuGroup` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `menu-group-select` | `SelectedMenuItem` | Emitted when a menu item is selected in a group. | `CoreMenuGroup` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Default slot for menu items. | `CoreMenuGroup` |
| `heading` | Slot for the group heading. | `CoreMenuGroup` |
