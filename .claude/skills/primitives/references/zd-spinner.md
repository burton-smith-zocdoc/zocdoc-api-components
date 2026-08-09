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
