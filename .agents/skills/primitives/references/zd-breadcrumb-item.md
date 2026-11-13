# zd-breadcrumb-item

A single link in a breadcrumb trail.

**Class** `ZdBreadcrumbItem` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-breadcrumb-item></zd-breadcrumb-item>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CoreBreadcrumbItem` |
| `current` | `current` | `'page' \| 'step'` | — | Sets `aria-current` on the link or text control. | `CoreBreadcrumbItem` |
| `disabled` | `disabled` | `boolean` | — | Prevents navigation and presents this item as non-interactive text. | `CoreBreadcrumbItem` |
| `href` | `href` | `string` | — | When set, renders a navigable `<a>` with this `href`. Without it, the item is non-interactive text. | `CoreBreadcrumbItem` |
| `referrerpolicy` | `referrerPolicy` | `'no-referrer' \| 'no-referrer-when-downgrade' \| 'origin' \| 'origin-when-cross-origin' \| 'same-origin' \| 'strict-origin' \| 'strict-origin-when-cross-origin' \| 'unsafe-url' \| (string & {})` | `'strict-origin-when-cross-origin'` | Defining which referrer is sent when fetching the resource. Only applies to links. | `CoreBreadcrumbItem` |
| `target` | `target` | `'_blank' \| '_parent' \| '_self' \| '_top' \| (string & {})` | — | Tells the browser where to open the link. Only used when `href` is set. | `CoreBreadcrumbItem` |
| — | `dir` | `unknown` | — | — | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `end` | A presentational suffix icon or similar element. | `CoreBreadcrumbItem` |
| `separator` | Internal: filled by the parent `ch-breadcrumb` with a clone of its separator. Don't slot content here; set the separator on `ch-breadcrumb` instead. | `CoreBreadcrumbItem` |
| `start` | A presentational prefix icon or similar element. | `CoreBreadcrumbItem` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `breadcrumb-item-base` | The component's base wrapper. | `CoreBreadcrumbItem` |
| `breadcrumb-item-control` | The container for start, default, and end slot. | `CoreBreadcrumbItem` |
| `breadcrumb-item-separator` | The wrapper around the separator the parent breadcrumb places after this item. | `CoreBreadcrumbItem` |
| `content` | The container for the default slot. | `CoreBreadcrumbItem` |
| `end` | The container for the 'end' slot. | `CoreBreadcrumbItem` |
| `start` | The container for the 'start' slot. | `CoreBreadcrumbItem` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-breadcrumb-item-active-bg-color` | — | — | Set the background color of the breadcrumb item when active. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-active-border-color` | — | — | Set the border color of the breadcrumb item when active. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-active-fg-color` | — | — | Set the foreground color of the breadcrumb item when active. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-bg-color` | — | — | Set the background color of the breadcrumb item. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-border-color` | — | — | Set the border color of the breadcrumb item. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-border-width` | — | — | Determines the width of the breadcrumb item border. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-control-width` | — | — | Determines the width of the control. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-disabled-bg-color` | — | — | Set the background color of the breadcrumb item when disabled. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-disabled-border-color` | — | — | Set the border color of the breadcrumb item when disabled. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-disabled-fg-color` | — | — | Set the foreground color of the breadcrumb item when disabled. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-fg-color` | — | — | Set the foreground color of the breadcrumb item. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-focus-bg-color` | — | — | Set the background color of the breadcrumb item when focus. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-focus-border-color` | — | — | Set the border color of the breadcrumb item when focus. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-focus-fg-color` | — | — | Set the foreground color of the breadcrumb item when focus. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-gap` | — | — | Determines margin around start/end slot and separator. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-hover-bg-color` | — | — | Set the background color of the breadcrumb item when hover. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-hover-border-color` | — | — | Set the border color of the breadcrumb item when hover. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-hover-fg-color` | — | — | Set the foreground color of the breadcrumb item when hover. | `CoreBreadcrumbItem` |
| `--zd-charm-breadcrumb-item-padding` | — | — | Determines the padding of the breadcrumb item. | `CoreBreadcrumbItem` |
