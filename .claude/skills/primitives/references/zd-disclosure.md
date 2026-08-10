# zd-disclosure

Toggles a region of content from a slotted trigger.

**Class** `ZdDisclosure` — **Module** `src/components/disclosure/disclosure.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-disclosure></zd-disclosure>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `content-below` | `contentBelow` | `boolean \| undefined` | — | Controls the expand direction of the component. | `CoreDisclosure` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `open` | `open` | `boolean` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `disclosure-after-hide` | `unknown` | Emitted after the disclosure has hidden and all animations are complete. | `CoreDisclosure` |
| `disclosure-after-show` | `unknown` | Emitted after the disclosure has shown and all animations are complete. | `CoreDisclosure` |
| `disclosure-hide` | `unknown` | Emitted when the disclosure begins to hide. | `CoreDisclosure` |
| `disclosure-show` | `unknown` | Emitted when the disclosure begins to show. | `CoreDisclosure` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | default - Content to be toggled. | `CoreDisclosure` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `disclosure-base` | The component's base wrapper. | `CoreDisclosure` |
| `disclosure-content` | Wrapper around the main slotted content. | `CoreDisclosure` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-disclosure-gap` | — | — | controls the space between the trigger and the expandable content. | `CoreDisclosure` |
| `--zd-disclosure-content-border` | — | — | controls the border styles of expanded region. | `CoreDisclosure` |
| `--zd-disclosure-content-border-radius` | — | — | controls the border styles of expanded region. | `CoreDisclosure` |
| `--zd-disclosure-bg-color` | — | — | controls the background color of the expanded region. | `CoreDisclosure` |
| `--zd-disclosure-fg-color` | — | — | controls the text color of the expanded region. | `CoreDisclosure` |
| `--zd-disclosure-closed-max-height` | — | — | controls the height of the collapsed region when it's closed (default is 0). | `CoreDisclosure` |
| `--zd-disclosure-opened-max-height` | — | — | controls the height of the collapsed region when it's opened. | `CoreDisclosure` |
| `--zd-disclosure-show-transition` | — | — | Transition for the content when opening. | `CoreDisclosure` |
| `--zd-disclosure-hide-transition` | — | — | Transition for the content when closing. | `CoreDisclosure` |
