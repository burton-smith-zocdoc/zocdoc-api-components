# zd-tooltip

Describes or labels its anchor, showing supplementary text on hover and focus.

**Class** `ZdTooltip` — **Module** `src/components/tooltip/tooltip.ts` — **Package** `@powered-by-zocdoc/primitives`

```html
<zd-tooltip></zd-tooltip>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `anchor` | `anchor` | `string \| Element \| undefined` | — | When the anchor element is separate from the popup, provide its ID or a reference to the anchor element. | `CoreTooltip` |
| `arrow` | `arrow` | `boolean \| undefined` | — | Attaches an arrow pointing to the tooltip. | `CoreTooltip` |
| `content` | `content` | `string \| undefined` | — | The content to display inside the tooltip. You can use `content` slot instead if you need text formatting. | `CoreTooltip` |
| `dir` | `dir` | `'ltr' \| 'rtl' \| 'auto'` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables/enables the tooltip | `CoreTooltip` |
| `distance` | `distance` | `number \| undefined` | — | The distance in pixels from which to offset the tooltip away from its target. | `CoreTooltip` |
| `fixed-placement` | `fixedPlacement` | `boolean` | — | Enable this option to prevent the tooltip from being clipped when the component is placed inside a container with `overflow: auto\|hidden\|scroll`. | `CoreTooltip` |
| `open` | `open` | `boolean` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `placement` | `placement` | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'start' \| 'start-top' \| 'start-bottom' \| 'end' \| 'end-top' \| 'end-bottom' \| undefined` | — | The preferred placement of the tooltip. Note that the actual placement may vary as needed to keep the tooltip inside of the viewport. | `CoreTooltip` |
| `skidding` | `skidding` | `number \| undefined` | — | The distance in pixels from which to offset the tooltip along its target. | `CoreTooltip` |
| `trigger` | `trigger` | `string` | `'hover focus'` | Controls how the tooltip is activated. Possible options include `click`, `hover`, `focus`, and `manual`. Multiple options can be passed by separating them with a space. When manual is used, the tooltip must be activated programmatically. | `CoreTooltip` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `ready` | `unknown` | Emitted when the component has completed its initial render. | `CharmElement` |
| `tooltip-after-hide` | `unknown` | Emitted after the tooltip has hidden and all animations are complete. | `CoreTooltip` |
| `tooltip-after-show` | `unknown` | Emitted after the tooltip has shown and all animations are complete. | `CoreTooltip` |
| `tooltip-hide` | `unknown` | Emitted when the tooltip begins to hide. | `CoreTooltip` |
| `tooltip-show` | `unknown` | Emitted when the tooltip begins to show. | `CoreTooltip` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| _(default)_ | The element to anchor the tooltip to. | `CoreTooltip` |
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
| `body` | The tooltip's body. | `CoreTooltip` |
| `popup-arrow` | The popup's `arrow` part. Use this to target the tooltip's arrow. | `CoreTooltip` |
| `popup-base` | The popup's `popup` part. Use this to target the tooltip's popup container. | `CoreTooltip` |
| `tooltip-base` | The component's base wrapper, a `<ch-popup>` element. | `CoreTooltip` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-tooltip-arrow-border-color` | — | — | The border color of the tooltip arrow | `CoreTooltip` |
| `--zd-tooltip-arrow-size` | — | — | The size of the tooltip arrow | `CoreTooltip` |
| `--zd-tooltip-bg-color` | — | — | The background color of the tooltip | `CoreTooltip` |
| `--zd-tooltip-border-color` | — | — | The border color of the tooltip | `CoreTooltip` |
| `--zd-tooltip-border-radius` | — | — | The border radius of the tooltip | `CoreTooltip` |
| `--zd-tooltip-border-style` | — | — | The border style of the tooltip | `CoreTooltip` |
| `--zd-tooltip-border-width` | — | — | The border width of the tooltip | `CoreTooltip` |
| `--zd-tooltip-shadow` | — | — | The box shadow of the tooltip | `CoreTooltip` |
| `--zd-tooltip-fg-color` | — | — | The foreground color of the tooltip | `CoreTooltip` |
| `--zd-tooltip-hide-delay` | — | — | The amount of time to wait before hiding the tooltip when hovering. | `CoreTooltip` |
| `--zd-tooltip-max-width` | — | — | The maximum width of the tooltip. | `CoreTooltip` |
| `--zd-tooltip-padding` | — | — | The padding of the tooltip | `CoreTooltip` |
| `--zd-tooltip-show-delay` | — | — | The amount of time to wait before showing the tooltip when hovering. | `CoreTooltip` |
| `--zd-tooltip-show-transition` | — | — | The transition effect when opening the tooltip | `CoreTooltip` |
