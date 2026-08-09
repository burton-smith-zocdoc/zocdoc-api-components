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
