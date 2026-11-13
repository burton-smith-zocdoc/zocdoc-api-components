# zd-tabs

Coordinates a tab list and its panels.

**Class** `ZdTabs` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-tabs></zd-tabs>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `active-id` | `activeId` | `string \| undefined` | — | Controls which tab is selected. (You can also set `selected` on a single tab.) | `CoreTabs` |
| `label` | `label` | `string` | — | Accessible name for the tab list. | `CoreTabs` |
| `layout` | `layout` | `'horizontal' \| 'vertical'` | — | Whether to render the tabs in a column or row fashion. The default value is a `horizontal` layout. | `CoreTabs` |
| `manual-activation` | `manualActivation` | `boolean` | — | Set this if you do not want to navigate to a new tab with arrow keys, users will need to push "space" or "enter" to navigate. | `CoreTabs` |
| — | `dir` | `unknown` | — | — | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |
| `tabs-change` | `Event` | Emitted when the active tab changes. | `CoreTabs` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `tabpanel` | where the content that belongs to a individual Tab is displayed. | `CoreTabs` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `tabs-tablist` | The tab list container. | `CoreTabs` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-tabs-align` | — | — | The alignment of the tabs ('start' or 'flex-start', 'center', or 'end'). | `CoreTabs` |
| `--zd-charm-tabs-bg-color` | — | — | The background color of the tabs container. | `CoreTabs` |
| `--zd-charm-tabs-border-color` | — | — | The border color of the tabs container. | `CoreTabs` |
| `--zd-charm-tabs-border-radius` | — | — | The border radius of the tabs container. | `CoreTabs` |
| `--zd-charm-tabs-border-style` | — | — | The border style of the tabs container. | `CoreTabs` |
| `--zd-charm-tabs-border-width` | — | — | The border width of the tabs container. | `CoreTabs` |
| `--zd-charm-tabs-gap` | — | — | The gap between each tab. | `CoreTabs` |
| `--zd-charm-tabs-padding-x` | — | — | The horizontal padding of the tabs container. | `CoreTabs` |
| `--zd-charm-tabs-padding-y` | — | — | The vertical padding of the tabs container. | `CoreTabs` |
| `--zd-charm-tabs-tablist-gap` | — | — | The spacing between the tablist and tab panels. | `CoreTabs` |
| `--zd-charm-tabs-vertical-min-width` | — | — | The minimum width for tabs in vertical layout. | `CoreTabs` |
