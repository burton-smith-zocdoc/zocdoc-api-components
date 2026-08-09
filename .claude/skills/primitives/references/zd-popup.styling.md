# zd-popup — Styling

API reference: [zd-popup.md](zd-popup.md)

## Inherited

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `popup-arrow` | The arrow's container. Avoid setting `top\|bottom\|left\|right` properties, as these values are assigned dynamically as the popup moves. This is most useful for applying a background color to match the popup, and maybe a border or box shadow. | `CorePopup` |
| `popup-base` | The popup's container. Useful for setting a background color, box shadow, etc. | `CorePopup` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-popup-arrow-color` | — | — | The color of the arrow. | `CorePopup` |
| `--zd-popup-arrow-size` | — | — | The size of the arrow. Note that an arrow won't be shown unless the `arrow` attribute is used. | `CorePopup` |
| `--zd-popup-auto-size-available-height` | — | — | A read-only custom property that determines the amount of height the popup can be before overflowing. Useful for positioning child elements that need to overflow. This property is only available when using `auto-size`. | `CorePopup` |
| `--zd-popup-auto-size-available-width` | — | — | A read-only custom property that determines the amount of width the popup can be before overflowing. Useful for positioning child elements that need to overflow. This property is only available when using `auto-size`. | `CorePopup` |
| `--zd-popup-drop-shadow` | — | — | The shadow of the popup, using CSS filter drop-shadow approach, enabling shadowing on non-rectangular shapes. | `CorePopup` |
| `--zd-popup-hide-transition` | — | — | animation when the overlay is hidden. | `CorePopup` |
| `--zd-popup-show-transition` | — | — | animation when the overlay is shown. | `CorePopup` |
| `--zd-popup-z-index` | — | — | controls the CSS z-index value for the overlay content. | `CorePopup` |
