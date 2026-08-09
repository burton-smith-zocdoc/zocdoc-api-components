# zd-alert

Displays contextual feedback messages, with a variant per severity.

**Class** `ZdAlert` — **Module** `src/components/alert/alert.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-alert></zd-alert>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `'info' \| 'success' \| 'warning' \| 'danger' \| undefined` | — | The alert's severity. Omit it for an alert with no severity, which keeps Charm's neutral surface and draws no icon. Styling only: `politeness` is what decides whether and how the alert is announced, and the two are independent. An error usually wants `variant="danger" politeness="assertive"`, but a `danger` alert that has been on the page all along should stay `polite` — the variant does not imply it. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `closeLabel` | `closeLabel` | `string` | `'Close'` | The label for the close button. | `CoreAlert` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `dismissible` | `dismissible` | `boolean` | `false` | Shows the close button. | `CoreAlert` |
| `heading` | `heading` | `string \| undefined` | — | The heading of the alert. | `CoreAlert` |
| `open` | `open` | `boolean` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `politeness` | `politeness` | `'off' \| 'polite' \| 'assertive'` | — | Controls how the alert is announced to assistive technology. `polite` renders `role="status"`, `assertive` renders `role="alert"`, and `off` renders neither. | `CoreAlert` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `alert-after-hide` | `unknown` | Emitted after the alert is closed and the transitions are complete. | `CoreAlert` |
| `alert-after-show` | `unknown` | Emitted after the alert is opened and the transitions are complete. | `CoreAlert` |
| `alert-hide` | `unknown` | Emitted when the alert is closed. | `CoreAlert` |
| `alert-show` | `unknown` | Emitted when the alert is opened. | `CoreAlert` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The message content of the alert. | `CoreAlert` |
| `action` | Optional action button to display for the alert. | `CoreAlert` |
| `heading` | Optional heading for the alert. | `CoreAlert` |
| `icon` | Optional icon. | `CoreAlert` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |
