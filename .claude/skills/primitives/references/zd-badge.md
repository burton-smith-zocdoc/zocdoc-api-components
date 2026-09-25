# zd-badge

A small label or status indicator.

**Class** `ZdBadge` — **Package** `@zocdoc/api-primitive-components`

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
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `end` | Content rendered after the badge content. | `CoreBadge` |
| `start` | Content rendered before the badge content. | `CoreBadge` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-badge-base` | The component's base wrapper. | `CoreBadge` |
| `zd-badge-end` | The end slot container. | `CoreBadge` |
| `zd-badge-start` | The start slot container. | `CoreBadge` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-badge-bg-color` | — | — | determines the background color. | `CoreBadge` |
| `--zd-charm-badge-border-color` | — | — | determines the border color. | `CoreBadge` |
| `--zd-charm-badge-border-radius` | — | — | override css property `--badge-shape` if customs are needed. | `CoreBadge` |
| `--zd-charm-badge-border-style` | — | — | determines border style. | `CoreBadge` |
| `--zd-charm-badge-border-width` | — | — | determines the border. | `CoreBadge` |
| `--zd-charm-badge-fg-color` | — | — | determines the color of the text. | `CoreBadge` |
| `--zd-charm-badge-gap` | — | — | determines the space between the start slot, content, and end slot. | `CoreBadge` |
| `--zd-charm-badge-padding` | — | — | determines the padding. | `CoreBadge` |
| `--zd-charm-badge-size` | — | — | used to size the badge in relation to the font. | `CoreBadge` |
