# zd-progress-bar

Shows determinate or indeterminate progress, for multi-step flows and uploads.

**Class** `ZdProgressBar` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-progress-bar></zd-progress-bar>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `help-text` | `helpText` | `string` | — | The input's help text. Alternatively, you can use the help-text slot. | `CoreProgressBar` |
| `hide-label` | `hideLabel` | `boolean` | — | Hides the input label and help text. | `CoreProgressBar` |
| `indeterminate` | `indeterminate` | `boolean` | — | When true, percentage is ignored, the label is hidden, and the progress bar is drawn in an indeterminate state. | `CoreProgressBar` |
| `label` | `label` | `string` | — | A custom label for the progress bar's aria label. When omitted and the default slot is empty, a default `Progress` text is used. | `CoreProgressBar` |
| `max` | `max` | `number` | — | The maximum value, which indicates the task is complete.. | `CoreProgressBar` |
| `meter` | `meter` | `boolean` | — | Update the role of the progress bar from 'progressbar' to 'meter' to indicate that it measures a specific value instead of progress towards a specific task. | `CoreProgressBar` |
| `value` | `value` | `number` | — | The current progress, 0 to `max` or 100 if max is not defined. | `CoreProgressBar` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `help-text` | The progress bar's help text. | `CoreProgressBar` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-progress-bar-base` | The component's internal wrapper. | `CoreProgressBar` |
| `zd-progress-bar-help-text` | The progress bar's help text. | `CoreProgressBar` |
| `zd-progress-bar-indicator` | The progress bar indicator. | `CoreProgressBar` |
| `zd-progress-bar-label` | The progress bar label. | `CoreProgressBar` |
| `zd-progress-bar-track` | The progress bar's track. | `CoreProgressBar` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-form-control-invalid-border-color` | — | — | Determines the error border color. | `CoreProgressBar` |
| `--zd-charm-form-control-invalid-message-color` | — | — | Determines the error text color. | `CoreProgressBar` |
| `--zd-charm-form-control-invalid-message-font-size` | — | — | Determines the error message font size. | `CoreProgressBar` |
| `--zd-charm-form-control-label-color` | — | — | Determines the label color. | `CoreProgressBar` |
| `--zd-charm-form-control-label-font-size` | — | — | Determines the label font size. | `CoreProgressBar` |
| `--zd-charm-form-control-label-font-weight` | — | — | Determines the label font weight. | `CoreProgressBar` |
| `--zd-charm-form-control-label-gap` | — | — | Determines the margin between label and the control. | `CoreProgressBar` |
| `--zd-charm-progress-bar-animation` | — | — | The animation for the indeterminate state. | `CoreProgressBar` |
| `--zd-charm-progress-bar-border-radius` | — | — | The border radius of the track. | `CoreProgressBar` |
| `--zd-charm-progress-bar-height` | — | — | The progress bar's track's height. | `CoreProgressBar` |
| `--zd-charm-progress-bar-icon-color` | — | — | The color of the icon in the default slot. | `CoreProgressBar` |
| `--zd-charm-progress-bar-indicator-bg-color` | — | — | The background color of the indicator. | `CoreProgressBar` |
| `--zd-charm-progress-bar-track-color` | — | — | The track color. | `CoreProgressBar` |
| `--zd-charm-progress-bar-transition` | — | — | The transition for the indicator. | `CoreProgressBar` |
