# zd-scoped-styles

Applies slotted stylesheets only to its own subtree.

**Class** `ZdScopedStyles` — **Module** `src/components/scoped-styles/scoped-styles.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-scoped-styles></zd-scoped-styles>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `css` | `css` | `string \| string[]` | — | CSS styles to scope to this element. Alternatively you can slot `<link>` tags in the `stylesheets` slot. | `CoreScopedStyles` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component has completed its initial render. | `CharmElement` |
| `styles-loaded` | `unknown` | Emitted when the styles are loaded. | `CoreScopedStyles` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The default slot. | `CoreScopedStyles` |
| `stylesheets` | The slot for disabled `<link>` elements with stylesheets to scope to this element. Alternatively you can use the `css` property. | `CoreScopedStyles` |
