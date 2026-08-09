# zd-breadcrumb-item

A single link in a breadcrumb trail.

**Class** `ZdBreadcrumbItem` — **Module** `src/components/breadcrumb-item/breadcrumb-item.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-breadcrumb-item></zd-breadcrumb-item>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `autofocus` | `autofocus` | `boolean` | `false` | Auto focuses the component on page load. | `CharmFocusableElement` |
| `current` | `current` | `'page' \| 'step' \| undefined` | — | Sets `aria-current` on the div. | `CoreBreadcrumbItem` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `href` | `href` | `string \| undefined` | — | When set, the underlying button will be rendered as an `<a>` with this `href` instead of a `<button>`. | `CoreBreadcrumbItem` |
| `referrerpolicy` | `referrerPolicy` | `'no-referrer' \| 'no-referrer-when-downgrade' \| 'origin' \| 'origin-when-cross-origin' \| 'same-origin' \| 'strict-origin' \| 'strict-origin-when-cross-origin' \| 'unsafe-url' \| (string & {})` | `'strict-origin-when-cross-origin'` | Defining which referrer is sent when fetching the resource. Only applies to links. | `CoreBreadcrumbItem` |
| `separator` | `separator` | `boolean` | `true` | When true, will render the separator content. | `CoreBreadcrumbItem` |
| `target` | `target` | `'_blank' \| '_parent' \| '_self' \| '_top' \| (string & {}) \| undefined` | — | Tells the browser where to open the link. Only used when `href` is set. | `CoreBreadcrumbItem` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Breadcrumb item's content. | `CoreBreadcrumbItem` |
| `end` | A presentational suffix icon or similar element. | `CoreBreadcrumbItem` |
| `separator` | A separator between breadcrumb items. | `CoreBreadcrumbItem` |
| `start` | A presentational prefix icon or similar element. | `CoreBreadcrumbItem` |
