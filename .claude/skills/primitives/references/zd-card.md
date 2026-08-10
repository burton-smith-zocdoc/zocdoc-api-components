# zd-card

A container for grouping related content.

**Class** `ZdCard` — **Module** `src/components/card/card.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-card></zd-card>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string \| undefined` | — | Provides a heading for the card. | `CoreCard` |
| `media-position` | `mediaPosition` | `'top' \| 'bottom' \| 'start' \| 'end' \| undefined` | — | A flag used to change visual positioning of any media (default 'top'). | `CoreCard` |
| `subheading` | `subheading` | `string \| undefined` | — | Provides a subheading for the card. | `CoreCard` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The card's main content. | `CoreCard` |
| `footer` | The card's footer. | `CoreCard` |
| `heading` | Wraps the heading element. | `CoreCard` |
| `media` | A presentational slot for media such as an image or icon. | `CoreCard` |
| `subheading` | Wraps the subheading element. | `CoreCard` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `card-base` | The component's base wrapper. | `CoreCard` |
| `card-content` | The card's main content. | `CoreCard` |
| `card-footer` | The card's footer. | `CoreCard` |
| `card-header` | The card's header. | `CoreCard` |
| `card-heading` | The card's heading element. | `CoreCard` |
| `card-media` | The card's media. | `CoreCard` |
| `card-subheading` | The card's subheading element. | `CoreCard` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-card-bg-color` | — | — | Sets the background color for the card. | `CoreCard` |
| `--zd-card-body-padding-x` | — | — | Controls the horizontal padding of the card body. | `CoreCard` |
| `--zd-card-body-padding-y` | — | — | Controls the vertical padding of the card body. | `CoreCard` |
| `--zd-card-border-color` | — | — | Sets the border color for the card. | `CoreCard` |
| `--zd-card-border-radius` | — | — | Sets border-radius for the card. | `CoreCard` |
| `--zd-card-border-width` | — | — | Sets the border width for the card. | `CoreCard` |
| `--zd-card-border-style` | — | — | Sets the border style for the card. | `CoreCard` |
| `--zd-card-shadow` | — | — | Sets the style of the shadowing for the card. | `CoreCard` |
| `--zd-card-content-gap` | — | — | Determines the spacing between the slots. | `CoreCard` |
| `--zd-card-fg-color` | — | — | Sets the foreground color (text color) for the card. | `CoreCard` |
| `--zd-card-footer-padding-x` | — | — | Controls the horizontal padding of the card footer. | `CoreCard` |
| `--zd-card-footer-padding-y` | — | — | Controls the vertical padding of the card footer. | `CoreCard` |
| `--zd-card-heading-gap` | — | — | Controls the gap between the heading and subheading. | `CoreCard` |
| `--zd-card-heading-padding-x` | — | — | Controls the horizontal padding of the card heading. | `CoreCard` |
| `--zd-card-heading-padding-y` | — | — | Controls the vertical padding of the card heading. | `CoreCard` |
| `--zd-card-heading-size` | — | — | Controls the font size of the heading. | `CoreCard` |
| `--zd-card-heading-weight` | — | — | Controls the font weight of the heading. | `CoreCard` |
| `--zd-card-padding` | — | — | Sets the padding for the card. | `CoreCard` |
| `--zd-card-subheading-size` | — | — | Controls the font size of the subheading. | `CoreCard` |
| `--zd-card-subheading-weight` | — | — | Controls the font weight of the subheading. | `CoreCard` |
