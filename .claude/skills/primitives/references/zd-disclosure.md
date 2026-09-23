# zd-disclosure

Toggles a region of content from a slotted trigger.

**Class** `ZdDisclosure` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-disclosure></zd-disclosure>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `content-below` | `contentBelow` | `boolean` | — | Controls the expand direction of the component. | `CoreDisclosure` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `disclosure-after-hide` | `Event` | Emitted after the disclosure has hidden and all animations are complete. | `CoreDisclosure` |
| `disclosure-after-show` | `Event` | Emitted after the disclosure has shown and all animations are complete. | `CoreDisclosure` |
| `disclosure-hide` | `Event` | Emitted when the disclosure begins to hide. | `CoreDisclosure` |
| `disclosure-show` | `Event` | Emitted when the disclosure begins to show. | `CoreDisclosure` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-disclosure-base` | The component's base wrapper. | `CoreDisclosure` |
| `zd-disclosure-content` | Wrapper around the main slotted content. | `CoreDisclosure` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-disclosure-bg-color` | — | — | controls the background color of the expanded region. | `CoreDisclosure` |
| `--zd-charm-disclosure-closed-max-height` | — | — | controls the height of the collapsed region when it's closed (default is 0). | `CoreDisclosure` |
| `--zd-charm-disclosure-content-border` | — | — | controls the border styles of expanded region. | `CoreDisclosure` |
| `--zd-charm-disclosure-content-border-radius` | — | — | controls the border styles of expanded region. | `CoreDisclosure` |
| `--zd-charm-disclosure-fg-color` | — | — | controls the text color of the expanded region. | `CoreDisclosure` |
| `--zd-charm-disclosure-gap` | — | — | controls the space between the trigger and the expandable content. | `CoreDisclosure` |
| `--zd-charm-disclosure-hide-transition` | — | — | Transition for the content when closing. | `CoreDisclosure` |
| `--zd-charm-disclosure-opened-max-height` | — | — | controls the height of the collapsed region when it's opened. | `CoreDisclosure` |
| `--zd-charm-disclosure-show-transition` | — | — | Transition for the content when opening. | `CoreDisclosure` |
