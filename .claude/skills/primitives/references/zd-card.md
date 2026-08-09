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
