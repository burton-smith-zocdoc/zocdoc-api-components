# zd-breadcrumb

Shows the hierarchy leading to the current page.

**Class** `ZdBreadcrumb` — **Module** `src/components/breadcrumb/breadcrumb.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-breadcrumb></zd-breadcrumb>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `label` | `label` | `string \| undefined` | `'breadcrumb'` | The `aria-label` for the entire breadcrumb. Will not be displayed, but is required for accessibility. | `CoreBreadcrumb` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Breadcrumb's contents, which should typically be a breadcrumb-item. | `CoreBreadcrumb` |
| `separator` | The default separator used between breadcrumb items. When set, it is cloned into every item that does not provide its own. | `CoreBreadcrumb` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `breadcrumb-base` | The component's base wrapper. | `CoreBreadcrumb` |
| `breadcrumb-list` | Default slot's wrapper. | `CoreBreadcrumb` |
