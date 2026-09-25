# zd-popup

Low-level positioning primitive: places floating content relative to an anchor element.

**Class** `ZdPopup` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-popup></zd-popup>
```

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `anchor` | `anchor` | `Element \| string` | — | The element the popup will be anchored to. If the anchor lives outside of the popup, you can provide its `id` or a reference to it here. If the anchor lives inside the popup, use the `anchor` slot instead. | `CorePopup` |
| `arrow` | `arrow` | `boolean` | `false` | Attaches an arrow to the popup. The arrow's size can be customized using the `--popup-arrow-size` custom property, and its color follows the popup's background color (`--popup-bg-color`) so the two always match. For additional customizations, you can also target the arrow using `::part(arrow)` in your stylesheet. | `CorePopup` |
| `arrow-padding` | `arrowPadding` | `number` | `10` | The amount of padding between the arrow and the edges of the popup. If the popup has a border-radius, for example, this will prevent it from overflowing the corners. | `CorePopup` |
| `arrow-placement` | `arrowPlacement` | `'start' \| 'end' \| 'center' \| 'anchor'` | — | The placement of the arrow. | `CorePopup` |
| `auto-size` | `autoSize` | `'horizontal' \| 'vertical' \| 'both'` | — | When set, this will cause the popup to automatically resize itself to prevent it from overflowing. | `CorePopup` |
| `auto-size-padding` | `autoSizePadding` | `number` | — | The amount of padding, in pixels, to exceed before the auto-size behavior will occur. | `CorePopup` |
| `boundary` | `boundary` | `'viewport' \| 'scroll'` | `'viewport'` | Determines which overflow ancestors are used when flipping, shifting, and auto-sizing. | `CorePopup` |
| `content-role` | `contentRole` | `string \| undefined` | `'dialog'` | Sets the role of the overlay content. | `CorePopup` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `distance` | `distance` | `number` | `0` | The distance in pixels from which to offset the panel away from its anchor. | `CorePopup` |
| `flip` | `flip` | `boolean` | `false` | When set, placement of the popup will flip to the opposite site to keep it in view. You can use `flipFallbackPlacements` to further configure how the fallback placement is determined. | `CorePopup` |
| `flip-fallback-placements` | `flipFallbackPlacements` | `string` | `''` | If the preferred placement doesn't fit, popup will be tested in these fallback placements until one fits. Must be a string of any number of placements separated by a space, e.g. "top bottom left". If no placement fits, the flip fallback strategy will be used instead. | `CorePopup` |
| `flip-fallback-strategy` | `flipFallbackStrategy` | `'best-fit' \| 'initial'` | — | When neither the preferred placement nor the fallback placements fit, this value will be used to determine whether the popup should be positioned as it was initially preferred or using the best available fit based on available space. | `CorePopup` |
| `flip-padding` | `flipPadding` | `number` | — | The amount of padding, in pixels, to exceed before the flip behavior will occur. | `CorePopup` |
| `flipBoundary` | `flipBoundary` | `Element \| Element[]` | — | The flip boundary describes clipping element(s) that overflow will be checked relative to when flipping. By default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can change the boundary by passing a reference to one or more elements to this property. | `CorePopup` |
| `focus-trap` | `focusTrap` | `boolean \| undefined` | `false` | Provides keyboard focus trapping within the overlay content. | `CorePopup` |
| `label` | `label` | `string` | `'popup'` | The `aria-label` of the popup for assistive technologies. | `CorePopup` |
| `open` | `open` | `unknown` | — | Indicates whether or not the component is open. Can be used in lieu of show/hide methods. | `CharmDismissibleElement` |
| `placement` | `placement` | `'start' \| 'end' \| 'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'start-top' \| 'start-bottom' \| 'end-top' \| 'end-bottom' \| undefined` | `'top'` | The preferred placement of the popup. Note that the actual placement will vary as configured to keep the panel inside of the viewport. | `CorePopup` |
| `shift` | `shift` | `boolean` | `false` | Moves the popup along the axis to keep it in view when clipped. | `CorePopup` |
| `shift-padding` | `shiftPadding` | `number` | — | The amount of padding, in pixels, to exceed before the shift behavior will occur. | `CorePopup` |
| `shiftBoundary` | `shiftBoundary` | `Element \| Element[]` | — | The shift boundary describes clipping element(s) that overflow will be checked relative to when shifting. By default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can change the boundary by passing a reference to one or more elements to this property. | `CorePopup` |
| `skidding` | `skidding` | `number` | `0` | The distance in pixels from which to offset the panel along its anchor. | `CorePopup` |
| `strategy` | `strategy` | `'absolute' \| 'fixed'` | — | Determines how the popup is positioned. The `absolute` strategy works well in most cases, but if overflow is clipped, using a `fixed` position strategy can often workaround it. | `CorePopup` |
| `sync` | `sync` | `'width' \| 'height' \| 'both'` | — | Syncs the popup's width or height to that of the anchor element. | `CorePopup` |
| — | `autoSizeBoundary` | `Element \| Element[]` | — | The auto-size boundary describes clipping element(s) that overflow will be checked relative to when resizing. By default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can change the boundary by passing a reference to one or more elements to this property. | `CorePopup` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `popup-after-hide` | `Event` | Emitted after the popup closes and all transitions are complete. | `CorePopup` |
| `popup-after-show` | `Event` | Emitted after the popup opens and all transitions are complete. | `CorePopup` |
| `popup-hide` | `Event` | Emitted when the popup closes. | `CorePopup` |
| `popup-reposition` | `Event` | PopupRepositionEvent. Emitted when the popup is repositioned. This event can fire a lot, so avoid putting expensive operations in your listener or consider debouncing it. | `CorePopup` |
| `popup-show` | `Event` | Emitted when the popup opens. | `CorePopup` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `anchor` | The element the popup will be anchored to. | `CorePopup` |

