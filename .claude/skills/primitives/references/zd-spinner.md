# zd-spinner

An animated loading indicator.

**Class** `ZdSpinner` — **Module** `src/components/spinner/spinner.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-spinner></zd-spinner>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `label` | `label` | `string \| undefined` | — | A custom label rendered under the progress ring. | `CoreSpinner` |
| `label-position` | `labelPosition` | `'below' \| 'before' \| 'after' \| 'above' \| undefined` | — | The position of the progress label. | `CoreSpinner` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | A label to show next to the spinner when the `label` attribute is not provided. | `CoreSpinner` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `spinner-base` | The component's base wrapper. | `CoreSpinner` |
| `spinner-container` | The spinner's container. | `CoreSpinner` |
| `spinner-image` | The spinner's SVG element. | `CoreSpinner` |
| `spinner-indicator` | The spinner's indicator. | `CoreSpinner` |
| `spinner-label` | The spinner's label. | `CoreSpinner` |
| `spinner-track` | The spinner's track. | `CoreSpinner` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-spinner-gap` | — | — | Gap between the ring and the label. | `CoreSpinner` |
| `--zd-spinner-image-animation` | — | — | Animation for the spinner ring. | `CoreSpinner` |
| `--zd-spinner-indicator-animation` | — | — | Animation for the spinner indicator. | `CoreSpinner` |
| `--zd-spinner-indicator-fg-color` | — | — | Color of the shaded in track. | `CoreSpinner` |
| `--zd-spinner-label-color` | — | — | Font color of the label text. | `CoreSpinner` |
| `--zd-spinner-label-font-size` | — | — | Font size of the label text. | `CoreSpinner` |
| `--zd-spinner-label-font-weight` | — | — | Font weight of the label text. | `CoreSpinner` |
| `--zd-spinner-label-line-height` | — | — | Line height of the label text. | `CoreSpinner` |
| `--zd-spinner-ring-size` | — | — | Spinner ring's width and height. | `CoreSpinner` |
| `--zd-spinner-track-color` | — | — | Color of the unshaded track. | `CoreSpinner` |
| `--zd-spinner-track-width` | — | — | Width of the progress ring indicator. | `CoreSpinner` |
