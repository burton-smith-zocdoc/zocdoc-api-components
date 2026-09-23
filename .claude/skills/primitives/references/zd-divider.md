# zd-divider

A horizontal or vertical rule separating content, with an optional inline label.

**Class** `ZdDivider` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-divider></zd-divider>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `align-content` | `alignContent` | `'center' \| 'start' \| 'end'` | — | Determines the alignment of the content within the divider. | `CoreDivider` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `inset` | `inset` | `boolean` | — | Adds padding to the beginning and end of the divider. | `CoreDivider` |
| `orientation` | `orientation` | `'horizontal' \| 'vertical'` | — | The divider's orientation. | `CoreDivider` |
| `presentation` | `presentation` | `boolean` | — | Renders the divider as a presentational element instead of a content separator when set to true. | `CoreDivider` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-divider-line` | The divider's line. | `CoreDivider` |
| `zd-divider-text` | The divider's text. | `CoreDivider` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-divider-border-color` | — | — | The color of the divider line. | `CoreDivider` |
| `--zd-charm-divider-border-style` | — | — | The style of the divider line. | `CoreDivider` |
| `--zd-charm-divider-border-width` | — | — | The width of the divider line. | `CoreDivider` |
| `--zd-charm-divider-inset` | — | — | The padding of the divider in the direction of the inset. | `CoreDivider` |
| `--zd-charm-divider-text-gap` | — | — | The gap between the divider and the text. | `CoreDivider` |
| `--zd-charm-divider-text-offset` | — | — | The amount of space to offset the text in the divider when it is aligned. | `CoreDivider` |
| `--zd-charm-divider-vertical-min-height` | — | — | The minimum height of the divider when it is vertical. | `CoreDivider` |
