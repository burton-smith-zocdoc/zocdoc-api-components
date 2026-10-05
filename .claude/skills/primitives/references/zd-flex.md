# zd-flex

A one-dimensional flex layout container.

**Class** `zd-flex` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-flex></zd-flex>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `align` | — | `start \| center \| end \| stretch \| baseline` | — | Aligns items on the cross axis. |
| `direction` | — | `row \| column` | — | Selects the main-axis direction. |
| `gap` | — | `0 \| 1 \| 2 \| 4 \| 6 \| 8 \| 10 \| 12 \| 14 \| 16 \| 20 \| 24 \| 28 \| 32 \| 36 \| 40 \| 44 \| 48 \| 56 \| 64 \| 128` | — | Sets the gap using a numeric Zocdoc spacing token. |
| `inline` | — | `boolean` | — | Renders as an inline-level flex container. |
| `justify` | — | `start \| center \| end \| between \| around \| evenly` | — | Distributes items on the main axis. |
| `wrap` | — | `boolean` | — | Allows items to wrap onto another line. |

## CSS Custom Properties

| Property | Syntax | Default | Description |
| --- | --- | --- | --- |
| `--zd-flex-gap` | — | `var(--zd-spacing-16)` | Overrides the flex gap. |
