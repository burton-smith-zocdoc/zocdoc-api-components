# zd-divider

A horizontal or vertical rule separating content, with an optional inline label.

**Class** `ZdDivider` — **Module** `src/components/divider/divider.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-divider></zd-divider>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `align-content` | `alignContent` | `'center' \| 'start' \| 'end' \| undefined` | — | Determines the alignment of the content within the divider. | `CoreDivider` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `inset` | `inset` | `boolean \| undefined` | — | Adds padding to the beginning and end of the divider. | `CoreDivider` |
| `orientation` | `orientation` | `'horizontal' \| 'vertical' \| undefined` | — | The divider's orientation. | `CoreDivider` |
| `presentation` | `presentation` | `boolean \| undefined` | — | Renders the divider as a presentational element instead of a content separator when set to true. | `CoreDivider` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |
