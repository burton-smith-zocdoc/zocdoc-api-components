# zd-dialog

A modal dialog for focused tasks and confirmations, with heading, body, and footer slots.

**Class** `ZdDialog` — **Module** `src/components/dialog/dialog.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-dialog></zd-dialog>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `alert` | `alert` | `boolean \| undefined` | — | Indicates whether the dialog can only be closed programmatically or by clicking the close button. | `CoreDialog` |
| `close-button-label` | `closeButtonLabel` | `string` | `'close'` | The label for the close button. | `CoreDialog` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `heading` | `heading` | `string \| undefined` | — | The optional header of the dialog. | `CoreDialog` |
| `hide-close-button` | `hideCloseButton` | `boolean \| undefined` | — | Hides the close button when it is not focused. | `CoreDialog` |
| `no-header` | `noHeader` | `boolean \| undefined` | — | Removes the header. This will also remove the default close button. If using prevent default on dialog-request-close please provide a way for the user to close the dialog. | `CoreDialog` |
| `open` | `open` | `boolean` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `position` | `position` | `'start' \| 'end' \| 'top' \| 'bottom' \| 'center' \| undefined` | — | Position of the dialog. | `CoreDialog` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `dialog-after-hide` | `unknown` | Emitted after the dialog closes and all transitions are complete. | `CoreDialog` |
| `dialog-after-show` | `unknown` | Emitted after the dialog opens and all transitions are complete. | `CoreDialog` |
| `dialog-hide` | `unknown` | Emitted when the dialog closes. | `CoreDialog` |
| `dialog-request-close` | `DialogRequestCloseEvent` | Emitted when the user attempts to close the dialog. If the event is canceled, the dialog will not close. | `CoreDialog` |
| `dialog-show` | `unknown` | Emitted when the dialog opens. | `CoreDialog` |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The dialog's body. | `CoreDialog` |
| `actions` | The dialog's header actions, usually a back button. | `CoreDialog` |
| `footer` | The dialog's footer, usually one or more buttons representing various options. | `CoreDialog` |
| `heading` | The dialog's heading. | `CoreDialog` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |
