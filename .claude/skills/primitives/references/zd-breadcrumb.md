# zd-breadcrumb

Shows the hierarchy leading to the current page.

**Class** `ZdBreadcrumb` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-breadcrumb></zd-breadcrumb>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `label` | `label` | `string` | `'breadcrumb'` | The `aria-label` for the entire breadcrumb. Will not be displayed, but is required for accessibility. | `CoreBreadcrumb` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `separator` | The default separator used between breadcrumb items. When set, it is cloned into every item that does not provide its own. | `CoreBreadcrumb` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-breadcrumb-base` | The component's base wrapper. | `CoreBreadcrumb` |
| `zd-breadcrumb-list` | Default slot's wrapper. | `CoreBreadcrumb` |
