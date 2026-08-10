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

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `tab-base` | The component's internal wrapper. | `CoreTab` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-tab-active-bg-color` | — | — | The background color of the tab when active. | `CoreTab` |
| `--zd-tab-active-border-color` | — | — | The border color of the tab when active. | `CoreTab` |
| `--zd-tab-active-fg-color` | — | — | The foreground color of the tab when active. | `CoreTab` |
| `--zd-tab-active-font-weight` | — | — | The font weight of the tab when active. | `CoreTab` |
| `--zd-tab-bg-color` | — | — | The background color of the tab. | `CoreTab` |
| `--zd-tab-border-color` | — | — | The border color of the tab. | `CoreTab` |
| `--zd-tab-border-radius` | — | — | The border radius of the tab. | `CoreTab` |
| `--zd-tab-border-width` | — | — | The width of the tab's border. | `CoreTab` |
| `--zd-tab-border-style` | — | — | The style of the tab's border. | `CoreTab` |
| `--zd-tab-disabled-bg-color` | — | — | The background color of the tab when disabled. | `CoreTab` |
| `--zd-tab-disabled-border-color` | — | — | The border color of the tab when disabled. | `CoreTab` |
| `--zd-tab-disabled-fg-color` | — | — | The foreground color of the tab when disabled. | `CoreTab` |
| `--zd-tab-fg-color` | — | — | The foreground color of the tab. | `CoreTab` |
| `--zd-tab-focus-bg-color` | — | — | The background color of the tab when focused. | `CoreTab` |
| `--zd-tab-focus-border-color` | — | — | The border color of the tab when focused. | `CoreTab` |
| `--zd-tab-focus-fg-color` | — | — | The foreground color of the tab when focused. | `CoreTab` |
| `--zd-tab-font-size` | — | — | The font size of the tab. | `CoreTab` |
| `--zd-tab-font-weight` | — | — | The font weight of the tab. | `CoreTab` |
| `--zd-tab-gap` | — | — | The gap between elements inside the tab. | `CoreTab` |
| `--zd-tab-hover-bg-color` | — | — | The background color of the tab when hovered. | `CoreTab` |
| `--zd-tab-hover-border-color` | — | — | The border color of the tab when hovered. | `CoreTab` |
| `--zd-tab-hover-fg-color` | — | — | The foreground color of the tab when hovered. | `CoreTab` |
| `--zd-tab-icon-gap` | — | — | The gap between an icon and text in the tab. | `CoreTab` |
| `--zd-tab-icon-size` | — | — | The size of icons in the tab. | `CoreTab` |
| `--zd-tab-padding-x` | — | — | The component's inline padding. | `CoreTab` |
| `--zd-tab-padding-y` | — | — | The component's block padding. | `CoreTab` |
| `--zd-tab-transition` | — | — | The transition effect for tab state changes. | `CoreTab` |
