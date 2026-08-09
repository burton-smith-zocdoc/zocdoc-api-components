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
