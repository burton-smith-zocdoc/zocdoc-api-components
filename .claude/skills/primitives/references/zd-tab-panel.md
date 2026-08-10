# zd-tab-panel

The content region shown when its tab is selected.

**Class** `ZdTabPanel` — **Module** `src/components/tab-panel/tab-panel.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-tab-panel></zd-tab-panel>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |
| `tab-after-hide` | `unknown` | Emitted when the tab panel is hidden and the transition is finished. | `CoreTabPanel` |
| `tab-after-show` | `unknown` | Emitted when the tab panel is shown and the transition is finished. | `CoreTabPanel` |
| `tab-hide` | `unknown` | Emitted when the tab panel is hidden. | `CoreTabPanel` |
| `tab-show` | `unknown` | Emitted when the tab panel is shown. | `CoreTabPanel` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The tab panel's content. | `CoreTabPanel` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `tab-panel-base` | The component's internal wrapper. | `CoreTabPanel` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-tab-panel-padding-x` | — | — | The component's inline padding. | `CoreTabPanel` |
| `--zd-tab-panel-padding-y` | — | — | The component's block padding. | `CoreTabPanel` |
| `--zd-tab-panel-transition` | — | — | The transition when showing/hiding. | `CoreTabPanel` |
| `--zd-tab-panel-border-color` | — | — | The border color of the tab panel. | `CoreTabPanel` |
| `--zd-tab-panel-border-width` | — | — | The border width of the tab panel. | `CoreTabPanel` |
| `--zd-tab-panel-border-style` | — | — | The border style of the tab panel. | `CoreTabPanel` |
| `--zd-tab-panel-border-radius` | — | — | The border radius of the tab panel. | `CoreTabPanel` |
| `--zd-tab-panel-min-height` | — | — | The minimum height of the tab panel. | `CoreTabPanel` |
| `--zd-tab-panel-shadow` | — | — | The box shadow of the tab panel. | `CoreTabPanel` |
| `--zd-tab-panel-bg-color` | — | — | The background color of the tab panel. | `CoreTabPanel` |
| `--zd-tab-panel-fg-color` | — | — | The foreground color of the tab panel. | `CoreTabPanel` |
