# zd-breadcrumb

Shows the hierarchy leading to the current page.

**Class** `ZdBreadcrumb` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-breadcrumb></zd-breadcrumb>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `label` | `label` | `string` | — | Required localized accessible name for the breadcrumb navigation landmark. | `CoreBreadcrumb` |
| — | `dir` | `unknown` | — | — | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `separator` | The separator placed between breadcrumb items. Defaults to a chevron that mirrors in `rtl`. | `CoreBreadcrumb` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `breadcrumb-base` | The component's base wrapper. | `CoreBreadcrumb` |
| `breadcrumb-list` | Default slot's wrapper. | `CoreBreadcrumb` |
