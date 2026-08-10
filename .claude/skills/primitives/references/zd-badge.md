# zd-badge

A small label or status indicator.

**Class** `ZdBadge` — **Module** `src/components/badge/badge.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-badge></zd-badge>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral' \| 'inverse' \| 'caution' \| 'brand' \| undefined` | — | The badge's visual treatment. Omit it to use the base `badge.*` tokens. Note that a variant is styling only - it carries no meaning for assistive technology, so the badge's text has to say what the state is (A11Y-001). |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The content of the badge. | `CoreBadge` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `badge-base` | The component's base wrapper. | `CoreBadge` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-badge-bg-color` | — | — | determines the background color. | `CoreBadge` |
| `--zd-badge-border-color` | — | — | determines the border color. | `CoreBadge` |
| `--zd-badge-border-radius` | — | — | override css property `--badge-shape` if customs are needed. | `CoreBadge` |
| `--zd-badge-border-style` | — | — | determines border style. | `CoreBadge` |
| `--zd-badge-border-width` | — | — | determines the border. | `CoreBadge` |
| `--zd-badge-fg-color` | — | — | determines the color of the text. | `CoreBadge` |
| `--zd-badge-padding` | — | — | determines the padding. | `CoreBadge` |
| `--zd-badge-size` | — | — | used to size the badge in relation to the font. | `CoreBadge` |
