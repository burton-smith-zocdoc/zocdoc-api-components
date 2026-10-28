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
| `columns` | — | `1 \| 2 \| 3 \| 4 \| 6 \| 12 \| auto-fill \| auto-fit` | — | Creates equal-width column tracks, or as many as fit at the minimum column size. |
| `gap` | — | `0 \| 1 \| 2 \| 4 \| 6 \| 8 \| 10 \| 12 \| 14 \| 16 \| 20 \| 24 \| 28 \| 32 \| 36 \| 40 \| 44 \| 48 \| 56 \| 64 \| 128` | — | Sets the gap using a numeric Zocdoc spacing token. |
| `inline` | — | `boolean` | — | Renders as an inline-level grid container. |
| `justify` | — | `start \| center \| end \| stretch` | — | Aligns items in their inline-axis grid area. |

## CSS Custom Properties

| Property | Syntax | Default | Description |
| --- | --- | --- | --- |
| `--zd-grid-gap` | — | `var(--zd-spacing-16)` | Sets the gap when no gap attribute is present. Inherits, so it can be set on an ancestor. |
| `--zd-grid-min-column-size` | — | `12rem` | Sets the minimum track size for auto-fill and auto-fit columns. Inherits, so it can be set on an ancestor. |
