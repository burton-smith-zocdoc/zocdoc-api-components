# zd-grid

A two-dimensional grid layout container.

**Class** `zd-grid` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-grid></zd-grid>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `align` | — | `start \| center \| end \| stretch` | — | Aligns items in their block-axis grid area. |
| `columns` | — | `1 \| 2 \| 3 \| 4 \| 6 \| 12` | — | Creates equal-width column tracks. |
| `gap` | — | `0 \| 1 \| 2 \| 4 \| 6 \| 8 \| 10 \| 12 \| 14 \| 16 \| 20 \| 24 \| 28 \| 32 \| 36 \| 40 \| 44 \| 48 \| 56 \| 64 \| 128` | — | Sets the gap using a numeric Zocdoc spacing token. |
| `inline` | — | `boolean` | — | Renders as an inline-level grid container. |
| `justify` | — | `start \| center \| end \| stretch` | — | Aligns items in their inline-axis grid area. |

## CSS Custom Properties

| Property | Syntax | Default | Description |
| --- | --- | --- | --- |
| `--zd-grid-gap` | — | `var(--zd-spacing-16)` | Overrides the grid gap. |
