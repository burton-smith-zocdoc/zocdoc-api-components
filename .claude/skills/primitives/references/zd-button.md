# zd-button

An interactive button, with a variant per visual treatment and two densities.

**Class** `ZdButton` — **Package** `@zocdoc/api-primitive-components`

```html
<zd-button></zd-button>
```

## Attributes & Properties

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `fluid` | `fluid` | `boolean` | — | Stretch the button to the width of its container. Charm's button is `display: inline-block` with a full-width `.control`, so this only has to widen the host. |
| `size` | `size` | `'small' \| 'default' \| undefined` | — | The button's density. `small` swaps in the theme's `button.small.*` metrics; `default` and an omitted value both use the base metrics. |
| `variant` | `variant` | `'inverse' \| 'primary' \| 'secondary' \| 'ghost' \| 'destructive' \| 'link' \| undefined` | — | The button's visual treatment. Omit it to use the base `button.*` tokens, which is what an unstyled Charm button renders. |

## Inherited

### Attributes & Properties

| Attribute | Property | Type | Default | Description | From |
| --- | --- | --- | --- | --- | --- |
| `allow-wrap` | `allowWrap` | `boolean \| undefined` | `false` | An optional toggle that allows text to wrap. Helper for longer text scenarios. | `CoreButton` |
| `autofocus` | `autofocus` | `unknown` | `false` | Auto focuses the component on page load. | `CharmFocusableElement` |
| `current` | `current` | `'page' \| 'step' \| 'location' \| 'date' \| 'time' \| 'true' \| 'false' \| null` | — | Sets "aria-current" on the internal button or link. | `CoreButton` |
| `dir` | `dir` | `unknown` | — | The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. | `CharmElement` |
| `disabled` | `disabled` | `boolean` | — | Disables the component on page load. | `CoreButton` |
| `download` | `download` | `string` | — | Downloads the linked file as the filename. Only used when `href` is set. | `CoreButton` |
| `expanded` | `expanded` | `boolean` | — | Sets "aria-expanded" on the internal button or link. | `CoreButton` |
| `hides` | `hides` | `string \| undefined` | — | referencing a dismissible element's ID, this button will hide it when clicked | `CoreButton` |
| `href` | `href` | `string` | — | When set, the underlying button will be rendered as an `<a>` with this `href` instead of a `<button>`. | `CoreButton` |
| `icon-only` | `iconOnly` | `boolean` | — | Allows the component to render using only the icon as visual element. Optional, default is false, associated attribute is 'icon-only'. When not set, this is detected automatically when the default slot contains only an icon and no other visible content. | `CoreButton` |
| `name` | `name` | `string` | — | An optional name for the button. Ignored when `href` is set. | `CoreButton` |
| `pressed` | `pressed` | `boolean` | — | Sets "aria-pressed" on the internal button or link. | `CoreButton` |
| `referrerpolicy` | `referrerPolicy` | `'no-referrer' \| 'no-referrer-when-downgrade' \| 'origin' \| 'origin-when-cross-origin' \| 'same-origin' \| 'strict-origin' \| 'strict-origin-when-cross-origin' \| 'unsafe-url' \| (string & {})` | `'strict-origin-when-cross-origin'` | Defining which referrer is sent when fetching the resource. Only applies to links. | `CoreButton` |
| `shows` | `shows` | `string \| undefined` | — | referencing a dismissible element's ID, this button will show it when clicked | `CoreButton` |
| `target` | `target` | `'_blank' \| '_parent' \| '_self' \| '_top' \| (string & {})` | — | Tells the browser where to open the link. Only used when `href` is set. | `CoreButton` |
| `toggle` | `toggle` | `boolean` | `false` | Allows a toggling behavior on the component that emits change event if not disabled. Only when is a button. | `CoreButton` |
| `toggles` | `toggles` | `string \| undefined` | — | referencing a dismissible element's ID, this button will show/hide it when clicked | `CoreButton` |
| `type` | `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Allows the component to be treated standalone or part of a form. The type of button. When the type is `submit`, the button will submit the surrounding form. Note that the default value is `button` instead of `submit`, which is opposite of how native `<button>` elements behave. | `CoreButton` |
| `value` | `value` | `string` | — | An optional value for the button. Ignored when `href` is set. | `CoreButton` |

### Events

| Event | Type | Description | From |
| --- | --- | --- | --- |
| `blur` | `Event` | Custom event that indicates when focus is lost. | `CoreButton` |
| `change` | `Event` | Custom event that indicates the current toggling state through e.target.pressed. | `CoreButton` |
| `focus` | `Event` | Custom event that indicates when focus is gained. | `CoreButton` |
| `ready` | `Event` | Emitted when the component is ready. | `CharmElement` |

### Slots

| Slot | Description | From |
| --- | --- | --- |
| `end` | A presentational suffix icon or similar element. | `CoreButton` |
| `start` | A presentational prefix icon or similar element. | `CoreButton` |

### CSS Parts

| Part | Description | From |
| --- | --- | --- |
| `zd-button-control` | The component's base wrapper. | `CoreButton` |
| `zd-content` | The button's label. | `CoreButton` |
| `zd-end` | The container that wraps the suffix. | `CoreButton` |
| `zd-start` | The container that wraps the prefix. | `CoreButton` |

### CSS Custom Properties

| Property | Syntax | Default | Description | From |
| --- | --- | --- | --- | --- |
| `--zd-charm-button-active-bg-color` | — | — | Sets the background color of the button when active. | `CoreButton` |
| `--zd-charm-button-active-border-color` | — | — | Sets the border color of the button when active. | `CoreButton` |
| `--zd-charm-button-active-fg-color` | — | — | Sets button's text color when active. | `CoreButton` |
| `--zd-charm-button-active-shadow` | — | — | Sets button's box-shadow when active. | `CoreButton` |
| `--zd-charm-button-bg-color` | — | — | Sets the background color of the button. | `CoreButton` |
| `--zd-charm-button-border-color` | — | — | Sets the border color of the button. | `CoreButton` |
| `--zd-charm-button-border-radius` | — | — | Sets button's border-radius. | `CoreButton` |
| `--zd-charm-button-border-style` | — | — | Sets the border style of the button. | `CoreButton` |
| `--zd-charm-button-border-width` | — | — | Sets the border width of the button. | `CoreButton` |
| `--zd-charm-button-content-alignment` | — | — | Sets the alignment of the button content. | `CoreButton` |
| `--zd-charm-button-content-gap` | — | — | Determines the spacing between the slots. | `CoreButton` |
| `--zd-charm-button-disabled-bg-color` | — | — | Sets the background color of the button when disabled. | `CoreButton` |
| `--zd-charm-button-disabled-border-color` | — | — | Sets the border color of the button when disabled. | `CoreButton` |
| `--zd-charm-button-disabled-cursor` | — | — | Sets the cursor style when disabled. | `CoreButton` |
| `--zd-charm-button-disabled-fg-color` | — | — | Sets button's text color when disabled. | `CoreButton` |
| `--zd-charm-button-disabled-shadow` | — | — | Sets button's box-shadow when disabled. | `CoreButton` |
| `--zd-charm-button-fg-color` | — | — | Sets button's text color. | `CoreButton` |
| `--zd-charm-button-focus-bg-color` | — | — | Sets the background color of the button when focused. | `CoreButton` |
| `--zd-charm-button-focus-border-color` | — | — | Sets the border color of the button when focused. | `CoreButton` |
| `--zd-charm-button-focus-fg-color` | — | — | Sets button's text color when focused. | `CoreButton` |
| `--zd-charm-button-focus-shadow` | — | — | Sets button's box-shadow when focused. | `CoreButton` |
| `--zd-charm-button-font-weight` | — | — | Sets the font weight of the button. | `CoreButton` |
| `--zd-charm-button-hover-bg-color` | — | — | Sets the background color of the button when hovered. | `CoreButton` |
| `--zd-charm-button-hover-border-color` | — | — | Sets the border color of the button when hovered. | `CoreButton` |
| `--zd-charm-button-hover-fg-color` | — | — | Sets button's text color when hovered. | `CoreButton` |
| `--zd-charm-button-hover-shadow` | — | — | Sets button's box-shadow when hovered. | `CoreButton` |
| `--zd-charm-button-icon-padding-x` | — | — | Sets the horizontal padding for icon-only buttons. | `CoreButton` |
| `--zd-charm-button-icon-padding-y` | — | — | Sets the vertical padding for icon-only buttons. | `CoreButton` |
| `--zd-charm-button-icon-size` | — | — | Sets the height and width of the slotted icon and svg. | `CoreButton` |
| `--zd-charm-button-padding-x` | — | — | Determines left and right padding. | `CoreButton` |
| `--zd-charm-button-padding-y` | — | — | Determines top and bottom padding. | `CoreButton` |
| `--zd-charm-button-pressed-bg-color` | — | — | Sets the background color of the button when toggled. | `CoreButton` |
| `--zd-charm-button-pressed-border-color` | — | — | Sets the border color of the button when toggled. | `CoreButton` |
| `--zd-charm-button-pressed-fg-color` | — | — | Sets button's text color when toggled. | `CoreButton` |
| `--zd-charm-button-shadow` | — | — | Sets button's box-shadow. | `CoreButton` |
