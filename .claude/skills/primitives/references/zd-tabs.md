# zd-tabs

Coordinates a tab list and its panels.

**Class** `ZdTabs` — **Module** `src/components/tabs/tabs.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-tabs></zd-tabs>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `active-id` | `activeId` | `unknown` | — | Refers to the currently active tab. | `CoreTabs` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `layout` | `layout` | `'horizontal' \| 'vertical' \| undefined` | — | Whether to render the tabs in a column or row fashion. The default value is a `horizontal` layout. | `CoreTabs` |
| `manual-activation` | `manualActivation` | `boolean \| undefined` | — | Set this if you do not want to navigate to a new tab with arrow keys, users will need to push "space" or "enter" to navigate. | `CoreTabs` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |
| `tabs-change` | `TabsChangeEvent` | Emitted when the active tab changes. | `CoreTabs` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | where the tab list is displayed. | `CoreTabs` |
| `tabpanel` | where the content that belongs to a individual Tab is displayed. | `CoreTabs` |
