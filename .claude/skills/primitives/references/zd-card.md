# zd-card

A container for grouping related content.

**Class** `ZdCard` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-card></zd-card>
```

## Slots

| Slot | Description |
| --- | --- |
| `heading` | — |
| `subheading` | — |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-card-header` | — |
| `zd-card-heading` | — |
| `zd-card-subheading` | — |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string` | — | Provides a heading for the card. | `CoreCard` |
| `media-position` | `mediaPosition` | `'top' \| 'bottom' \| 'start' \| 'end'` | — | A flag used to change visual positioning of any media (default 'top'). | `CoreCard` |
| `subheading` | `subheading` | `string` | — | Provides a subheading for the card. | `CoreCard` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `footer` | The card's footer. | `CoreCard` |
| `media` | A presentational slot for media such as an image or icon. | `CoreCard` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-card-base` | The component's base wrapper. | `CoreCard` |
| `zd-card-content` | The card's main content. | `CoreCard` |
| `zd-card-footer` | The card's footer. | `CoreCard` |
| `zd-card-media` | The card's media. | `CoreCard` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-card-bg-color` | — | — | Sets the background color for the card. | `CoreCard` |
| `--zd-charm-card-body-padding-x` | — | — | Controls the horizontal padding of the card body. | `CoreCard` |
| `--zd-charm-card-body-padding-y` | — | — | Controls the vertical padding of the card body. | `CoreCard` |
| `--zd-charm-card-border-color` | — | — | Sets the border color for the card. | `CoreCard` |
| `--zd-charm-card-border-radius` | — | — | Sets border-radius for the card. | `CoreCard` |
| `--zd-charm-card-border-style` | — | — | Sets the border style for the card. | `CoreCard` |
| `--zd-charm-card-border-width` | — | — | Sets the border width for the card. | `CoreCard` |
| `--zd-charm-card-content-gap` | — | — | Determines the spacing between the slots. | `CoreCard` |
| `--zd-charm-card-fg-color` | — | — | Sets the foreground color (text color) for the card. | `CoreCard` |
| `--zd-charm-card-footer-padding-x` | — | — | Controls the horizontal padding of the card footer. | `CoreCard` |
| `--zd-charm-card-footer-padding-y` | — | — | Controls the vertical padding of the card footer. | `CoreCard` |
| `--zd-charm-card-heading-gap` | — | — | Controls the gap between the heading and subheading. | `CoreCard` |
| `--zd-charm-card-heading-padding-x` | — | — | Controls the horizontal padding of the card heading. | `CoreCard` |
| `--zd-charm-card-heading-padding-y` | — | — | Controls the vertical padding of the card heading. | `CoreCard` |
| `--zd-charm-card-heading-size` | — | — | Controls the font size of the heading. | `CoreCard` |
| `--zd-charm-card-heading-weight` | — | — | Controls the font weight of the heading. | `CoreCard` |
| `--zd-charm-card-padding` | — | — | Sets the padding for the card. | `CoreCard` |
| `--zd-charm-card-shadow` | — | — | Sets the style of the shadowing for the card. | `CoreCard` |
| `--zd-charm-card-subheading-size` | — | — | Controls the font size of the subheading. | `CoreCard` |
| `--zd-charm-card-subheading-weight` | — | — | Controls the font weight of the subheading. | `CoreCard` |
