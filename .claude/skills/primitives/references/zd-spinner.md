# zd-spinner

An animated loading indicator.

**Class** `ZdSpinner` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-spinner></zd-spinner>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `label` | `label` | `string` | — | A custom label rendered under the progress ring. | `CoreSpinner` |
| `label-position` | `labelPosition` | `'below' \| 'before' \| 'after' \| 'above'` | — | The position of the progress label. | `CoreSpinner` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-spinner-base` | The component's base wrapper. | `CoreSpinner` |
| `zd-spinner-container` | The spinner's container. | `CoreSpinner` |
| `zd-spinner-image` | The spinner's SVG element. | `CoreSpinner` |
| `zd-spinner-indicator` | The spinner's indicator. | `CoreSpinner` |
| `zd-spinner-label` | The spinner's label. | `CoreSpinner` |
| `zd-spinner-track` | The spinner's track. | `CoreSpinner` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-spinner-gap` | — | — | Gap between the ring and the label. | `CoreSpinner` |
| `--zd-charm-spinner-image-animation` | — | — | Animation for the spinner ring. | `CoreSpinner` |
| `--zd-charm-spinner-indicator-animation` | — | — | Animation for the spinner indicator. | `CoreSpinner` |
| `--zd-charm-spinner-indicator-fg-color` | — | — | Color of the shaded in track. | `CoreSpinner` |
| `--zd-charm-spinner-label-color` | — | — | Font color of the label text. | `CoreSpinner` |
| `--zd-charm-spinner-label-font-size` | — | — | Font size of the label text. | `CoreSpinner` |
| `--zd-charm-spinner-label-font-weight` | — | — | Font weight of the label text. | `CoreSpinner` |
| `--zd-charm-spinner-label-line-height` | — | — | Line height of the label text. | `CoreSpinner` |
| `--zd-charm-spinner-ring-size` | — | — | Spinner ring's width and height. | `CoreSpinner` |
| `--zd-charm-spinner-track-color` | — | — | Color of the unshaded track. | `CoreSpinner` |
| `--zd-charm-spinner-track-width` | — | — | Width of the progress ring indicator. | `CoreSpinner` |
