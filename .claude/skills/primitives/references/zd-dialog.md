# zd-dialog

A modal dialog for focused tasks and confirmations, with heading, body, and footer slots.

**Class** `ZdDialog` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-dialog></zd-dialog>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `alert` | `alert` | `boolean` | — | Indicates whether the dialog can only be closed programmatically or by clicking the close button. | `CoreDialog` |
| `close-button-label` | `closeButtonLabel` | `string` | `'close'` | The label for the close button. | `CoreDialog` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string` | — | The optional header of the dialog. | `CoreDialog` |
| `hide-close-button` | `hideCloseButton` | `boolean` | — | Hides the close button when it is not focused. | `CoreDialog` |
| `no-header` | `noHeader` | `boolean` | — | Removes the header. This will also remove the default close button. If using prevent default on dialog-request-close please provide a way for the user to close the dialog. | `CoreDialog` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `position` | `position` | `'start' \| 'end' \| 'top' \| 'bottom' \| 'center'` | — | Position of the dialog. | `CoreDialog` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `dialog-after-hide` | `Event` | Emitted after the dialog closes and all transitions are complete. | `CoreDialog` |
| `dialog-after-show` | `Event` | Emitted after the dialog opens and all transitions are complete. | `CoreDialog` |
| `dialog-hide` | `Event` | Emitted when the dialog closes. | `CoreDialog` |
| `dialog-request-close` | `Event` | Emitted when the user attempts to close the dialog. If the event is canceled, the dialog will not close. | `CoreDialog` |
| `dialog-show` | `Event` | Emitted when the dialog opens. | `CoreDialog` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `actions` | The dialog's header actions, usually a back button. | `CoreDialog` |
| `footer` | The dialog's footer, usually one or more buttons representing various options. | `CoreDialog` |
| `heading` | The dialog's heading. | `CoreDialog` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | — | `CoreDialog` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | — | `CoreDialog` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-dialog-actions` | The component's actions slot. | `CoreDialog` |
| `zd-dialog-base` | The component's dialog element. | `CoreDialog` |
| `zd-dialog-body` | The component's body slot. | `CoreDialog` |
| `zd-dialog-close-button` | The component's close X button. | `CoreDialog` |
| `zd-dialog-close-button-icon` | The close button icon. | `CoreDialog` |
| `zd-dialog-footer` | The component's footer slot. | `CoreDialog` |
| `zd-dialog-header` | The component's header slot. | `CoreDialog` |
| `zd-dialog-header-base` | The component's header base. | `CoreDialog` |
| `zd-dialog-toolbar` | The component's toolbar which contains action slot and close button. | `CoreDialog` |
| `zd-dialog-wrapper` | The component's base wrapper. | `CoreDialog` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-dialog-backdrop-color` | — | — | determines dialog's backdrop background. | `CoreDialog` |
| `--zd-charm-dialog-bg-color` | — | — | determines dialog's background color. | `CoreDialog` |
| `--zd-charm-dialog-border-color` | — | — | border color of the dialog element. | `CoreDialog` |
| `--zd-charm-dialog-border-radius` | — | — | determines dialog's radius. | `CoreDialog` |
| `--zd-charm-dialog-border-width` | — | — | border width of the dialog element. | `CoreDialog` |
| `--zd-charm-dialog-close-button-active-bg-color` | — | — | determines close button active background color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-active-border-color` | — | — | determines close button active border color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-active-fg-color` | — | — | determines close button active foreground color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-bg-color` | — | — | determines close button background color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-border-color` | — | — | determines close button border color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-border-radius` | — | — | determines close button's border radius. | `CoreDialog` |
| `--zd-charm-dialog-close-button-border-width` | — | — | determines close button border width. | `CoreDialog` |
| `--zd-charm-dialog-close-button-fg-color` | — | — | determines close button foreground color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-focus-bg-color` | — | — | determines close button focus background color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-focus-border-color` | — | — | determines close button focus border color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-focus-fg-color` | — | — | determines close button focus foreground color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-hover-bg-color` | — | — | determines close button hover background color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-hover-border-color` | — | — | determines close button hover border color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-hover-fg-color` | — | — | determines close button hover foreground color. | `CoreDialog` |
| `--zd-charm-dialog-close-button-padding` | — | — | determines close X button padding. | `CoreDialog` |
| `--zd-charm-dialog-fg-color` | — | — | determines dialog's foreground color. | `CoreDialog` |
| `--zd-charm-dialog-footer-button-gap` | — | — | determines gap between buttons in the footer slot. | `CoreDialog` |
| `--zd-charm-dialog-header-toolbar-gap` | — | — | determines gap between dialog header items. | `CoreDialog` |
| `--zd-charm-dialog-margin-top` | — | — | determines dialog's top margin when it has a header or footer. | `CoreDialog` |
| `--zd-charm-dialog-max-height` | — | — | determines dialog's max height. | `CoreDialog` |
| `--zd-charm-dialog-max-width` | — | — | determines dialog's max width. | `CoreDialog` |
| `--zd-charm-dialog-padding-x` | — | — | determines dialog's inline padding. | `CoreDialog` |
| `--zd-charm-dialog-padding-y` | — | — | determines dialog's block padding. | `CoreDialog` |
| `--zd-charm-dialog-position-transition` | — | — | determines dialog's transform when position is set. | `CoreDialog` |
| `--zd-charm-dialog-shadow` | — | — | determines dialog's shadow. | `CoreDialog` |
| `--zd-charm-dialog-size` | — | — | determines dialog's size. | `CoreDialog` |
| `--zd-charm-dialog-toolbar-button-gap` | — | — | determines gap between buttons in the actions slot. | `CoreDialog` |
| `--zd-charm-dialog-transition` | — | — | determines dialog's transform. | `CoreDialog` |
