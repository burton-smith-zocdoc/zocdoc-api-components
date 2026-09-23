# zd-push-pane

A dismissible pane anchored to an edge of the viewport, which pushes page content aside.

**Class** `ZdPushPane` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-push-pane></zd-push-pane>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `close-button-label` | `closeButtonLabel` | `string` | — | The label for the close button. | `CorePushPane` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string` | — | The heading to display at the top of the pane opposite the close button. | `CorePushPane` |
| `hide-close-button` | `hideCloseButton` | `boolean` | — | Hides the close button when it is not focused. | `CorePushPane` |
| `no-header` | `noHeader` | `boolean` | — | Removes the header. This will also remove the default close button. If using prevent default on he-fly-in-request-close please provide a way for the user to close the fly-in-panel. | `CorePushPane` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `position` | `position` | `'end' \| 'start' \| 'bottom'` | — | The layout edge from which the pane opens. | `CorePushPane` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `push-pane-after-hide` | `Event` | Emitted after the pane closes. | `CorePushPane` |
| `push-pane-after-show` | `Event` | Emitted after the pane opens. | `CorePushPane` |
| `push-pane-hide` | `Event` | Emitted when the pane closes. | `CorePushPane` |
| `push-pane-request-close` | `Event` | Emitted when the pane is requested to close. | `CorePushPane` |
| `push-pane-show` | `Event` | Emitted when the pane opens. | `CorePushPane` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `actions` | The actions to be displayed in the header of the push pane. | `CorePushPane` |
| `footer` | The push pane's footer content. | `CorePushPane` |
| `heading` | The push pane's title. | `CorePushPane` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-push-pane-actions` | The actions container in the footer. | `CorePushPane` |
| `zd-push-pane-base` | The base container of the push pane. | `CorePushPane` |
| `zd-push-pane-close-button` | The close button in header. | `CorePushPane` |
| `zd-push-pane-container` | The push pane wrapper. | `CorePushPane` |
| `zd-push-pane-footer` | The footer of the push pane. | `CorePushPane` |
| `zd-push-pane-header` | The header of the push pane. | `CorePushPane` |
| `zd-push-pane-heading` | The heading of the push pane. | `CorePushPane` |
| `zd-push-pane-toolbar` | The toolbar of the push pane. | `CorePushPane` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-push-pane-bg-color` | — | — | The background color of the push pane. | `CorePushPane` |
| `--zd-charm-push-pane-body-margin-bottom` | — | — | sets margin bottom for pane body. | `CorePushPane` |
| `--zd-charm-push-pane-body-margin-inline` | — | — | sets margin inline for pane body. | `CorePushPane` |
| `--zd-charm-push-pane-body-margin-top` | — | — | sets margin top for pane body. | `CorePushPane` |
| `--zd-charm-push-pane-body-padding-x` | — | — | sets block padding for pane body. | `CorePushPane` |
| `--zd-charm-push-pane-body-padding-y` | — | — | sets inline padding for pane body. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-active-bg-color` | — | — | sets close button active background color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-active-border-color` | — | — | sets close button active border color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-active-border-width` | — | — | sets close button active border width. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-bg-color` | — | — | sets close button background color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-border-color` | — | — | sets close button border color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-border-radius` | — | — | sets close button border radius. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-border-width` | — | — | sets close button border width. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-fg-color` | — | — | sets close button foreground (text) color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-focus-bg-color` | — | — | sets close button focus background color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-focus-border-color` | — | — | sets close button focus border color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-focus-border-width` | — | — | sets close button focus border width. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-hover-bg-color` | — | — | sets close button hover background color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-hover-border-color` | — | — | sets close button hover border color. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-hover-border-width` | — | — | sets close button hover border width. | `CorePushPane` |
| `--zd-charm-push-pane-close-button-padding` | — | — | sets close button padding. | `CorePushPane` |
| `--zd-charm-push-pane-divider-color` | — | — | sets the color of the divider. | `CorePushPane` |
| `--zd-charm-push-pane-fg-color` | — | — | The foreground color of the push pane. | `CorePushPane` |
| `--zd-charm-push-pane-footer-button-gap` | — | — | The gap between buttons in the footer. | `CorePushPane` |
| `--zd-charm-push-pane-footer-padding-x` | — | — | sets block padding for pane footer. | `CorePushPane` |
| `--zd-charm-push-pane-footer-padding-y` | — | — | sets inline padding for pane footer. | `CorePushPane` |
| `--zd-charm-push-pane-header-padding-x` | — | — | sets block padding for pane header. | `CorePushPane` |
| `--zd-charm-push-pane-header-padding-y` | — | — | sets inline padding for pane header. | `CorePushPane` |
| `--zd-charm-push-pane-padding-x` | — | — | sets block padding for pane component. | `CorePushPane` |
| `--zd-charm-push-pane-padding-y` | — | — | sets inline padding for pane component. | `CorePushPane` |
| `--zd-charm-push-pane-size` | — | — | sets the width of the pane. | `CorePushPane` |
| `--zd-charm-push-pane-toolbar-button-gap` | — | — | The gap between buttons in the toolbar. | `CorePushPane` |
| `--zd-charm-push-pane-transition` | — | — | sets transition for pane. | `CorePushPane` |
