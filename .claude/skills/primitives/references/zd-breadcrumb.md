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
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. Mirrors native `HTMLElement.dir`: reading returns the attribute's value (or `''` when unset) and does no layout or style work, and writing reflects back to the attribute. Use resolvedDir for the effective `'ltr' \| 'rtl'` direction, including inherited directionality. | `CharmElement` |
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
