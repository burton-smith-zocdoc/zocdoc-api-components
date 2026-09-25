# zd-alert

Displays contextual feedback messages, with a variant per severity.

**Class** `ZdAlert` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-alert></zd-alert>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `'info' \| 'success' \| 'warning' \| 'danger' \| undefined` | — | The alert's severity. Omit it for an alert with no severity, which keeps Charm's neutral surface and draws no icon. Styling only: `politeness` is what decides whether and how the alert is announced, and the two are independent. An error usually wants `variant="danger" politeness="assertive"`, but a `danger` alert that has been on the page all along should stay `polite` — the variant does not imply it. |

## Slots

| Slot | Description |
| --- | --- |
| `icon` | — |

## CSS Parts

| Part | Description |
| --- | --- |
| `zd-alert-icon` | — |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `closeLabel` | `closeLabel` | `string` | `'Close'` | The label for the close button. | `CoreAlert` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `dismissible` | `dismissible` | `boolean` | `false` | Shows the close button. | `CoreAlert` |
| `heading` | `heading` | `string` | — | The heading of the alert. | `CoreAlert` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `politeness` | `politeness` | `"off" \| "polite" \| "assertive"` | — | Controls how the alert is announced to assistive technology. `polite` renders `role="status"`, `assertive` renders `role="alert"`, and `off` renders neither. | `CoreAlert` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `alert-after-hide` | `Event` | Emitted after the alert is closed and the transitions are complete. | `CoreAlert` |
| `alert-after-show` | `Event` | Emitted after the alert is opened and the transitions are complete. | `CoreAlert` |
| `alert-hide` | `Event` | Emitted when the alert is closed. | `CoreAlert` |
| `alert-show` | `Event` | Emitted when the alert is opened. | `CoreAlert` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `action` | Optional action button to display for the alert. | `CoreAlert` |
| `heading` | Optional heading for the alert. | `CoreAlert` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | — | `CoreAlert` |
| `show(): void` | — | `CoreAlert` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-alert-actions` | The container for the action slot. | `CoreAlert` |
| `zd-alert-base` | The component's base wrapper. | `CoreAlert` |
| `zd-alert-content` | The content container of the alert. | `CoreAlert` |
| `zd-alert-dismiss-button` | The dismiss button. | `CoreAlert` |
| `zd-alert-message` | The base of the message portion of the alert. | `CoreAlert` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-alert-actions-gap` | — | — | The gap between the actions buttons. | `CoreAlert` |
| `--zd-charm-alert-bg-color` | — | — | The background color of the alert container. | `CoreAlert` |
| `--zd-charm-alert-border` | — | — | The border of the alert container. | `CoreAlert` |
| `--zd-charm-alert-button-bg-color` | — | — | The background color of the dismiss button. | `CoreAlert` |
| `--zd-charm-alert-button-border` | — | — | The border of the dismiss button. | `CoreAlert` |
| `--zd-charm-alert-button-font-size` | — | — | The font size of the dismiss button. | `CoreAlert` |
| `--zd-charm-alert-button-padding` | — | — | The padding of the dismiss button. | `CoreAlert` |
| `--zd-charm-alert-fg-color` | — | — | The foreground color of the alert container. | `CoreAlert` |
| `--zd-charm-alert-font-size` | — | — | The font size of the alert. | `CoreAlert` |
| `--zd-charm-alert-font-weight` | — | — | The font weight of the alert. | `CoreAlert` |
| `--zd-charm-alert-heading-font-size` | — | — | The font size of the heading. | `CoreAlert` |
| `--zd-charm-alert-heading-font-weight` | — | — | The font weight of the heading. | `CoreAlert` |
| `--zd-charm-alert-icon-color` | — | — | The foreground color of the icon. | `CoreAlert` |
| `--zd-charm-alert-icon-margin` | — | — | The margin of the icon. | `CoreAlert` |
| `--zd-charm-alert-icon-size` | — | — | The size of the icon. | `CoreAlert` |
| `--zd-charm-alert-message-margin` | — | — | The margin of the alert's message container. | `CoreAlert` |
| `--zd-charm-alert-padding` | — | — | The padding of the alert container. | `CoreAlert` |
| `--zd-charm-alert-transition` | — | — | The transition of the alert. | `CoreAlert` |
