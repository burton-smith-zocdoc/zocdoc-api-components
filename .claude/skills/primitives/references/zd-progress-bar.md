# zd-progress-bar

Shows determinate or indeterminate progress, for multi-step flows and uploads.

**Class** `ZdProgressBar` — **Module** `src/components/progress-bar/progress-bar.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-progress-bar></zd-progress-bar>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `help-text` | `helpText` | `string \| undefined` | — | The input's help text. Alternatively, you can use the help-text slot. | `CoreProgressBar` |
| `hide-label` | `hideLabel` | `boolean \| undefined` | — | Hides the input label and help text. | `CoreProgressBar` |
| `indeterminate` | `indeterminate` | `boolean \| undefined` | — | When true, percentage is ignored, the label is hidden, and the progress bar is drawn in an indeterminate state. | `CoreProgressBar` |
| `label` | `label` | `string \| undefined` | — | A custom label for the progress bar's aria label. | `CoreProgressBar` |
| `max` | `max` | `number \| undefined` | — | The maximum value, which indicates the task is complete.. | `CoreProgressBar` |
| `meter` | `meter` | `boolean \| undefined` | — | Update the role of the progress bar from 'progressbar' to 'meter' to indicate that it measures a specific value instead of progress towards a specific task. | `CoreProgressBar` |
| `value` | `value` | `number \| undefined` | — | The current progress, 0 to `max` or 100 if max is not defined. | `CoreProgressBar` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | A label to show inside the indicator when the `label` attribute is not provided. | `CoreProgressBar` |
| `help-text` | The progress bar's help text. | `CoreProgressBar` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `progress-bar-base` | The component's internal wrapper. | `CoreProgressBar` |
| `progress-bar-help-text` | The progress bar's help text. | `CoreProgressBar` |
| `progress-bar-indicator` | The progress bar indicator. | `CoreProgressBar` |
| `progress-bar-label` | The progress bar label. | `CoreProgressBar` |
| `progress-bar-track` | The progress bar's track. | `CoreProgressBar` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-form-control-invalid-border-color` | — | — | Determines the error border color. | `CoreProgressBar` |
| `--zd-form-control-invalid-message-color` | — | — | Determines the error text color. | `CoreProgressBar` |
| `--zd-form-control-invalid-message-font-size` | — | — | Determines the error message font size. | `CoreProgressBar` |
| `--zd-form-control-label-color` | — | — | Determines the label color. | `CoreProgressBar` |
| `--zd-form-control-label-font-size` | — | — | Determines the label font size. | `CoreProgressBar` |
| `--zd-form-control-label-font-weight` | — | — | Determines the label font weight. | `CoreProgressBar` |
| `--zd-form-control-label-gap` | — | — | Determines the margin between label and the control. | `CoreProgressBar` |
| `--zd-progress-bar-animation` | — | — | The animation for the indeterminate state. | `CoreProgressBar` |
| `--zd-progress-bar-border-radius` | — | — | The border radius of the track. | `CoreProgressBar` |
| `--zd-progress-bar-height` | — | — | The progress bar's track's height. | `CoreProgressBar` |
| `--zd-progress-bar-icon-color` | — | — | The color of the icon in the default slot. | `CoreProgressBar` |
| `--zd-progress-bar-indicator-bg-color` | — | — | The background color of the indicator. | `CoreProgressBar` |
| `--zd-progress-bar-track-color` | — | — | The track color. | `CoreProgressBar` |
| `--zd-progress-bar-transition` | — | — | The transition for the indicator. | `CoreProgressBar` |