### Methods

| Method | Description | From |
| --- | --- | --- |
| `hide(): void` | Hides/closes the component. | `CharmDismissibleElement` |
| `reposition(): Promise<void>` | Recalculate and repositions the popup. | `CorePopup` |
| `show(): void` | Shows/opens the component. | `CharmDismissibleElement` |
| `toggle(): void` | Shows or hides the component depending on whether it is currently visible. | `CharmDismissibleElement` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-popup-arrow` | The arrow's container. Avoid setting `top\|bottom\|left\|right` properties, as these values are assigned dynamically as the popup moves. This is most useful for applying a background color to match the popup, and maybe a border or box shadow. | `CorePopup` |
| `zd-popup-base` | The popup's container. Useful for setting a background color, box shadow, etc. | `CorePopup` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-popup-arrow-size` | — | — | The size of the arrow. Note that an arrow won't be shown unless the `arrow` attribute is used. | `CorePopup` |
| `--zd-charm-popup-auto-size-available-height` | — | — | A read-only custom property that determines the amount of height the popup can be before overflowing. Useful for positioning child elements that need to overflow. This property is only available when using `auto-size`. | `CorePopup` |
| `--zd-charm-popup-auto-size-available-width` | — | — | A read-only custom property that determines the amount of width the popup can be before overflowing. Useful for positioning child elements that need to overflow. This property is only available when using `auto-size`. | `CorePopup` |
| `--zd-charm-popup-bg-color` | — | — | The background color of the popup. The arrow uses the same color, so the two always match. | `CorePopup` |
| `--zd-charm-popup-drop-shadow` | — | — | The shadow of the popup, using CSS filter drop-shadow approach, enabling shadowing on non-rectangular shapes. | `CorePopup` |
| `--zd-charm-popup-hide-transition` | — | — | animation when the overlay is hidden. | `CorePopup` |
| `--zd-charm-popup-show-transition` | — | — | animation when the overlay is shown. | `CorePopup` |
| `--zd-charm-popup-z-index` | — | — | controls the CSS z-index value for the overlay content. | `CorePopup` |
