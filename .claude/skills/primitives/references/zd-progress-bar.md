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
