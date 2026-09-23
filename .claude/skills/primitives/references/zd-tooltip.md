# zd-tooltip

Describes or labels its anchor, showing supplementary text on hover and focus.

**Class** `ZdTooltip` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-tooltip></zd-tooltip>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `anchor` | `anchor` | `string \| Element \| undefined` | — | When the anchor element is separate from the popup, provide its ID or a reference to the anchor element. | `CoreTooltip` |
| `arrow` | `arrow` | `boolean` | — | Attaches an arrow pointing to the tooltip. | `CoreTooltip` |
| `content` | `content` | `string \| undefined` | — | The content to display inside the tooltip. You can use `content` slot instead if you need text formatting. | `CoreTooltip` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables/enables the tooltip | `CoreTooltip` |
| `distance` | `distance` | `number \| undefined` | — | The distance in pixels from which to offset the tooltip away from its target. | `CoreTooltip` |
| `fixed-placement` | `fixedPlacement` | `boolean` | — | Enable this option to prevent the tooltip from being clipped when the component is placed inside a container with `overflow: auto\|hidden\|scroll`. | `CoreTooltip` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `placement` | `placement` | `'start' \| 'end' \| 'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'start-top' \| 'start-bottom' \| 'end-top' \| 'end-bottom' \| undefined` | — | The preferred placement of the tooltip. Note that the actual placement may vary as needed to keep the tooltip inside of the viewport. | `CoreTooltip` |
| `skidding` | `skidding` | `number \| undefined` | — | The distance in pixels from which to offset the tooltip along its target. | `CoreTooltip` |
| `trigger` | `trigger` | `string` | `'hover focus'` | Controls how the tooltip is activated. Possible options include `click`, `hover`, `focus`, and `manual`. Multiple options can be passed by separating them with a space. When manual is used, the tooltip must be activated programmatically. | `CoreTooltip` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `Event` | Emitted when the component has completed its initial render. | `CharmElement` |
| `tooltip-after-hide` | `Event` | Emitted after the tooltip has hidden and all animations are complete. | `CoreTooltip` |
| `tooltip-after-show` | `Event` | Emitted after the tooltip has shown and all animations are complete. | `CoreTooltip` |
| `tooltip-hide` | `Event` | Emitted when the tooltip begins to hide. | `CoreTooltip` |
| `tooltip-show` | `Event` | Emitted when the tooltip begins to show. | `CoreTooltip` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `content` | The tooltip's content. You can also use the `content` attribute. | `CoreTooltip` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-body` | The tooltip's body. | `CoreTooltip` |
| `zd-popup-arrow` | The popup's `arrow` part. Use this to target the tooltip's arrow. | `CoreTooltip` |
| `zd-popup-base` | The popup's `popup` part. Use this to target the tooltip's popup container. | `CoreTooltip` |
| `zd-tooltip-base` | The component's base wrapper, a `<ch-popup>` element. | `CoreTooltip` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-tooltip-arrow-border-color` | — | — | The border color of the tooltip arrow | `CoreTooltip` |
| `--zd-charm-tooltip-arrow-size` | — | — | The size of the tooltip arrow | `CoreTooltip` |
| `--zd-charm-tooltip-bg-color` | — | — | The background color of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-border-color` | — | — | The border color of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-border-radius` | — | — | The border radius of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-border-style` | — | — | The border style of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-border-width` | — | — | The border width of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-fg-color` | — | — | The foreground color of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-hide-delay` | — | — | The amount of time to wait before hiding the tooltip when hovering. | `CoreTooltip` |
| `--zd-charm-tooltip-max-width` | — | — | The maximum width of the tooltip. | `CoreTooltip` |
| `--zd-charm-tooltip-padding` | — | — | The padding of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-shadow` | — | — | The box shadow of the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-show-delay` | — | — | The amount of time to wait before showing the tooltip when hovering. | `CoreTooltip` |
| `--zd-charm-tooltip-show-transition` | — | — | The transition effect when opening the tooltip | `CoreTooltip` |
| `--zd-charm-tooltip-show-transition` | — | — | The transition effect when closing the tooltip | `CoreTooltip` |
