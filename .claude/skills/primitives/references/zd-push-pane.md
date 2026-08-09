# zd-push-pane

A dismissible pane anchored to an edge of the viewport, which pushes page content aside.

**Class** `ZdPushPane` — **Module** `src/components/push-pane/push-pane.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-push-pane></zd-push-pane>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `close-button-label` | `closeButtonLabel` | `string \| undefined` | — | The label for the close button. | `CorePushPane` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string \| undefined` | — | The heading to display at the top of the pane opposite the close button. | `CorePushPane` |
| `hide-close-button` | `hideCloseButton` | `boolean \| undefined` | — | Hides the close button when it is not focused. | `CorePushPane` |
| `no-header` | `noHeader` | `boolean \| undefined` | — | Removes the header. This will also remove the default close button. If using prevent default on he-fly-in-request-close please provide a way for the user to close the fly-in-panel. | `CorePushPane` |
| `open` | `open` | `boolean` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `position` | `position` | `'end' \| 'start' \| 'bottom' \| undefined` | — | The layout edge from which the pane opens. | `CorePushPane` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `push-pane-after-hide` | `unknown` | Emitted after the pane closes. | `CorePushPane` |
| `push-pane-after-show` | `unknown` | Emitted after the pane opens. | `CorePushPane` |
| `push-pane-hide` | `unknown` | Emitted when the pane closes. | `CorePushPane` |
| `push-pane-request-close` | `PushPaneRequestCloseEvent` | Emitted when the pane is requested to close. | `CorePushPane` |
| `push-pane-show` | `unknown` | Emitted when the pane opens. | `CorePushPane` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The default push pane content. | `CorePushPane` |
| `actions` | The actions to be displayed in the header of the push pane. | `CorePushPane` |
| `footer` | The push pane's footer content. | `CorePushPane` |
| `heading` | The push pane's title. | `CorePushPane` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |
