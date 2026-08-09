# zd-tab

A single selectable tab in a tab list.

**Class** `ZdTab` — **Module** `src/components/tab/tab.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-tab></zd-tab>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean \| undefined` | — | Disables the component on page load. | `CoreTab` |
| `selected` | `selected` | `boolean \| undefined` | — | Enables a selected tab. | `CoreTab` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | Tab's content. | `CoreTab` |
| `end` | Content to show after the tab's content. | `CoreTab` |
| `start` | Content to show before the tab's content. | `CoreTab` |
